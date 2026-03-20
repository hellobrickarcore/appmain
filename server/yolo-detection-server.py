#!/usr/bin/env python3
"""
YOLOv8 Detection Server for HelloBrick
Handles brick detection requests from the frontend
Uses YOLOv8 trained on LEGO brick dataset
"""

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
from PIL import Image
import io
import numpy as np
from ultralytics import YOLO
from torchvision.ops import nms
import cv2
import os
import time
from pathlib import Path

from config import STABILITY_CONFIG

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

def preprocess_for_white_sensitivity(image):
    """
    PART 2: Enhance white brick visibility for capture mode.
    - LAB contrast enhancement (CLAHE)
    - Normalize exposure on bright regions
    """
    try:
        img_np = np.array(image)
        img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        
        # Convert to LAB for luminance-aware enhancement
        lab = cv2.cvtColor(img_cv, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L-channel for local contrast
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        
        # Gamma correction to pull details out of shadows/highlights
        gamma = 1.2 # slightly brighten to see white brick edges
        invGamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** invGamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        cl = cv2.LUT(cl, table)

        limg = cv2.merge((cl,a,b))
        final_cv = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        
        return Image.fromarray(cv2.cvtColor(final_cv, cv2.COLOR_BGR2RGB)), True
    except Exception as e:
        print(f"⚠️ Preprocessing error: {e}")
        return image, False

def detect_studs_in_crop(crop_cv):
    """
    PART 5: Detect LEGO studs in a crop to infer dimensions.
    Returns: (rows, cols, confidence)
    """
    try:
        if crop_cv is None or crop_cv.size < 100:
            return 0, 0, 0.0
            
        gray = cv2.cvtColor(crop_cv, cv2.COLOR_BGR2GRAY)
        # Focus on circular studs
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # adaptive thresholding helps with white bricks on dark backgrounds
        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
        
        # Hough Circles for stud candidates
        circles = cv2.HoughCircles(
            blurred, cv2.HOUGH_GRADIENT, dp=1.2, minDist=15,
            param1=50, param2=25, minRadius=4, maxRadius=25
        )
        
        if circles is not None:
            num_studs = len(circles[0])
            h, w = crop_cv.shape[:2]
            aspect_ratio = max(w, h) / max(min(w, h), 1.0)
            
            # Simple heuristic mapping for common bricks
            # In a full prod version we'd use a spatial grid classifier
            if 0.8 <= aspect_ratio <= 1.2:
                if 3 <= num_studs <= 5: return 2, 2, 0.85
                if num_studs <= 2: return 1, 1, 0.7
            elif 1.8 <= aspect_ratio <= 2.4:
                if 6 <= num_studs <= 10: return 2, 4, 0.85
                if 2 <= num_studs <= 4: return 1, 4, 0.7 # or 2x2 edge view
            elif 2.8 <= aspect_ratio <= 3.4:
                if 3 <= num_studs <= 8: return 1, 6, 0.7
                
            return 0, 0, 0.4 # Detected studs but uncertain layout
            
        return 0, 0, 0.0
    except Exception:
        return 0, 0, 0.0

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
    return True, None

def verify_lego_geometry(bbox, class_name, aspect_ratio):
    """
    HELLOBRICK DOMAIN RULE: Reject obvious non-LEGO systems.
    - Large toddler blocks (Mega Bloks size mismatch)
    - Extreme aspect ratios
    - Overall scale consistency
    """
    w, h = bbox['width'], bbox['height']
    area = w * h
    
    # 1. Mega Bloks / Toddler Brick rejection (Oversized studs/proportions)
    # INCREASED from 450 to 800 to handle high-resolution close-ups
    if w > 800 or h > 800:
        return False, "oversized_non_lego"
        
    # 2. Proportion check (Lego bricks follow fixed ratios: 1x, 2x, etc)
    is_brick = "brick" in class_name.lower()
    if is_brick:
        if aspect_ratio < 0.8 or aspect_ratio > 4.2:
            return False, "malformed_ratio_brick"
    else:
        # Plates/Tiles can be thinner
        if aspect_ratio > 6.5:
            return False, "malformed_ratio_special"
            
    # 3. Micro-fragment rejection
    if area < 100:
        return False, "too_small"
        
    return True, "valid_lego_geometry"

def classify_lego_brand(detector_conf, geometry_score):
    """
    Stage 2 Brand Verifier.
    Categorizes into official_lego, non_lego, uncertain_lego_like.
    """
    # Multi-factor brand score
    brand_score = (detector_conf * 0.7) + (geometry_score * 0.3)
    
    if brand_score > 0.88:
        return "official_lego", brand_score
    elif brand_score > 0.65:
        return "uncertain_lego_like", brand_score
    else:
        return "non_lego", brand_score

def infer_brick_attributes(image, bbox, class_name, polygon=None):
    """Stage 2 Refinement: Infer dimensions and brick family from geometry and label."""
    w, h = bbox['width'], bbox['height']
    aspect_ratio = max(w, h) / max(min(w, h), 1.0)
    
    # --- PHYSICAL SANITY CHECKS ---
    res, reason = verify_lego_geometry(bbox, class_name, aspect_ratio)
    if not res:
        return "Reject", reason, 0.0, 0, 0
    
    family = "Brick"
    dims = "2x2"
    conf = 0.5
    stud_rows, stud_cols = 0, 0
    
    # 1. Try Stud Counting for high accuracy dimensions
    try:
        img_np = np.array(image)
        img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        x1, y1 = int(max(0, bbox['x'])), int(max(0, bbox['y']))
        x2, y2 = int(min(img_cv.shape[1], x1 + w)), int(min(img_cv.shape[0], y1 + h))
        crop = img_cv[y1:y2, x1:x2]
        
        s_rows, s_cols, s_conf = detect_studs_in_crop(crop)
        if s_conf > 0.6:
            stud_rows, stud_cols = s_rows, s_cols
            dims = f"{s_rows}x{s_cols}"
            conf = s_conf
            family = "Brick" if aspect_ratio < 3.0 else "Plate"
    except Exception:
        pass

    # 2. Fallback to extracting from class_name
    if stud_rows == 0:
        cn = class_name.lower()
        if "plate" in cn: family = "Plate"
        elif "tile" in cn: family = "Tile"
        elif "brick" in cn: family = "Brick"
        elif aspect_ratio > 3.0: family = "Plate"

        import re
        dim_match = re.search(r'(\d+)x(\d+)', cn)
        if dim_match:
            dims = f"{dim_match.group(1)}x{dim_match.group(2)}"
            conf = max(conf, 0.8)
        else:
            if 0.8 <= aspect_ratio <= 1.2: dims = "2x2"
            elif 1.8 <= aspect_ratio <= 2.2: dims = "2x4"
            conf = max(conf, 0.6)
        
    return family, dims, conf, stud_rows, stud_cols

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


@app.post('/api/detect')
async def detect(
    image: UploadFile = File(...),
    mode: str = Form("live_scanner"),
    imgsz: int = Form(STABILITY_CONFIG["imgsz"]),
    sessionId: str = Form("session_dense"),
    frameIndex: int = Form(0),
    debugMode: bool = Form(False)
):
    """
    HelloBrick-Style 4-Stage Detection Pipeline
    1. Dense Proposal (Tiling + High Recall)
    2. Geometry Refinement (Global NMS + Size Filter)
    3. Attribute Refinement (Color/Family/Dimensions)
    4. Scene Inventory (Consensus/Persistence)
    """
    print(f"🔍 [PIPELINE] Starting detection. Mode: {mode}, imgsz: {imgsz}")
    try:
        if model is None:
            return JSONResponse({'error': 'Model not initialized'}, status_code=500)
        
        image_bytes = await image.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_width, img_height = pil_image.size
        
        # --- STAGE 1: DENSE PROPOSAL GENERATION ---
        start_time = time.time()
        raw_proposals = []
        
        # --- PART 2: CAPTURE MODE PREPROCESSING (WHITE BRICK SENSITIVITY) ---
        white_sensitivity_used = False
        if mode == 'mass_capture':
            pil_image, white_sensitivity_used = preprocess_for_white_sensitivity(pil_image)
            print(f"✨ [PIPELINE] White brick sensitivity enabled: {white_sensitivity_used}")

        if mode == 'mass_capture':
            # --- BRICKIT-LEVEL CAPTURE PIPELINE ---
            # Pass 1: 640px (Fast base)
            # Pass 2: 1024px (High res)
            # Pass 3: 1024px 2x2 Tiled (Extreme density)
            
            resolutions = [640, 1024]
            for res_val in resolutions:
                res_img = pil_image.resize((res_val, int(res_val * (img_height/img_width))))
                results = model(res_img, imgsz=res_val, stream=False, conf=STABILITY_CONFIG["conf_floor"])
                s_x = img_width / res_img.width
                s_y = img_height / res_img.height
                
                for r in results:
                    if r.boxes:
                        for i, b in enumerate(r.boxes):
                            box = b.xyxy[0].cpu().numpy().tolist()
                            raw_proposals.append({
                                'box': [box[0]*s_x, box[1]*s_y, box[2]*s_x, box[3]*s_y],
                                'conf': float(b.conf[0].cpu().numpy()),
                                'cls': int(b.cls[0].cpu().numpy()),
                                'source': f'full_{res_val}',
                                'mask': r.masks.xy[i].tolist() if hasattr(r, 'masks') and r.masks is not None else None
                            })

            # Tiled Pass (2x2 @ 1024)
            tile_sz = 1024 // 2
            overlap = 64
            tiles = []
            tiles_coords = []
            for ty in range(2):
                for tx in range(2):
                    tx1, ty1 = tx * tile_sz - (overlap if tx > 0 else 0), ty * tile_sz - (overlap if ty > 0 else 0)
                    tx2, ty2 = min(tx1 + tile_sz + overlap, img_width), min(ty1 + tile_sz + overlap, img_height)
                    tiles.append(pil_image.crop((tx1, ty1, tx2, ty2)))
                    tiles_coords.append((tx1, ty1))
            
            # Batch infer tiles
            batch_results = model(tiles, imgsz=tile_sz, stream=False, conf=STABILITY_CONFIG["conf_floor"])
            for idx, r in enumerate(batch_results):
                tx1, ty1 = tiles_coords[idx]
                if r.boxes:
                    for i, b in enumerate(r.boxes):
                        lbox = b.xyxy[0].cpu().numpy().tolist()
                        raw_proposals.append({
                            'box': [lbox[0]+tx1, lbox[1]+ty1, lbox[2]+tx1, lbox[3]+ty1],
                            'conf': float(b.conf[0].cpu().numpy()),
                            'cls': int(b.cls[0].cpu().numpy()),
                            'source': f'tile_{idx}',
                            'mask': r.masks.xy[i].tolist() if hasattr(r, 'masks') and r.masks is not None else None
                        })
        else:
            # Standard Single Pass (Live Mode) - DO NOT TOUCH REDESIGN
            results = model(pil_image, imgsz=imgsz, stream=False, conf=STABILITY_CONFIG["conf_floor"])
            for res in results:
                if res.boxes:
                    for i, b in enumerate(res.boxes):
                        raw_proposals.append({
                            'box': b.xyxy[0].cpu().numpy().tolist(),
                            'conf': float(b.conf[0].cpu().numpy()),
                            'cls': int(b.cls[0].cpu().numpy()),
                            'mask': res.masks.xy[i].tolist() if hasattr(res, 'masks') and res.masks is not None else None,
                            'source': 'live'
                        })

        raw_count = len(raw_proposals)
        
        # C1: Box Validation (Drop clearly bad geometry - e.g. edge-to-edge frame noise)
        valid_proposals = [p for p in raw_proposals if (p['box'][2]-p['box'][0]) < img_width * 0.995]
        geo_drop = raw_count - len(valid_proposals)
        
        # C2: NMS
        refined = []
        if len(valid_proposals) > 0:
            boxes_t = torch.tensor([p['box'] for p in valid_proposals])
            scores_t = torch.tensor([p['conf'] for p in valid_proposals])
            # Slightly less aggressive NMS for better recall
            nms_threshold = 0.30 if mode == 'mass_capture' else 0.45
            keep = nms(boxes_t, scores_t, nms_threshold)
            refined = [valid_proposals[i] for i in keep]
        
        print(f"📊 [PIPELINE] Post-NMS: {len(refined)} (nms_threshold={nms_threshold})")
        
        nms_drop = len(valid_proposals) - len(refined)
        
        # C3: Containment Filter (Remove small boxes inside large ones)
        final_refined = []
        if len(refined) > 0:
            # Sort by area descending so we check larger boxes first
            refined.sort(key=lambda x: (x['box'][2]-x['box'][0]) * (x['box'][3]-x['box'][1]), reverse=True)
            for i, p1 in enumerate(refined):
                is_contained = False
                b1 = p1['box'] # [x1, y1, x2, y2]
                area1 = (b1[2]-b1[0]) * (b1[3]-b1[1])
                
                for p2 in final_refined:
                    b2 = p2['box']
                    # Check if b1 is mostly inside b2
                    ix1 = max(b1[0], b2[0])
                    iy1 = max(b1[1], b2[1])
                    ix2 = min(b1[2], b2[2])
                    iy2 = min(b1[3], b2[3])
                    
                    if ix2 > ix1 and iy2 > iy1:
                        i_area = (ix2-ix1) * (iy2-iy1)
                        if i_area / area1 > 0.85: # 85% contained
                            is_contained = True
                            break
                if not is_contained:
                    final_refined.append(p1)
        
        refined = final_refined
        containment_drop = nms_drop + (len(valid_proposals) - len(refined)) - nms_drop 
        print(f"📊 [PIPELINE] Timing: {int((time.time()-start_time)*1000)}ms | Raw: {raw_count} | Geo-Drop: {geo_drop} | NMS-Drop: {nms_drop} | Containment-Drop: {containment_drop} | Final: {len(refined)}")
        
        if len(refined) == 0 and raw_count > 0:
            print("⚠️ [DEBUG] All raw proposals were filtered out!")

        # Sparse Scene Protection - Fix "35 bricks when 1 exists"
        is_sparse_scene = raw_count < 50 and mode == 'mass_capture'
        if is_sparse_scene:
            print("🛡️ [PIPELINE] Sparse scene detected. Activating conservative sanity mode.")

        detections = []
        raw_rects = []
        
        # --- STAGE E: ATTRIBUTE PIPELINE INSTRUMENTATION ---
        stats = {
            'official_lego': 0,
            'uncertain_clone': 0,
            'rejected_non_lego': 0,
            'removed_by_low_confidence': 0,
            'removed_by_duplicate_filter': nms_drop + containment_drop,
            'removed_by_geometry_filter': geo_drop,
            'removed_by_sparse_sanity': 0
        }

        for i, prop in enumerate(refined):
            x1, y1, x2, y2 = prop['box']
            initial_bbox = {'x': x1, 'y': y1, 'width': x2-x1, 'height': y2-y1}
            w, h = initial_bbox['width'], initial_bbox['height']
            
            # --- PART 6: MULTI-FACTOR CONFIDENCE MODEL ---
            detector_conf = prop['conf']
            
            # 1. Geometry Confidence
            aspect_ratio = max(w, h) / max(min(w, h), 1.0)
            geo_valid, geo_reason = verify_lego_geometry(initial_bbox, model.names[prop['cls']], aspect_ratio)
            geo_conf = 0.95 if geo_valid else 0.1
            
            # 2. Brand Confidence
            brand_class, brand_conf = classify_lego_brand(detector_conf, geo_conf)
            
            # 3. Final Confidence Fusion
            final_conf = (brand_conf * 0.5) + (detector_conf * 0.3) + (geo_conf * 0.2)
            
            # --- PART 5: SPARSE SCENE SANITY CHECK ---
            if is_sparse_scene:
                # RELAXED: 0.85 -> 0.60 to allow valid detections with lower initial confidence
                if final_conf < 0.60:
                    print(f"⚠️ [REJECT] Sparse sanity: low confidence {final_conf:.2f}")
                    stats['removed_by_sparse_sanity'] += 1
                    continue
                # RELAXED: Boundary check removed as high-res captures often touch edges
                # if x1 < 10 or y1 < 10 or x2 > img_width - 10 or y2 > img_height - 10:
                #    stats['removed_by_sparse_sanity'] += 1
                #    continue

            if final_conf < 0.35: # Slightly higher floor for mass capture
                print(f"⚠️ [REJECT] Global confidence too low: {final_conf:.2f}")
                stats['removed_by_low_confidence'] += 1
                continue

            bbox_dict = refine_bbox_contours(pil_image, initial_bbox)
            rx1, ry1 = bbox_dict['x'], bbox_dict['y']
            rx2, ry2 = rx1 + bbox_dict['width'], ry1 + bbox_dict['height']
            
            class_name = model.names[prop['cls']]
            polygon = prop.get('mask')
            
            # Attribute Analysis
            family, dims, dim_conf, sr, sc = infer_brick_attributes(pil_image, bbox_dict, class_name, polygon)
            
            # Final Counting Bucket Decision
            counting_bucket = "official_lego_high_confidence" if final_conf > 0.9 else "official_lego_medium_confidence" if final_conf > 0.75 else "uncertain_lego_like"
            
            if not geo_valid or brand_class == "non_lego" or family == "Reject":
                counting_bucket = "rejected_non_lego"
                stats['rejected_non_lego'] += 1
            elif counting_bucket.startswith("official"):
                stats['official_lego'] += 1
            else:
                stats['uncertain_clone'] += 1

            color_name, color_conf = detect_color_lab_v3(pil_image, bbox_dict, polygon)
            
            detections.append({
                'detectionId': f'det_{i}_{int(time.time()*1000)}',
                'countingBucket': counting_bucket,
                'geometry': {
                    'type': 'bbox_xyxy',
                    'bbox': {
                        'format': 'xyxy', 'space': 'pixel',
                        'xMin': float(rx1), 'yMin': float(ry1), 'xMax': float(rx2), 'yMax': float(ry2)
                    },
                    'polygon': [{'x': p[0], 'y': p[1]} for p in polygon] if polygon else None,
                    'geometryConfidence': round(geo_conf, 3)
                },
                'prediction': {
                    'brickName': class_name, 'brickFamily': family, 'dimensionsLabel': dims,
                    'brickColorName': color_name, 'identityConfidence': round(final_conf, 3),
                    'brandConfidence': round(brand_conf, 3), 'detectorConfidence': round(detector_conf, 3),
                    'colorConfidence': round(color_conf, 3), 'dimensionsConfidence': round(dim_conf, 3)
                },
                'compactLabel': generate_compact_label(color_name, family, dims, class_name),
                'labelDisplayStatus': 'confirmed' if counting_bucket.startswith('official') and final_conf > 0.8 else 'tentative'
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

        # --- PART 3: SPARSE SCENE FALLBACK (Zero Result Protection) ---
        if len(detections) == 0 and raw_count > 0 and mode == 'mass_capture':
            print("🛡️ [PIPELINE] Capture returned 0 bricks. Attempting Sparse Fallback...")
            # Take more than 2 if they are reasonably confident
            raw_proposals.sort(key=lambda x: x['conf'], reverse=True)
            for i, prop in enumerate(raw_proposals[:5]):
                if prop['conf'] < 0.20: continue # Hard floor for fallback
                
                x1, y1, x2, y2 = prop['box']
                bbox = {'x': x1, 'y': y1, 'width': x2-x1, 'height': y2-y1}
                family, dims, dim_conf, sr, sc = infer_brick_attributes(pil_image, bbox, model.names[prop['cls']])
                
                # Even if family is Reject, in fallback we might allow it if conf is high enough but geometry is weird
                is_valid = family != "Reject" or prop['conf'] > 0.65
                
                if is_valid:
                    detections.append({
                        'detectionId': f'fallback_{i}_{int(time.time()*1000)}',
                        'countingBucket': 'official_lego_recovered',
                        'fallbackReason': family if family == "Reject" else "Lowered Threshold",
                        'geometry': {
                            'type': 'bbox_xyxy',
                            'bbox': {'format': 'xyxy', 'space': 'pixel', 'xMin': x1, 'yMin': y1, 'xMax': x2, 'yMax': y2},
                            'geometryConfidence': 0.6
                        },
                        'prediction': {
                            'brickName': model.names[prop['cls']], 'brickFamily': family if family != "Reject" else "Brick", 'dimensionsLabel': dims,
                            'identityConfidence': prop['conf'], 'colorConfidence': 0.5, 'dimensionsConfidence': dim_conf
                        },
                        'compactLabel': f"Recovered {dims}",
                        'labelDisplayStatus': 'tentative'
                    })
                    stats['official_lego'] += 1
            stats['sparse_fallback_used'] = len(detections) > 0
            if stats['sparse_fallback_used']:
                print(f"✅ [PIPELINE] Successfully recovered {len(detections)} bricks via fallback.")

        inference_ms = int((time.time() - start_time) * 1000)
        
        return {
            'sessionId': sessionId,
            'frameId': f'f_{int(time.time()*1000)}',
            'frameIndex': frameIndex,
            'frameWidth': img_width,
            'frameHeight': img_height,
            'modelVersion': 'v8_fastapi_v1',
            'trackedObjects': tracked_objects,
            'detections': detections,
            'inferenceMs': inference_ms,
            'summary': {
                'official_lego_count': stats['official_lego'],
                'uncertain_lego_like_count': stats['uncertain_clone'],
                'non_lego_rejected_count': stats['rejected_non_lego'],
                'total_candidates_analyzed': raw_count,
                'removed_by_low_confidence': stats['removed_by_low_confidence'],
                'removed_by_duplicate_filter': stats['removed_by_duplicate_filter'],
                'removed_by_geometry_filter': stats['removed_by_geometry_filter'],
                'removed_by_sparse_sanity': stats.get('removed_by_sparse_sanity', 0),
                'white_sensitivity_used': white_sensitivity_used,
                'sparse_fallback_triggered': stats.get('sparse_fallback_used', False)
            }
        }

    except Exception as e:
        print(f"❌ [PIPELINE] Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({'error': str(e)}, status_code=500)

@app.post('/api/dataset/upload')
async def upload_dataset(
    video: UploadFile = File(...),
    userId: str = Form("anonymous")
):
    """Ingest building video for model training"""
    try:
        file_id = str(uuid.uuid4())
        save_path = Path(f"server/data/uploads/{file_id}_{video.filename}")
        save_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(save_path, "wb") as buffer:
            buffer.write(await video.read())
            
        print(f"📥 [DATASET] Video uploaded: {video.filename} (ID: {file_id})")
        return {'success': True, 'fileId': file_id, 'xp_awarded': 500}
    except Exception as e:
        return JSONResponse({'error': str(e)}, status_code=500)

@app.get('/api/dataset/training/next')
async def get_next_training_item():
    """Fetch next item for user verification"""
    if not VERIFICATION_QUEUE:
        return {
            'success': True,
            'item': {
                'id': str(uuid.uuid4()),
                'image': 'https://picsum.photos/seed/brick6/200/200',
                'predictedLabel': '2x4 Red Brick',
                'confidence': 0.85,
                'partNumber': '3001',
                'color': 'Red',
                'currentVotes': 2,
                'required': 5
            }
        }
    return {'success': True, 'item': VERIFICATION_QUEUE.pop(0)}

@app.post('/api/dataset/verify')
async def verify_training_item(
    itemId: str = Form(...),
    confirmed: bool = Form(...),
    userId: str = Form(...)
):
    """Persist user verification vote"""
    print(f"🗳️ [DATASET] Vote received for {itemId}: {confirmed} by {userId}")
    return {'success': True, 'xp_awarded': 5}

@app.post('/api/auth/reset-password')
async def reset_password(data: dict):
    """Mock password reset endpoint"""
    print(f"🔑 [AUTH] Password reset requested for: {data.get('email')}")
    return {'success': True}

@app.delete('/api/user/delete')
async def delete_user(data: dict):
    """Mock user deletion endpoint"""
    print(f"🗑️ [AUTH] User deletion requested for: {data.get('userId')}")
    return {'success': True}

@app.get('/api/health')
async def health():
    return {'status': 'ok', 'model_loaded': model is not None}

if __name__ == '__main__':
    import uvicorn
    initialize_yolo()
    uvicorn.run(app, host='0.0.0.0', port=3001)
