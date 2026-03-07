# HelloBrick Quick Start Guide

## 🚀 Steps to Run the App

### Step 1: Start the Detection Server (Required)
The Python Flask server handles all brick detection using YOLOv11.

```bash
cd server
source venv/bin/activate  # Activate virtual environment
python3 yolo-detection-server.py
```

**Expected output:**
```
🚀 Starting YOLO Detection Server...
==================================================
📦 Loading model from: models/yolo11n.pt
✅ Model loaded successfully: models/yolo11n.pt
✅ Server ready!
📡 Listening on http://0.0.0.0:3001
```

**Keep this terminal open!** The server must be running for detection to work.

---

### Step 2: Start the Frontend (In a New Terminal)
The React app provides the UI and camera interface.

```bash
cd /Users/akeemojuko/Downloads/hellobrick
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

---

### Step 3: Open in Browser
1. Open your browser (Chrome/Safari recommended)
2. Navigate to: `http://localhost:5173`
3. Allow camera permissions when prompted

---

### Step 4: Test Detection
1. Click on the **"Scan"** tab
2. Allow camera access
3. Point camera at LEGO bricks
4. Click **"Scan Bricks"** button
5. Detection results will appear

---

## 📋 What's Running?

### Terminal 1: Detection Server
- **Port**: 3001
- **Purpose**: YOLOv11 brick detection
- **Status**: Must stay running

### Terminal 2: Frontend Dev Server
- **Port**: 5173
- **Purpose**: React app UI
- **Status**: Must stay running

### Terminal 3 (Optional): Training
- **Purpose**: Model training in background
- **Status**: Can run independently

---

## 🔧 Troubleshooting

### Server Not Starting?
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill existing process if needed
kill -9 <PID>
```

### Frontend Can't Connect to Server?
- Ensure server is running on port 3001
- Check server logs for errors
- Verify `http://localhost:3001/api/health` responds

### Camera Not Working?
- Use HTTPS for mobile testing: `npm run dev:https`
- Check browser permissions
- Try different browser (Chrome/Safari)

### No Detections?
- Base model (yolo11n.pt) detects general objects, not LEGO-specific
- Wait for training to complete for better results
- Check server logs for detection errors

---

## 📊 Current Status

### Detection Models:
- ✅ **Base Model**: `yolo11n.pt` (general object detection)
- ⏳ **Trained Model**: Training in progress (will auto-switch when ready)

### Training Progress:
- **Roboflow**: 9/15 epochs (60%) - ~12 hours remaining
- **Original**: 11/50 epochs (22%) - ~53 hours remaining

---

## 🎯 Quick Commands

```bash
# Start detection server
cd server && python3 yolo-detection-server.py

# Start frontend
npm run dev

# Check server health
curl http://localhost:3001/api/health

# View server logs
tail -f server/detection-server.log

# Check training progress
cd server && python3 << 'PYTHON'
from pathlib import Path
import csv
# ... (training status check)
PYTHON
```

---

## ✅ Verification Checklist

- [ ] Detection server running on port 3001
- [ ] Frontend running on port 5173
- [ ] Server health check returns `{"status": "ok", "model_loaded": true}`
- [ ] Browser can access `http://localhost:5173`
- [ ] Camera permissions granted
- [ ] Detection endpoint responds (check browser console)

---

## 🚨 Important Notes

1. **Server Must Run First**: Detection won't work without the Python server
2. **Keep Both Running**: Both server and frontend must stay active
3. **Base Model Limitations**: Current model detects general objects, not LEGO-specific
4. **Training Continues**: Models train in background, will auto-update when ready
5. **Mobile Testing**: Use HTTPS for camera access on mobile devices
