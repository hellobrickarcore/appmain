# Roboflow LEGO Model Download Guide

## Quick Download Steps

### Option 1: Website Download (Recommended)

1. **Visit the model page:**
   ```
   https://universe.roboflow.com/hexhewwie/hex-lego
   ```

2. **Click "Download" or "Get Dataset" button**

3. **Select format:**
   - Choose: **"YOLOv7 PyTorch"** or **"YOLOv7"**
   - This will download a ZIP file

4. **Extract the ZIP file:**
   - Look for a file named `best.pt` or `weights/best.pt`
   - This is the trained model

5. **Place the model file:**
   ```bash
   # Copy the .pt file to:
   /Users/akeemojuko/Downloads/hellobrick/server/models/yolo11_lego.pt
   ```

6. **Or use the helper script:**
   ```bash
   cd /Users/akeemojuko/Downloads/hellobrick/server
   ./load-trained-model.sh /path/to/downloaded/best.pt
   ```

### Option 2: Using Roboflow API (If you have API key)

1. **Get your API key:**
   - Visit: https://app.roboflow.com/
   - Go to Settings → API
   - Copy your API key

2. **Set environment variable:**
   ```bash
   export ROBOFLOW_API_KEY='your-api-key-here'
   ```

3. **Run download script:**
   ```bash
   cd /Users/akeemojuko/Downloads/hellobrick/server
   python3 download-roboflow-lego.py
   ```

## After Download

Once you have the model file in place:

1. **Verify it works:**
   ```bash
   cd /Users/akeemojuko/Downloads/hellobrick/server
   python3 -c "from ultralytics import YOLO; model = YOLO('models/yolo11_lego.pt'); print('✅ Model loaded!')"
   ```

2. **Start the detection server:**
   ```bash
   python3 yolo-detection-server.py
   ```

3. **Test detection:**
   - Server will run on: http://localhost:3001
   - Frontend can connect to: http://localhost:3001/api/detect

## Model Details

- **Name:** Hex LEGO Object Detection
- **Version:** YOLOv7
- **Performance:** 88.3% mAP, 95.6% precision
- **Classes:** 28 LEGO brick types
- **Dataset:** 8,320 images

## Troubleshooting

- **File too small?** You might have downloaded the wrong file or got an HTML page
- **Can't find .pt file?** Look in the `weights/` folder inside the ZIP
- **Model won't load?** Make sure it's a YOLOv7 PyTorch format, not ONNX or TensorFlow

