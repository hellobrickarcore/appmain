# Final Steps: Test on iPhone

## ✅ Completed
- ✅ Build successful
- ✅ Capacitor synced
- ✅ Xcode project opening

## In Xcode

### 1. Select Your iPhone
- In the top toolbar, click the device selector
- Choose your connected iPhone

### 2. Trust Developer (if needed)
- On your iPhone: Settings > General > VPN & Device Management
- Tap your developer certificate
- Tap "Trust"

### 3. Run the App
- Click the Run button (▶️) or press `Cmd+R`
- Wait for build to complete
- App will install on your iPhone

## On Your iPhone

### 1. Allow Camera Permission
- When app opens, allow camera access
- Go to Scan tab

### 2. Test Detection
- Point camera at LEGO bricks
- Should see bounding boxes around detected bricks
- Real-time detection should work

## Important: Backend Must Be Running

**Make sure the backend server is running on your Mac:**

```bash
cd server
python3 yolo-detection-server.py
```

The server should show:
- "Server ready!"
- "Listening on http://0.0.0.0:3003"

## Troubleshooting

### "Cannot connect to server"
- Verify backend is running on Mac
- Check Mac and iPhone are on same WiFi
- Verify IP address in `.env` is correct

### "Developer not approved"
- Settings > General > VPN & Device Management
- Trust the developer certificate

### No detections
- Check backend server logs
- Verify model loaded: Look for "Model loaded successfully"
- Check API URL in `.env` matches your Mac IP

## Current Configuration

- **Backend Port**: 3003
- **API URL**: `http://YOUR_MAC_IP:3003/api`
- **Model**: YOLOv8 trained on LEGO bricks

Good luck! 📱




