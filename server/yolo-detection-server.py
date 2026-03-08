#!/usr/bin/env python3
"""
YOLOv8 Detection Server for HelloBrick
Handles brick detection requests from the frontend
Uses YOLOv8 trained on LEGO brick dataset
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from PIL import Image
import io
import numpy as np
from ultralytics import YOLO
import cv2
import os
import time
from pathlib import Path

app = Flask(__name__)
CORS(app)

model = None
MODEL_PATHS = [
    "/Users/akeemojuko/lego_training_workspace/lego_training/yolov8_real_v1/weights/best.pt", # High-quality dataset weights
    "models/yolo8_lego.pt",       # Trained LEGO Detection model
    "models/yolo8_lego_seg.pt",   # Trained LEGO Segmentation model
    "yolov8n-seg.pt"              # Fallback
]

def initialize_yolo(model_path=None):
    """Initialize YOLO model from available paths"""
    global model
    
    if model_path and os.path.exists(model_path):
        try:
            print(f"📦 Loading model from: {model_path}")
            model = YOLO(model_path)
            print(f"✅ Model loaded successfully: {model_path}")
            return True
        except Exception as e:
            print(f"❌ Failed to load {model_path}: {e}")
            return False
    
    # Try each path in order
    for path in MODEL_PATHS:
        if os.path.exists(path):
            try:
                print(f"📦 Loading model from: {path}")
                model = YOLO(path)
                print(f"✅ Model loaded successfully: {path}")
                return True
            except Exception as e:
                print(f"⚠️  Failed to load {path}: {e}")
                continue
    
    print("❌ No YOLO model found!")
    return False

# 🔒 CANONICAL COLOR PROFILES - LAB Truth
LEGO_COLOR_PROFILES = [
    {'name': 'Red', 'lab': [53, 60, 40], 'threshold': 18},
    {'name': 'Blue', 'lab': [32, 10, -55], 'threshold': 18},
    {'name': 'Yellow', 'lab': [88, -5, 75], 'threshold': 15},
    {'name': 'Green', 'lab': [46, -40, 30], 'threshold': 18},
    {'name': 'White', 'lab': [100, 0, 0], 'threshold': 12},
    {'name': 'Black', 'lab': [15, 0, 0], 'threshold': 10},
    {'name': 'Orange', 'lab': [65, 45, 60], 'threshold': 15},
    {'name': 'Brown', 'lab': [35, 15, 25], 'threshold': 15},
]

def detect_color_lab_v2(image, bbox, polygon=None):
    """Resolve color using LAB median inside the actual plastic area."""
    try:
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        mask = None
        
        if polygon is not None and len(polygon) > 2:
            mask = np.zeros(img_cv.shape[:2], dtype=np.uint8)
            pts = np.array(polygon, dtype=np.int32)
            cv2.fillPoly(mask, [pts], 255)
        else:
            x, y, w, h = int(bbox['x']), int(bbox['y']), int(bbox['width']), int(bbox['height'])
            cx1 = x + w // 4
            cy1 = y + h // 4
            cx2 = x + 3 * w // 4
            cy2 = y + 3 * h // 4
            mask = np.zeros(img_cv.shape[:2], dtype=np.uint8)
            cv2.rectangle(mask, (cx1, cy1), (cx2, cy2), 255, -1)

        lab_img = cv2.cvtColor(img_cv, cv2.COLOR_BGR2LAB)
        mean_lab = cv2.mean(lab_img, mask=mask)[:3]
        
        best_color = 'Unknown'
        max_conf = 0.0
        
        for profile in LEGO_COLOR_PROFILES:
            dist = np.sqrt(sum((a - b) ** 2 for a, b in zip(mean_lab, profile['lab'])))
            conf = max(0.0, 1.0 - (dist / profile['threshold']))
            
            if conf > max_conf:
                max_conf = conf
                best_color = profile['name']
        
        return best_color, round(max_conf, 2)
    except Exception as e:
        print(f"Color detection error v2: {e}")
        return 'Unknown', 0.0

def validate_shape(class_name, bbox, polygon=None):
    """Validate if the detected geometry matches visual rules."""
    width = bbox['width']
    height = bbox['height']
    aspect_ratio = max(width, height) / max(min(width, height), 1)
    
    if '2x4' in class_name and aspect_ratio < 1.4:
        return False, "Aspect ratio too square for 2x4"
    if '2x2' in class_name and aspect_ratio > 1.6:
        return False, "Aspect ratio too rectangular for 2x2"
        
    return True, None

def infer_brick_attributes(bbox, polygon=None):
    """Stage 2 Refinement: Infer dimensions and brick family."""
    w, h = bbox['width'], bbox['height']
    aspect_ratio = max(w, h) / max(min(w, h), 1.0)
    
    family = "Brick"
    dims = "2x2"
    conf = 0.5

    if 0.8 <= aspect_ratio <= 1.2:
        dims = "2x2"
        conf = 0.7
    elif 1.8 <= aspect_ratio <= 2.2:
        dims = "2x4"
        conf = 0.7
    elif 3.8 <= aspect_ratio <= 4.2:
        dims = "1x4"
        conf = 0.6
    elif aspect_ratio > 4.5:
        dims = "1x6"
        conf = 0.5
        
    if aspect_ratio > 3.0:
        family = "Plate"
        
    return family, dims, conf

def generate_compact_label(color, family, dims, identity):
    parts = []
    if color and color != "Unknown": parts.append(color)
    if family: parts.append(family)
    if dims: parts.append(dims)
    
    if not parts: return "Brick"
    return " ".join(parts)

class CentroidTracker:
    def __init__(self, max_disappeared=5):
        self.next_object_id = 0
        self.objects = {}  # id: centroid
        self.disappeared = {}
        self.max_disappeared = max_disappeared

    def register(self, centroid):
        self.objects[self.next_object_id] = centroid
        self.disappeared[self.next_object_id] = 0
        self.next_object_id += 1
        return self.next_object_id - 1

    def deregister(self, object_id):
        del self.objects[object_id]
        del self.disappeared[object_id]

    def update(self, rects):
        if len(rects) == 0:
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self.deregister(object_id)
            return self.objects

        input_centroids = np.zeros((len(rects), 2), dtype="int")
        for (i, (x1, y1, x2, y2)) in enumerate(rects):
            cX = int((x1 + x2) / 2.0)
            cY = int((y1 + y2) / 2.0)
            input_centroids[i] = (cX, cY)

        if len(self.objects) == 0:
            for i in range(0, len(input_centroids)):
                self.register(input_centroids[i])
        else:
            object_ids = list(self.objects.keys())
            object_centroids = list(self.objects.values())
            
            D = np.linalg.norm(np.array(object_centroids)[:, np.newaxis] - input_centroids, axis=2)
            rows = D.min(axis=1).argsort()
            cols = D.argmin(axis=1)[rows]

            used_rows = set()
            used_cols = set()

            for (row, col) in zip(rows, cols):
                if row in used_rows or col in used_cols:
                    continue
                
                object_id = object_ids[row]
                self.objects[object_id] = input_centroids[col]
                self.disappeared[object_id] = 0
                
                used_rows.add(row)
                used_cols.add(col)

            unused_rows = set(range(0, D.shape[0])).difference(used_rows)
            unused_cols = set(range(0, D.shape[1])).difference(used_cols)

            if D.shape[0] >= D.shape[1]:
                for row in unused_rows:
                    object_id = object_ids[row]
                    self.disappeared[object_id] += 1
                    if self.disappeared[object_id] > self.max_disappeared:
                        self.deregister(object_id)
            else:
                for col in unused_cols:
                    self.register(input_centroids[col])

        return self.objects

tracker = CentroidTracker()

@app.route('/api/detect', methods=['POST'])
def detect_bricks():
    """Canonical Three-Stage Detection Pipeline"""
    try:
        if model is None:
            return jsonify({'error': 'Model not initialized'}), 500
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_width, img_height = image.size
        
        # --- STAGE 1: BRICK PRESENCE (HIGH RECALL) ---
        # Increased imgsz to 800 for better distance detection
        start_time = time.time()
        results = model(image, conf=0.10, iou=0.45, imgsz=800)
        inference_ms = int((time.time() - start_time) * 1000)
        
        detections = []
        raw_rects = []
        
        for result in results:
            boxes = result.boxes
            masks = result.masks if hasattr(result, 'masks') else None
            
            for i, box in enumerate(boxes):
                coords = box.xyxy[0].cpu().numpy()
                geo_conf = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                class_name = model.names[class_id] if hasattr(model, 'names') else str(class_id)
                
                raw_rects.append(coords)
                
                # --- STAGE 2: STRUCTURAL REFINEMENT ---
                x1, y1, x2, y2 = coords
                bbox_dict = {'x': float(x1), 'y': float(y1), 'width': float(x2-x1), 'height': float(y2-y1)}
                polygon = masks.xy[i].tolist() if masks is not None and i < len(masks.xy) else None
                
                # Refined stage 2 attributes
                family_raw, dims, dim_conf = infer_brick_attributes(bbox_dict, polygon)
                color_name, color_conf = detect_color_lab_v2(image, bbox_dict, polygon)
                
                # Logic to distinguish Tile vs Plate (Stud Check)
                # If the area is very flat and we don't see small circles (studs), it's a tile
                family = family_raw
                if family == "Plate" and geo_conf > 0.4:
                   # Heuristic: Tiles are smoother. 
                   # For now, if "Tile" is in the class name, trust it.
                   if "tile" in class_name.lower():
                       family = "Tile"
                
                # --- STAGE 3: IDENTITY REFINEMENT ---
                is_valid, reason = validate_shape(class_name, bbox_dict, polygon)
                identity_conf = geo_conf if is_valid else (geo_conf * 0.4)
                
                # Canonical Label Construction: "Color Family Dimensions"
                compact_label = generate_compact_label(color_name, family, dims, class_name)
                
                label_status = 'tentative'
                if geo_conf >= 0.6 and identity_conf >= 0.6: # Slightly lowered for 1ft ease
                    label_status = 'confirmed'
                elif geo_conf < 0.10: 
                    label_status = 'hidden'
                elif not is_valid:
                    label_status = 'needs_review'

                detections.append({
                    'detectionId': f'det_{i}_{int(time.time()*1000)}',
                    'detectionIndex': i,
                    'trackId': '', 
                    'geometry': {
                        'type': 'polygon' if polygon else 'bbox_xyxy',
                        'bbox': {
                            'format': 'xyxy', 'space': 'pixel',
                            'xMin': float(x1), 'yMin': float(y1), 'xMax': float(x2), 'yMax': float(y2)
                        },
                        'polygon': [{'x': p[0], 'y': p[1]} for p in polygon] if polygon else None,
                        'geometryConfidence': round(geo_conf, 2)
                    },
                    'prediction': {
                        'brickName': class_name,
                        'brickFamily': family,
                        'dimensionsLabel': dims,
                        'brickColorName': color_name,
                        'identityConfidence': round(identity_conf, 2),
                        'colorConfidence': round(color_conf, 2),
                        'dimensionConfidence': round(dim_conf, 2),
                        'rawModelClass': class_name,
                        'rawModelConfidence': round(geo_conf, 2)
                    },
                    'compactLabel': compact_label,
                    'candidates': [
                        {'rank': 1, 'brickName': class_name, 'identityConfidence': round(identity_conf, 2), 'colorConfidence': round(color_conf, 2)}
                    ],
                    'quality': {
                        'aspectRatio': round(bbox_dict['width'] / max(bbox_dict['height'], 1), 2),
                        'isValid': is_valid,
                        'reason': reason
                    },
                    'reviewStatus': 'unreviewed',
                    'labelDisplayStatus': label_status
                })

        # Update Tracker
        tracked_objs_map = tracker.update(raw_rects)
        
        # 🔒 Canonical Alignment: Build trackedObjects with consensus fields
        tracked_objects = []
        for det in detections:
            bbox = det['geometry']['bbox']
            centroid = (int((bbox['xMin'] + bbox['xMax']) / 2), int((bbox['yMin'] + bbox['yMax']) / 2))
            
            best_tid = None
            min_dist = 50 
            for tid, t_centroid in tracked_objs_map.items():
                dist = np.linalg.norm(np.array(centroid) - np.array(t_centroid))
                if dist < min_dist:
                    min_dist = dist
                    best_tid = str(tid)
            
            det['trackId'] = best_tid if best_tid else ''
            
            # If we have a trackId, add to trackedObjects array as well
            if best_tid:
                tracked_objects.append({
                    'trackedObjectId': det['detectionId'],
                    'trackId': det['trackId'],
                    'status': 'active',
                    'totalFramesSeen': 1, # Minimal for now
                    'stableGeometry': det['geometry'],
                    'geometryConfidence': det['geometry']['geometryConfidence'],
                    'identityConfidence': det['prediction']['identityConfidence'],
                    'colorConfidence': det['prediction']['colorConfidence'],
                    'dimensionConfidence': det['prediction']['dimensionConfidence'],
                    'consensusColorName': det['prediction']['brickColorName'],
                    'consensusBrickFamily': det['prediction']['brickFamily'],
                    'consensusDimensionsLabel': det['prediction']['dimensionsLabel'],
                    'consensusPartNum': '',
                    'consensusBrickName': det['prediction']['brickName'],
                    'compactLabel': det['compactLabel'],
                    'labelDisplayStatus': det['labelDisplayStatus']
                })

        return jsonify({
            'sessionId': request.form.get('sessionId', 'manual_session'),
            'frameId': f'f_{int(time.time()*1000)}',
            'frameIndex': int(request.form.get('frameIndex', 0)),
            'frameWidth': img_width,
            'frameHeight': img_height,
            'modelVersion': 'v8_three_stage_v3_canonical',
            'trackedObjects': tracked_objects, 
            'detections': detections,
            'inferenceMs': inference_ms
        })

    except Exception as e:
        print(f"❌ Detection error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

if __name__ == '__main__':
    initialize_yolo()
    app.run(host='0.0.0.0', port=3003, debug=False)
