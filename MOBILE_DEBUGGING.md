# Mobile Debugging Guide

## Safari Web Inspector Setup

### On iPhone:
1. Go to **Settings** → **Safari** → **Advanced**
2. Enable **Web Inspector**

### On Mac:
1. Connect iPhone to Mac via USB cable
2. On iPhone, trust the computer if prompted
3. Open **Safari** on Mac
4. Go to **Develop** menu → Select your iPhone → Select the HelloBrick tab
5. Web Inspector window opens showing:
   - **Console** - All JavaScript logs and errors
   - **Network** - All API calls and responses
   - **Elements** - HTML/DOM inspection
   - **Sources** - JavaScript debugging

## What You'll See

### Console Tab:
- All `console.log()` messages
- Errors with stack traces
- API call logs (🔍, 📡, ✅, ❌ emojis)
- Detection results

### Network Tab:
- Filter by "Fetch/XHR" to see API calls
- Click on `/api/detect` requests to see:
  - Request payload (FormData with image)
  - Response status and body
  - Timing information

## Alternative: Remote Debugging (Chrome)

If using Chrome on Android:
1. Enable USB debugging on Android
2. Connect to Mac via USB
3. Open `chrome://inspect` in Chrome on Mac
4. Click "Inspect" on your device

## Quick Debug Checklist

When testing detection:
1. ✅ Check Console for API URL detection logs
2. ✅ Check Network tab for `/api/detect` requests
3. ✅ Verify request has image data (FormData)
4. ✅ Check response status (200 = success, 4xx/5xx = error)
5. ✅ Look for CORS errors
6. ✅ Check if video stream is active (video dimensions > 0)


