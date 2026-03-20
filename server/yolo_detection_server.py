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
from tracker import SortTracker

app = Flask(__name__)
CORS(app)

# Removed duplicate health check from here and consolidation below at line 570.

# 🤖 Global Model Instance
model = None
MODEL_LOADED = False
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

# Initialize the model immediately so it's ready for Gunicorn
MODEL_LOADED = initialize_yolo()

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
    # Clean up redundant strings like "DARK GRAY 2x2_YELLOW"
    # Identity often contains the raw class like "2x2_Yellow"
    
    parts = []
    if color and color != "Unknown": 
        parts.append(color.title())
    
    if dims:
        # If identity has dims, use them, otherwise use heuristic dims
        parts.append(dims)
    
    if family and family not in ["Reject", "Unknown"]:
        parts.append(family)
    
    if not parts: return "Brick"
    
    # Final cleanup: Remove duplicate parts (e.g. "Yellow Yellow Brick")
    unique_parts = []
    for p in parts:
        if p.lower() not in [up.lower() for up in unique_parts]:
            unique_parts.append(p)
            
    return " ".join(unique_parts)

def get_iou(boxA, boxB):
    # box: [x1, y1, x2, y2]
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)
    boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1)
    boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1)
    return interArea / float(boxAArea + boxBArea - interArea)

# Phase 27: Ultra-Magnetic Tracker (5.0s Persistence)
tracker = SortTracker(max_disappeared=150, min_iou=0.15)

def get_tiles(image, tile_size=512, overlap=0.25):
    """Split image into overlapping tiles for dense detection.
    Phase 25: 512px tiles ensure better resolution for small bricks."""
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
    HelloBrick-Style 4-Stage Detection Pipeline
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
        mode = request.form.get('mode', 'live')
        is_capture = mode in ['capture', 'mass_capture']
        
        # --- STAGE 1: PROPOSAL GENERATION ---
        start_time = time.time()
        raw_proposals = []
        debug_metrics = {}

        if is_capture:
            # PART 3/4/5: DENSE CAPTURE DETECTION
            print(f"📸 [STAGE 1] DENSE CAPTURE: resolution=1024")
            
            # Application of Unsharp Mask for maximum clarity
            img_np = np.array(image)
            gaussian = cv2.GaussianBlur(img_np, (0, 0), 2.0)
            sharpened = cv2.addWeighted(img_np, 1.5, gaussian, -0.5, 0)
            image_sharp = Image.fromarray(sharpened)

            # Pass 1: Multi-scale 640
            res640 = model(image_sharp, conf=0.15, imgsz=640, verbose=False)
            for res in res640:
                for i, b in enumerate(res.boxes):
                    mask = res.masks[i].xy[0].tolist() if res.masks is not None else None
                    raw_proposals.append({
                        'box': b.xyxy[0].cpu().numpy().tolist(),
                        'conf': float(b.conf[0].cpu().numpy()),
                        'cls': int(b.cls[0].cpu().numpy()),
                        'mask': mask
                    })
            
            # Pass 2: Multi-scale 1024
            res1024 = model(image, conf=0.35, imgsz=1024, verbose=False)
            for res in res1024:
                for i, b in enumerate(res.boxes):
                    mask = res.masks[i].xy[0].tolist() if res.masks is not None else None
                    raw_proposals.append({
                        'box': b.xyxy[0].cpu().numpy().tolist(),
                        'conf': float(b.conf[0].cpu().numpy()),
                        'cls': int(b.cls[0].cpu().numpy()),
                        'mask': mask
                    })

            # Pass 3: Tiled 2x2 @ 1024
            # We resize image specifically for tiled consistency
            tiled_base = image.resize((1024, 1024))
            scale_x = img_width / 1024.0
            scale_y = img_height / 1024.0
            
            # Divide into 4 tiles (512x512)
            tile_coords = [
                (0, 0, 512, 512), (512, 0, 1024, 512),
                (0, 512, 512, 1024), (512, 512, 1024, 1024)
            ]
            
            for tx1, ty1, tx2, ty2 in tile_coords:
                tile = tiled_base.crop((tx1, ty1, tx2, ty2))
                t_results = model(tile, conf=0.45, imgsz=512, verbose=False)
                for res in t_results:
                    for i, b in enumerate(res.boxes):
                        c = b.xyxy[0].cpu().numpy()
                        # Map back to full image (1024 base) then original scale
                        fx1 = (c[0] + tx1) * scale_x
                        fy1 = (c[1] + ty1) * scale_y
                        fx2 = (c[2] + tx1) * scale_x
                        fy2 = (c[3] + ty1) * scale_y
                        
                        mask = None
                        if res.masks is not None:
                            m = res.masks[i].xy[0] # [N, 2]
                            m[:, 0] = (m[:, 0] + tx1) * scale_x
                            m[:, 1] = (m[:, 1] + ty1) * scale_y
                            mask = m.tolist()

                        raw_proposals.append({
                            'box': [fx1, fy1, fx2, fy2],
                            'conf': float(b.conf[0].cpu().numpy()),
                            'cls': int(b.cls[0].cpu().numpy()),
                            'mask': mask
                        })
            debug_metrics['tiles_processed'] = len(tile_coords)
            
        else:
            # PART 2: LIVE DETECTION (GUIDANCE MODE) - HARD BUILD OUT V2
            # Lowered conf to 0.08 and imgsz to 1024 for extreme distance sensitivity
            live_imgsz = 1024
            
            # Sharpening for Live mode too (Crucial for 5ft distance)
            img_np = np.array(image)
            # Use CLAHE (Contrast Limited Adaptive Histogram Equalization) for better detail in shadows
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            lab = cv2.cvtColor(img_np, cv2.COLOR_RGB2LAB)
            l, a, b = cv2.split(lab)
            l2 = clahe.apply(l)
            lab = cv2.merge((l2, a, b))
            img_np = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
            
            gaussian = cv2.GaussianBlur(img_np, (0, 0), 1.5)
            sharpened = cv2.addWeighted(img_np, 1.6, gaussian, -0.6, 0)
            image_sharp = Image.fromarray(sharpened)

            # Phase 27: Ultra-Stable Floor (0.28 Conf) to kill hallucinations
            print(f"📦 [STAGE 1] LIVE GUIDANCE (ULTRA): imgsz={live_imgsz} conf=0.28")
            results = model(image_sharp, conf=0.28, iou=0.45, imgsz=live_imgsz, agnostic_nms=True, max_det=150, verbose=False)
            for res in results:
                for i, b in enumerate(res.boxes):
                    mask = res.masks[i].xy[0].tolist() if res.masks is not None else None
                    raw_proposals.append({
                        'box': b.xyxy[0].cpu().numpy().tolist(),
                        'conf': float(b.conf[0].cpu().numpy()),
                        'cls': int(b.cls[0].cpu().numpy()),
                        'mask': mask
                    })

        raw_count = len(raw_proposals)
        
        # C1: Box Validation (Drop clearly bad geometry)
        # Phase 25: Ultra-low area threshold for 5ft scanning at 1024px (from 0.0001 to 0.00005)
        frame_area = img_width * img_height
        min_area_threshold = frame_area * 0.0001
        
        valid_proposals = []
        for p in raw_proposals:
            w = p['box'][2] - p['box'][0]
            h = p['box'][3] - p['box'][1]
            area = w * h
            aspect_ratio = w / h if h > 0 else 0
            
            # Strict filters
            if area < min_area_threshold: continue
            if aspect_ratio > 8.0 or aspect_ratio < 0.12: continue
            if w > img_width * 0.7 or h > img_height * 0.7: continue
            
            # Explicit Brick Class Filter (0-26 are known bricks)
            if prop['cls'] < 0 or prop['cls'] > 26: continue
            
            valid_proposals.append(p)
            
        geo_drop = raw_count - len(valid_proposals)
        
        # C2: NMS
        from torchvision.ops import nms
        boxes_t = torch.tensor([p['box'] for p in valid_proposals]) if valid_proposals else torch.empty((0, 4))
        scores_t = torch.tensor([p['conf'] for p in valid_proposals]) if valid_proposals else torch.empty((0,))
        
        refined = []
        if len(valid_proposals) > 0:
            # Phase 25: global nms threshold = 0.5
            keep = nms(boxes_t, scores_t, 0.5) 
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
            class_name = model.names[prop['cls']]
            polygon = prop.get('mask')
            identity_conf = prop['conf']
            
            # Init defaults
            rx1, ry1, rx2, ry2 = x1, y1, x2, y2
            family, dims, dim_conf = "Brick", "", 0.0
            color_name, color_conf = "Unknown", 0.0
            compact_label = class_name
            label_status = 'hidden'
            
            if is_capture:
                # DENSE CAPTURE MODE: Run full heavy attribute pipeline
                # Step 6: Refine BBox (Tighten)
                bbox_dict = refine_bbox_contours(image, initial_bbox)
                rx1, ry1 = bbox_dict['x'], bbox_dict['y']
                rx2, ry2 = rx1 + bbox_dict['width'], ry1 + bbox_dict['height']
                
                # Step 8: Dimension & Family Heuristics
                family, dims, dim_conf = infer_brick_attributes(bbox_dict, class_name, polygon)
                if family != "Reject": dim_count += 1
                if family == "Reject" and not request.form.get('debugMode'): continue
                
                # Step 7: Central LAB Color
                color_name, color_conf = detect_color_lab_v3(image, bbox_dict, polygon)
                if color_name != 'Unknown': color_count += 1
                
                if identity_conf > 0.5: identity_count += 1
                compact_label = generate_compact_label(color_name, family, dims, class_name)
                
                # 0.60 Confidence Threshold requirement for capture
                label_status = 'confirmed' if identity_conf >= 0.60 else 'tentative'
                if identity_conf < 0.01: label_status = 'hidden'
            else:
                # FAST AR MODE: Skip heavy OpenCV and LAB loops
                label_status = 'confirmed' # Trust the 0.35 live filter natively
                if prop['conf'] > 0.5: identity_count += 1

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

        # --- STAGE 4: TRACKING & STABILIZATION ---
        tracked_objs_map = tracker.update(raw_rects)
        tracked_objects = []
        
        for tid, t_bbox in tracked_objs_map.items():
            # Find the best current detection for this track to get latest attributes
            best_det = None
            max_iou = 0.4
            
            for det in detections:
                d_bbox = [det['geometry']['bbox']['xMin'], det['geometry']['bbox']['yMin'], 
                          det['geometry']['bbox']['xMax'], det['geometry']['bbox']['yMax']]
                iou = get_iou(t_bbox, d_bbox)
                if iou > max_iou:
                    max_iou = iou
                    best_det = det
            
            if best_det:
                best_det['trackId'] = tid
                tracked_objects.append({
                    'trackId': tid,
                    'stableGeometry': {
                        'bbox': {
                            'xMin': t_bbox[0], 'yMin': t_bbox[1],
                            'xMax': t_bbox[2], 'yMax': t_bbox[3]
                        },
                        'geometryConfidence': best_det['geometry']['geometryConfidence']
                    },
                    'consensusBrickName': best_det['compactLabel'],
                    'labelDisplayStatus': best_det['labelDisplayStatus'],
                    'identityConfidence': best_det['prediction']['identityConfidence'],
                    'consensusColorName': best_det['prediction']['brickColorName'],
                    'consensusBrickFamily': best_det['prediction']['brickFamily'],
                    'consensusDimensionsLabel': best_det['prediction']['dimensionsLabel']
                })
            elif not is_capture:
                # Part 1: Grace period persistence (locked box)
                # If it's live mode and we lost the detection, show the predicted/smoothed box
                # with placeholders for labels to prevent flicker
                tracked_objects.append({
                    'trackId': tid,
                    'stableGeometry': {
                        'bbox': {
                            'xMin': t_bbox[0], 'yMin': t_bbox[1],
                            'xMax': t_bbox[2], 'yMax': t_bbox[3]
                        },
                        'geometryConfidence': 0.5
                    },
                    'consensusBrickName': "...",
                    'labelDisplayStatus': "hidden",
                    'identityConfidence': 0.0,
                    'consensusColorName': "Unknown",
                    'consensusBrickFamily': "Unknown",
                    'consensusDimensionsLabel': ""
                })

        debug_metrics.update({
            'raw': raw_count,
            'valid_geo': len(valid_proposals),
            'after_nms': len(refined),
            'nms_removed_boxes': nms_drop,
            'final': len(detections),
            'live_detections_count': len(detections) if not is_capture else 0,
            'capture_detections_count': len(detections) if is_capture else 0,
            'tracked_bricks_count': len(tracked_objects)
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
            'debug': debug_metrics
        })

    except Exception as e:
        print(f"❌ [PIPELINE] Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Canonical health check for production"""
    return jsonify({
        'status': 'ok' if MODEL_LOADED else 'error',
        'model_loaded': MODEL_LOADED,
        'timestamp': time.time(),
        'version': 'v1.1-production'
    })

@app.route('/api/user/xp', methods=['GET'])
def get_user_xp():
    """Mock XP endpoint for Build 1.3.1"""
    return jsonify({
        'xp': 1250,
        'level': 5,
        'next_level_xp': 2500,
        'rank': 'Senior Builder'
    })

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Mock Profile endpoint for Build 1.3.1"""
    return jsonify({
        'id': 'user_1774009545551_u0ujlp63j',
        'username': 'BrickMaster',
        'avatar_url': '',
        'created_at': '2026-03-20T12:25:46Z'
    })

if __name__ == '__main__':
    # When running manually, we still ensure it's loaded
    if not MODEL_LOADED:
        MODEL_LOADED = initialize_yolo()
    app.run(host='::', port=3003, debug=False)
