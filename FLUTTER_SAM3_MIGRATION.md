# Flutter + SAM 3 Migration Plan

## Overview
Migrate HelloBrick from React web app to Flutter mobile app with SAM 3 (Segment Anything Model 3) for superior brick segmentation, similar to Brickit's approach.

## Why Flutter + SAM 3?

### Flutter Benefits:
- **Native Performance**: Better camera access and real-time processing
- **Cross-platform**: iOS and Android from one codebase
- **Better UX**: Native feel, smooth animations
- **Offline-first**: Can run models on-device

### SAM 3 Benefits:
- **Superior Segmentation**: More precise brick outlines than YOLO bounding boxes
- **Zero-shot**: Works without training on LEGO-specific data
- **Better Accuracy**: Can segment individual bricks even when overlapping
- **Industry Standard**: Used by Brickit and similar apps

## Architecture

```
┌─────────────────────────────────────────┐
│         Flutter Mobile App              │
│  ┌───────────────────────────────────┐  │
│  │  Camera Service (native)           │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  YOLO v11 (Detection)             │  │
│  │  - Fast brick detection            │  │
│  │  - Bounding boxes                  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  SAM 3 (Segmentation)             │  │
│  │  - Precise brick outlines          │  │
│  │  - Mask generation                 │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Color Detection                  │  │
│  │  - Extract color from mask         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│    Python Backend (Optional)            │
│  - Model serving (if on-device fails)   │
│  - Training pipeline                    │
│  - Data collection                     │
└─────────────────────────────────────────┘
```

## Implementation Steps

### Phase 1: Model Training (Current Priority)
1. **Collect LEGO Dataset**
   - Use existing dataset or collect new images
   - Label with bounding boxes (YOLO format)
   - Include diverse brick types, colors, angles

2. **Train YOLO v11**
   - Fine-tune on LEGO dataset
   - Target: 80%+ mAP (mean Average Precision)
   - Export to ONNX for mobile deployment

3. **Prepare SAM 3**
   - Download SAM 3 model weights
   - Convert to mobile-friendly format (ONNX or TensorFlow Lite)
   - Test segmentation quality

### Phase 2: Flutter Setup
1. **Create Flutter Project**
   ```bash
   flutter create hellobrick_flutter
   cd hellobrick_flutter
   ```

2. **Add Dependencies**
   ```yaml
   dependencies:
     camera: ^0.10.0
     tflite_flutter: ^0.10.0  # For YOLO
     onnxruntime: ^1.15.0      # For SAM 3
     image: ^4.0.0
   ```

3. **Camera Integration**
   - Native camera access
   - Real-time frame capture
   - Image preprocessing

### Phase 3: Model Integration
1. **YOLO v11 Integration**
   - Load ONNX model
   - Preprocess frames
   - Run inference
   - Parse detections

2. **SAM 3 Integration**
   - Load SAM 3 model
   - Use YOLO boxes as prompts
   - Generate precise masks
   - Extract brick boundaries

3. **Color Detection**
   - Sample colors from masks
   - Match to LEGO color palette
   - Classify brick types

### Phase 4: UI/UX
1. **Port Existing Features**
   - Quest system
   - Gamification
   - Profile page
   - Inventory

2. **AR Overlays**
   - Draw masks on camera feed
   - Show brick labels
   - Real-time feedback

## SAM 3 Integration Details

### Why SAM 3 over SAM 2?
- **Better Performance**: Faster inference
- **Improved Accuracy**: Better segmentation quality
- **Mobile Optimized**: Designed for edge devices
- **Zero-shot**: No training needed

### Implementation Approach:
1. **YOLO for Detection**: Fast bounding box detection
2. **SAM 3 for Segmentation**: Precise mask generation from boxes
3. **Hybrid Approach**: Best of both worlds

### Code Structure:
```dart
// Detection
List<BoundingBox> boxes = await yoloModel.detect(image);

// Segmentation
for (var box in boxes) {
  Mask mask = await sam3Model.segment(image, box);
  Brick brick = Brick.fromMask(mask, box);
  bricks.add(brick);
}
```

## Training Requirements

### Dataset:
- **Minimum**: 1000+ images
- **Recommended**: 5000+ images
- **Diversity**: Different angles, lighting, backgrounds
- **Labels**: YOLO format (class, x, y, w, h)

### Training Script:
- Use existing `train-roboflow-optimized.py` or create new
- Fine-tune YOLO v11 on LEGO dataset
- Validate on test set
- Export to ONNX

## Next Steps

1. **Immediate**: Retrain YOLO model with better dataset
2. **Short-term**: Set up Flutter project structure
3. **Medium-term**: Integrate SAM 3
4. **Long-term**: Full feature migration

## Resources

- **SAM 3**: https://github.com/facebookresearch/segment-anything-3
- **Flutter Camera**: https://pub.dev/packages/camera
- **ONNX Runtime**: https://pub.dev/packages/onnxruntime
- **YOLO v11**: https://github.com/ultralytics/ultralytics


