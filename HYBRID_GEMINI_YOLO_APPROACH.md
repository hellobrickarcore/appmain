# Hybrid Gemini + YOLO Approach

## Overview
Use Gemini for initial detection (better at finding bricks), then YOLO for precise classification and bounding boxes.

## Architecture

```
Camera Feed
    ↓
Gemini API (Initial Detection)
    ↓
YOLOv8 (Precise Classification & Bounding Boxes)
    ↓
SAM3 (Optional: Segmentation Masks)
    ↓
Frontend Display
```

## Implementation Plan

### Phase 1: Gemini Integration
1. Add Gemini API service
2. Use Gemini for initial brick detection
3. Return bounding box regions to YOLO

### Phase 2: YOLO Refinement
1. Use Gemini detections as regions of interest (ROI)
2. Run YOLO only on ROI regions (faster)
3. Get precise classifications and bounding boxes

### Phase 3: Hybrid Service
1. Combine Gemini + YOLO results
2. Use Gemini confidence for initial filtering
3. Use YOLO for final classification

## Benefits
- **Gemini**: Better at finding bricks in complex scenes
- **YOLO**: Faster, more precise classification
- **Hybrid**: Best of both worlds

## Cost Considerations
- Gemini API: ~$0.00025 per image
- YOLO: Free (local inference)
- Hybrid: Only use Gemini when needed (e.g., first detection, then YOLO for subsequent frames)




