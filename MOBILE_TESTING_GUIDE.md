# Mobile Testing Guide

## Prerequisites

1. ✅ Backend server running on port 3003
2. ✅ Mac and iPhone on same WiFi network
3. ✅ Xcode installed

## Quick Setup

Run the automated script:

```bash
./prepare-mobile-test.sh
```

This will:
- Find your Mac's IP address
- Update `.env` with the API URL
- Build the app
- Sync Capacitor

## Manual Setup (if script doesn't work)

### Step 1: Find Mac IP Address

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Or check: System Settings > Network > WiFi > Details

### Step 2: Update .env File

Create/update `.env` file:

```bash
VITE_DETECTION_API_URL=http://YOUR_MAC_IP:3003/api
```

Replace `YOUR_MAC_IP` with your actual IP (e.g., `192.168.1.100`)

### Step 3: Build the App

```bash
npm run build
```

### Step 4: Sync Capacitor

```bash
npx cap sync ios
```

### Step 5: Open in Xcode

```bash
npx cap open ios
```

## In Xcode

1. **Select your iPhone** as the target device (top toolbar)
2. **Click Run** (▶️) or press `Cmd+R`
3. Wait for build to complete
4. App will install on your iPhone

## On Your iPhone

1. **Trust Developer** (if prompted):
   - Settings > General > VPN & Device Management
   - Tap your developer certificate
   - Tap "Trust"

2. **Allow Camera Permission**:
   - When app opens, allow camera access

3. **Test Detection**:
   - Go to Scan tab
   - Point at LEGO bricks
   - Should see bounding boxes

## Troubleshooting

### "Cannot connect to server"
- Make sure backend is running: `cd server && python3 yolo-detection-server.py`
- Check Mac and iPhone are on same WiFi
- Verify IP address in `.env` is correct
- Check Mac firewall isn't blocking port 3003

### "Developer not approved"
- Settings > General > VPN & Device Management
- Trust the developer certificate

### Camera not working
- Settings > Privacy & Security > Camera
- Enable camera access for HelloBrick

### No detections
- Check backend server logs
- Verify model loaded: Look for "Model loaded successfully" in server terminal
- Check API URL in `.env` matches your Mac IP

## Verify Backend is Accessible

Test from your iPhone's browser (or another device on same network):

```
http://YOUR_MAC_IP:3003/api/health
```

Should return: `{"status":"ok","model_loaded":true}`

## Current Configuration

- **Backend Port**: 3003
- **API Endpoint**: `http://YOUR_MAC_IP:3003/api/detect`
- **Model**: YOLOv8 trained on LEGO bricks

Good luck! 📱




