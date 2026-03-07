# Roboflow Model Download via Fork/Clone

## Step-by-Step Instructions

### Option 1: Fork the Dataset (Recommended)

1. **Click "Use this Dataset" → "Fork Dataset"**
   - This creates a copy in your Roboflow workspace

2. **Sign in/Create Roboflow Account** (if needed)
   - Free account is sufficient

3. **After forking, go to your workspace:**
   - Visit: https://app.roboflow.com/
   - Find your forked "hex-lego" project

4. **Export the model:**
   - Click on your forked project
   - Go to "Export" or "Download" section
   - Select format: **"YOLOv7 PyTorch"**
   - Download the ZIP file

5. **Extract and use:**
   - Extract the ZIP
   - Find `best.pt` or `weights/best.pt`
   - Place in: `server/models/yolo11_lego.pt`

### Option 2: Clone to Another Project

1. **Click "Use this Dataset" → "Clone Dataset"**
2. **Select an existing project** (or create new)
3. **Then export from that project**

## Alternative: Test with Base Model

If you want to test the detection system NOW without downloading:

We can use the base YOLOv7 model to verify the entire pipeline works, then swap in the trained LEGO model later.

