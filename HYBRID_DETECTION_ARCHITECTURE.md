# Hybrid Detection Architecture

## Overview

HelloBrick uses a **two-layer detection pipeline** for optimal performance and accuracy:

1. **Layer 1: Gemini 3 Flash** - Fast initial detection for real-time scanning
2. **Layer 2: YOLOv8** - Verification and refinement for accuracy and dataset building

## Architecture Flow

```
Camera Feed
    ↓
[Gemini Fast Detection] → Immediate UI Display (20fps)
    ↓
[YOLOv8 Verification] → Refined Results + Dataset Building
    ↓
Combined/Refined Results
```

## How It Works

### Stage 1: Fast Detection (Gemini)
- **Purpose**: Provide immediate visual feedback to users
- **Speed**: ~50ms per frame (20fps)
- **Model**: Gemini 3 Flash Preview
- **Output**: Fast bounding boxes and labels
- **Display**: Shown immediately in UI with AR-style overlays

### Stage 2: Verification (YOLOv8)
- **Purpose**: Verify and refine detections, build training dataset
- **Speed**: ~200-500ms per frame (runs asynchronously)
- **Model**: YOLOv8 (via backend API)
- **Output**: Verified bounding boxes with higher accuracy
- **Display**: Updates UI when verification completes
- **Dataset**: Saves verified results for model training

## Detection Matching

The system uses **IoU (Intersection over Union)** to match Gemini detections with YOLOv8 verifications:

1. For each Gemini detection, find the best YOLOv8 match (IoU > 0.3)
2. Use YOLOv8's verified data (confidence, type) but keep Gemini's fast label
3. Add any YOLOv8 detections missed by Gemini
4. Lower confidence for unverified Gemini-only detections

## Dataset Building

When both layers agree or YOLOv8 finds additional bricks:
- Verified results are automatically saved to the dataset
- Images and annotations are stored for future model training
- Helps improve YOLOv8 accuracy over time

## Performance Optimizations

1. **Selective Verification**: YOLOv8 runs on ~10% of frames to avoid overloading
2. **Background Processing**: Verification runs asynchronously without blocking UI
3. **Object Tracking**: Maintains stable IDs across frames using IoU matching
4. **Image Optimization**: Gemini uses 256px images for speed

## Configuration

### Environment Variables
- `VITE_GEMINI_API_KEY`: Your Gemini API key
- `VITE_DETECTION_API_URL`: Optional YOLOv8 backend URL (defaults to localhost:3003)

### Verification Rate
Adjust in `ScannerScreen.tsx`:
```typescript
const shouldVerify = Math.random() < 0.1; // 10% chance per frame
```

## Benefits

✅ **Fast Response**: Users see results immediately (Gemini)
✅ **High Accuracy**: Verified by YOLOv8 for precision
✅ **Dataset Growth**: Automatically builds training data
✅ **Scalable**: Can adjust verification rate based on performance needs

## Future Enhancements

- [ ] User feedback loop for dataset quality
- [ ] Active learning: prioritize uncertain detections
- [ ] On-device YOLOv8 for faster verification
- [ ] Confidence-based verification scheduling




