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

from config import STABILITY_CONFIG

app = Flask(__name__)
CORS(app)

model = None
MODEL_PATHS = [
    STABILITY_CONFIG["model_path"],
    "server/models/yolo11_lego.pt",
    "server/models/yolo8_lego.pt",
    "yolov8n-seg.pt"
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

def detect_color_lab_v3(image, bbox, polygon=None):
    """Step 7: Resolve color using LAB central pixels of the plastic area."""
    try:
        img_np = np.array(image)
        img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        h_img, w_img = img_cv.shape[:2]
        
        x1, y1 = int(max(0, bbox['x'])), int(max(0, bbox['y']))
        x2, y2 = int(min(w_img, x1 + bbox['width'])), int(min(h_img, y1 + bbox['height']))
        
        # Step 7: Sample central 25% of the detection to avoid background
        # (This is more robust than 40% when boxes aren't perfectly tight yet)
        cw = (x2 - x1)
        ch = (y2 - y1)
        cx1 = x1 + int(cw * 0.37)
        cx2 = x1 + int(cw * 0.63)
        cy1 = y1 + int(ch * 0.37)
        cy2 = y1 + int(ch * 0.63)
        
        roi = img_cv[cy1:cy2, cx1:cx2]
        if roi.size == 0: return 'Unknown', 0.0
        
        lab_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB)
        mean_lab = cv2.mean(lab_roi)[:3]
        
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
        print(f"Color detection error v3: {e}")
        return 'Unknown', 0.0

def refine_bbox_contours(image, bbox):
    """Step 6: Tighten box using OpenCV contours/edges."""
    try:
        img_np = np.array(image)
        img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        h_img, w_img = img_cv.shape[:2]
        
        x1, y1 = int(max(0, bbox['x'])), int(max(0, bbox['y']))
        x2, y2 = int(min(w_img, x1 + bbox['width'])), int(min(h_img, y1 + bbox['height']))
        
        # Buffer the crop slightly to find edges
        pad = 5
        cx1, cy1 = max(0, x1 - pad), max(0, y1 - pad)
        cx2, cy2 = min(w_img, x2 + pad), min(h_img, y2 + pad)
        
        crop = img_cv[cy1:cy2, cx1:cx2]
        if crop.size == 0: return bbox
        
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours: return bbox
        
        # Merge all significant contours
        all_pts = np.vstack([c for c in contours if cv2.contourArea(c) > 10])
        if all_pts.size == 0: return bbox
        
        rx, ry, rw, rh = cv2.boundingRect(all_pts)
        
        # Final absolute coordinates
        return {
            'x': float(cx1 + rx),
            'y': float(cy1 + ry),
            'width': float(rw),
            'height': float(rh)
        }
    except Exception:
        return bbox

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

def infer_brick_attributes(bbox, class_name, polygon=None):
    """Stage 2 Refinement: Infer dimensions and brick family from geometry and label."""
    w, h = bbox['width'], bbox['height']
    aspect_ratio = max(w, h) / max(min(w, h), 1.0)
    
    # --- PHYSICAL SANITY CHECKS ---
    # 1. Extreme Aspect Ratio: Bricks are rarely > 8x longer than wide.
    # Giant horizontal boxes often have AR > 10.
    if aspect_ratio > 8.0:
        return "Reject", "Invalid", 0.0
    
    # 2. Absurd Size: A brick shouldn't fill > 80% of the screen if we're scanning multiple.
    # This helps filter out "screen-size" false positives.
    if w > 600 or h > 600:
        return "Reject", "Too Large", 0.0

    family = "Brick"
    dims = "2x2"
    conf = 0.5
    
    # Try to extract from class_name
    cn = class_name.lower()
    
    if "plate" in cn: family = "Plate"
    elif "tile" in cn: family = "Tile"
    elif "brick" in cn: family = "Brick"
    elif aspect_ratio > 3.0: family = "Plate"

    import re
    dim_match = re.search(r'(\d+)x(\d+)', cn)
    if dim_match:
        dims = f"{dim_match.group(1)}x{dim_match.group(2)}"
        conf = 0.9
    else:
        # Geometry fallback
        if 0.8 <= aspect_ratio <= 1.2:
            dims = "2x2"
            conf = 0.7
        elif 1.8 <= aspect_ratio <= 2.2:
            dims = "2x4"
            conf = 0.7
        
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

def get_tiles(image, tile_size=640, overlap=0.15):
    """Split image into overlapping tiles for dense detection."""
    w, h = image.size
    stride = int(tile_size * (1 - overlap))
    
    tiles = []
    for y in range(0, max(1, h - tile_size + stride), stride):
        for x in range(0, max(1, w - tile_size + stride), stride):
            x_end = min(x + tile_size, w)
            y_end = min(y + tile_size, h)
            x_start = max(0, x_end - tile_size)
            y_start = max(0, y_end - tile_size)
            
            box = (x_start, y_start, x_end, y_end)
            tile = image.crop(box)
            tiles.append({'image': tile, 'offset': (x_start, y_start)})
            if x_end == w: break
        if y_end == h: break
    return tiles

@app.route('/api/detect', methods=['POST'])
def detect():
    """
    Brickit-Style 4-Stage Detection Pipeline
    1. Dense Proposal (Tiling + High Recall)
    2. Geometry Refinement (Global NMS + Size Filter)
    3. Attribute Refinement (Color/Family/Dimensions)
    4. Scene Inventory (Consensus/Persistence)
    """
    print("🔍 [PIPELINE] Starting 4-stage detection")
    try:
        if model is None:
            return jsonify({'error': 'Model not initialized'}), 500
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_width, img_height = image.size
        
        # Mode separation
        is_mass_capture = request.form.get('mode') == 'mass_capture'
        requested_imgsz = int(request.form.get('imgsz', STABILITY_CONFIG["imgsz"]))
        
        # --- STAGE 1: DENSE PROPOSAL GENERATION ---
        start_time = time.time()
        raw_proposals = []
        
        if is_mass_capture:
            # Step 2: High Resolution Capture (1600-2048)
            capture_imgsz = max(1600, requested_imgsz)
            print(f"📦 [STAGE A/B] MASS CAPTURE: imgsz={capture_imgsz} Size={img_width}x{img_height}")
            tiles = get_tiles(image, tile_size=640, overlap=0.30) 
            for tile in tiles:
                # DENSE RECALL SETTINGS (High overlap, low conf)
                tile_results = model(tile['image'], conf=0.01, iou=0.25, imgsz=capture_imgsz, agnostic_nms=True, max_det=1000, verbose=False)
                for res in tile_results:
                    for i, b in enumerate(res.boxes):
                        c = b.xyxy[0].cpu().numpy()
                        off_x, off_y = tile['offset']
                        raw_proposals.append({
                            'box': [float(c[0] + off_x), float(c[1] + off_y), float(c[2] + off_x), float(c[3] + off_y)],
                            'conf': float(b.conf[0].cpu().numpy()),
                            'cls': int(b.cls[0].cpu().numpy()),
                            'mask': res.masks.xy[i].tolist() if hasattr(res, 'masks') and res.masks is not None else None
                        })
        else:
            # Step 2: Live resolution (1280+)
            live_imgsz = max(1280, requested_imgsz)
            print(f"📦 [STAGE A/B] LIVE PREVIEW: imgsz={live_imgsz} Size={img_width}x{img_height}")
            # TEMPORARY PERMISSIVE SETTINGS FOR DEBUGGING (Step 11)
            results = model(image, conf=0.01, iou=0.30, imgsz=live_imgsz, agnostic_nms=True, max_det=1000, verbose=False)
            for res in results:
                for i, b in enumerate(res.boxes):
                    raw_proposals.append({
                        'box': b.xyxy[0].cpu().numpy().tolist(),
                        'conf': float(b.conf[0].cpu().numpy()),
                        'cls': int(b.cls[0].cpu().numpy()),
                        'mask': res.masks.xy[i].tolist() if hasattr(res, 'masks') and res.masks is not None else None
                    })

        raw_count = len(raw_proposals)
        
        # C1: Box Validation (Drop clearly bad geometry)
        valid_proposals = [p for p in raw_proposals if (p['box'][2]-p['box'][0]) < img_width * 0.98]
        geo_drop = raw_count - len(valid_proposals)
        
        # C2: NMS
        from torchvision.ops import nms
        boxes_t = torch.tensor([p['box'] for p in valid_proposals]) if valid_proposals else torch.empty((0, 4))
        scores_t = torch.tensor([p['conf'] for p in valid_proposals]) if valid_proposals else torch.empty((0,))
        
        refined = []
        if len(valid_proposals) > 0:
            keep = nms(boxes_t, scores_t, 0.35) # Slightly less aggressive NMS for debug
            refined = [valid_proposals[i] for i in keep]
        
        nms_drop = len(valid_proposals) - len(refined)
        print(f"📊 [PIPELINE] Raw: {raw_count} | Geo-Drop: {geo_drop} | NMS-Drop: {nms_drop} | Final: {len(refined)}")

        detections = []
        raw_rects = []
        
        # --- STAGE E: ATTRIBUTE PIPELINE INSTRUMENTATION ---
        color_count = 0
        dim_count = 0
        identity_count = 0

        for i, prop in enumerate(refined):
            x1, y1, x2, y2 = prop['box']
            initial_bbox = {'x': x1, 'y': y1, 'width': x2-x1, 'height': y2-y1}
            
            # Step 6: Refine BBox (Tighten)
            bbox_dict = refine_bbox_contours(image, initial_bbox)
            rx1, ry1 = bbox_dict['x'], bbox_dict['y']
            rx2, ry2 = rx1 + bbox_dict['width'], ry1 + bbox_dict['height']
            
            class_name = model.names[prop['cls']]
            polygon = prop['mask']
            
            # Step 8: Dimension & Family Heuristics
            family, dims, dim_conf = infer_brick_attributes(bbox_dict, class_name, polygon)
            if family != "Reject": dim_count += 1
            if family == "Reject" and not request.form.get('debugMode'): continue
            
            # Step 7: Central LAB Color (Step 7)
            color_name, color_conf = detect_color_lab_v3(image, bbox_dict, polygon)
            if color_name != 'Unknown': color_count += 1
            
            identity_conf = prop['conf']
            if identity_conf > 0.5: identity_count += 1

            compact_label = generate_compact_label(color_name, family, dims, class_name)
            
            # Step 10/12: Gating & Speculative Display
            label_status = 'confirmed' if identity_conf >= 0.60 else 'tentative'
            if identity_conf < 0.01: label_status = 'hidden' # Show almost everything in debug

            detections.append({
                'detectionId': f'det_{i}_{int(time.time()*1000)}',
                'trackId': '',
                'geometry': {
                    'type': 'bbox_xyxy',
                    'bbox': {
                        'format': 'xyxy', 'space': 'pixel',
                        'xMin': float(rx1), 'yMin': float(ry1), 'xMax': float(rx2), 'yMax': float(ry2)
                    },
                    'polygon': [{'x': p[0], 'y': p[1]} for p in polygon] if polygon else None,
                    'geometryConfidence': round(prop['conf'], 3)
                },
                'prediction': {
                    'brickName': class_name, 'brickFamily': family, 'dimensionsLabel': dims,
                    'brickColorName': color_name, 'identityConfidence': round(identity_conf, 3),
                    'colorConfidence': round(color_conf, 3), 'dimensionConfidence': round(dim_conf, 3)
                },
                'compactLabel': compact_label,
                'labelDisplayStatus': label_status
            })
            raw_rects.append([rx1, ry1, rx2, ry2])

        # --- STAGE 4: SCENE INVENTORY & TRACKING ---
        tracked_objs_map = tracker.update(raw_rects)
        tracked_objects = []
        
        for det in detections:
            bbox = det['geometry']['bbox']
            centroid = (int((bbox['xMin'] + bbox['xMax']) / 2), int((bbox['yMin'] + bbox['yMax']) / 2))
            
            best_tid = None
            min_dist = 60
            for tid, t_centroid in tracked_objs_map.items():
                dist = np.linalg.norm(np.array(centroid) - np.array(t_centroid))
                if dist < min_dist:
                    min_dist = dist
                    best_tid = str(tid)
            
            det['trackId'] = best_tid or ''
            if best_tid:
                tracked_objects.append({
                    'trackId': best_tid,
                    'stableGeometry': det['geometry'],
                    'consensusBrickName': det['compactLabel'],
                    'labelDisplayStatus': det['labelDisplayStatus'],
                    'geometryConfidence': det['geometry']['geometryConfidence'],
                    'identityConfidence': det['prediction']['identityConfidence'],
                    'consensusColorName': det['prediction']['brickColorName'],
                    'consensusBrickFamily': det['prediction']['brickFamily'],
                    'consensusDimensionsLabel': det['prediction']['dimensionsLabel']
                })

        inference_ms = int((time.time() - start_time) * 1000)
        print(f"✅ [PIPELINE] Done: Raw={raw_count}, Final={len(detections)}, Color={color_count}, Dim={dim_count}, Identity={identity_count}")
        
        return jsonify({
            'sessionId': request.form.get('sessionId', 'session_dense'),
            'frameId': f'f_{int(time.time()*1000)}',
            'frameIndex': int(request.form.get('frameIndex', 0)),
            'frameWidth': img_width,
            'frameHeight': img_height,
            'modelVersion': 'v8_diagnostic_v1',
            'trackedObjects': tracked_objects,
            'detections': detections,
            'inferenceMs': inference_ms,
            'debug': {
                'raw': raw_count,
                'valid_geo': len(valid_proposals),
                'after_nms': len(refined),
                'final': len(detections),
                'color_estimates': color_count,
                'dim_estimates': dim_count,
                'identity_estimates': identity_count
            }
        })

    except Exception as e:
        print(f"❌ [PIPELINE] Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

if __name__ == '__main__':
    initialize_yolo()
    app.run(host='0.0.0.0', port=3003, debug=False)
