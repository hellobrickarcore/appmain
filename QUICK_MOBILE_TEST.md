# 📱 Quick Mobile Test (iPhone)

## ⚡ Fastest Way to Test on iPhone

### 1. Install (First Time Only)

```bash
cd /Users/akeemojuko/Downloads/hellobrick
npm install
```

### 2. Start Server

```bash
npm run dev:mobile
```

### 3. Open on iPhone

The script will show you a URL like:
```
http://192.168.1.100:5173
```

**On your iPhone:**
1. Open Safari
2. Type the URL in address bar
3. Tap "Allow" for camera permission
4. Start testing!

---

## ✅ Done!

No Xcode, no native app - just test in Safari browser.

**Note:** Make sure iPhone and computer are on the **same WiFi network**.

---

## 🐛 If Camera Doesn't Work

Safari on iPhone requires HTTPS for camera on non-localhost URLs. Options:

1. **Test on Mac Safari first** (localhost works)
2. **Use Chrome/Firefox on iPhone** (better camera support)
3. **Set up HTTPS** (more complex, see MOBILE_WEB_TESTING.md)

For now, the app will work for all features except camera if on HTTP. Camera will work on localhost (Mac Safari) or with HTTPS.

