# 📱 Quick Mobile Testing Guide

## 🚀 Fastest Method

Run the complete setup script:

```bash
cd /Users/akeemojuko/Downloads/hellobrick
./start-mobile-test-complete.sh
```

This will:
- ✅ Start both frontend (port 5173) and backend (port 3001) servers
- ✅ Show you the URL to access from your phone
- ✅ Display your local IP address

## 📱 Access from Your Phone

1. **Make sure your phone and computer are on the SAME WiFi network**

2. **Open your browser** (Safari on iPhone, Chrome on Android)

3. **Type the URL** shown by the script (something like):
   ```
   http://192.168.1.217:5173
   ```

4. **Allow camera permissions** when prompted

5. **Start testing!**

## 🔍 What to Test

- ✅ Home screen displays correctly
- ✅ Navigation tabs work
- ✅ Camera opens when you tap "Scan" tab
- ✅ Brick detection works (sends images to backend)
- ✅ Quest system functions
- ✅ XP and gamification features

## 🐛 Troubleshooting

### Can't Access from Phone

**Check WiFi:**
- Phone and computer must be on same network
- Some public WiFi blocks device-to-device connections
- Try your home WiFi

**Check Firewall:**
- macOS: System Settings > Network > Firewall
- Temporarily disable or allow port 5173

**Find Your IP Manually:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Camera Doesn't Work on iPhone Safari

Safari on iPhone requires HTTPS for camera on non-localhost URLs.

**Solutions:**
1. **Use Chrome or Firefox** on iPhone (better camera support)
2. **Test on Mac Safari** first (localhost works)
3. **For production:** Set up HTTPS (see MOBILE_WEB_TESTING.md)

### Backend Not Responding

Make sure the backend server is running:
```bash
curl http://localhost:3001/api/health
```

If it's not running, start it:
```bash
cd server
python3 yolo-detection-server.py
```

## 📊 Alternative: Native App Testing

For full native app testing (better camera access), use Capacitor:

```bash
npm run build
npm run setup:mobile
npm run mobile:ios    # or mobile:android
```

This requires Xcode (iOS) or Android Studio (Android).

## ✅ Current Status

- Frontend: Running on port 5173
- Backend: Should be running on port 3001
- Access: http://YOUR_IP:5173 from your phone




