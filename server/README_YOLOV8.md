# YOLOv8 LEGO Detection Setup

## Overview

This project uses **YOLOv8** (stable, production-ready) trained on LEGO brick datasets for accurate brick detection.

## Quick Start

### 1. Train the Model

```bash
cd server
python3 train-yolov8-lego.py
```

This will:
- Load the Roboflow LEGO dataset (27 classes of LEGO bricks)
- Train YOLOv8n (nano model) for optimal speed/accuracy balance
- Save the best model to `models/yolo8_lego.pt`
- Training takes several hours depending on hardware

### 2. Start the Detection Server

```bash
python3 yolo-detection-server.py
```

The server will:
- Load the trained model from `models/yolo8_lego.pt`
- Start Flask server on `http://0.0.0.0:3001`
- Accept detection requests at `POST /api/detect`

### 3. Export to ONNX (for mobile deployment)

```bash
python3 export-to-onnx.py
```

This exports the trained model to ONNX format for use in Flutter/mobile apps.

## Model Information

- **Base Model**: YOLOv8n (nano)
- **Dataset**: Roboflow LEGO dataset (27 classes)
- **Classes**: 27 different LEGO brick types (1x1, 2x1, 2x2, 2x3, 2x4 in various colors)
- **Training Size**: 640x640 pixels
- **Confidence Threshold**: 0.25 (25%)
- **IoU Threshold**: 0.45

## Why YOLOv8?

- ✅ **Stable**: Battle-tested, production-ready (1.5+ years)
- ✅ **Accurate**: Better than YOLOv5 (37.3% mAP vs 28.0% mAP)
- ✅ **Fast**: ~50-200ms inference time
- ✅ **Well-documented**: Extensive documentation and examples
- ✅ **Proven**: Used in many production applications

## Training Configuration

- **Epochs**: 100 (with early stopping patience=50)
- **Batch Size**: 16
- **Image Size**: 640x640
- **Learning Rate**: 0.01 (with scheduler)
- **Device**: CPU (change to 'cuda' in script if GPU available)

## Files

- `train-yolov8-lego.py` - Main training script
- `yolo-detection-server.py` - Flask API server
- `export-to-onnx.py` - Export model to ONNX format
- `models/yolo8_lego.pt` - Trained model (after training)
- `models/roboflow-lego-dataset/` - Training dataset

## Dataset

The Roboflow LEGO dataset includes:
- **27 classes** of LEGO bricks
- **8,320+ images** with annotations
- **15,000+ bounding box annotations**
- Classes: 1x1, 2x1, 2x2, 2x3, 2x4 bricks in black, blue, brown, green, pink, red, yellow

## Next Steps

1. Train the model: `python3 train-yolov8-lego.py`
2. Test the server: `python3 yolo-detection-server.py`
3. Export for mobile: `python3 export-to-onnx.py`
4. Integrate with frontend




