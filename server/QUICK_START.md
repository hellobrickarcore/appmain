# Quick Start: Use Existing Trained Model

## You Have Trained Models! ✅

Based on the directory structure, you have trained models available. Here's how to use them:

## Option 1: Use Python Script (Recommended)

```bash
cd server
python3 copy-trained-model.py
```

This will:
- Find your best trained model
- Copy it to `models/yolo8_lego.pt`
- Show you what was copied

## Option 2: Manual Copy

If the script doesn't work, manually copy:

```bash
cd server
mkdir -p models
cp runs/detect/roboflow_lego_fresh/weights/best.pt models/yolo8_lego.pt
```

Or use any of these existing models:
- `runs/detect/roboflow_lego_fresh/weights/best.pt`
- `runs/detect/roboflow_lego_optimized/weights/best.pt`
- `runs/detect/lego_kaggle2/weights/best.pt`
- `models/yolo11_lego.pt`

## Then Start the Server

```bash
python3 yolo-detection-server.py
```

The server will load `models/yolo8_lego.pt` and work with your trained LEGO detection model!

## Note

Even though the training args show "yolo11n.pt", the models are compatible. Your trained models will work with the YOLOv8 server code because:

1. Ultralytics models are compatible across versions
2. The models are trained on LEGO bricks, which is what matters
3. The server code uses the Ultralytics API which handles version differences




