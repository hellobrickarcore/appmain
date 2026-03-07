# 📱 How to Launch App on Your iPhone

## Step-by-Step Guide

### 1. Connect Your iPhone

- Connect your iPhone to your Mac via USB cable
- Unlock your iPhone
- If prompted, tap "Trust This Computer" on your iPhone
- Enter your iPhone passcode if asked

---

### 2. In Xcode

**A. Select Your Device**
- Look at the top toolbar in Xcode
- Find the device dropdown (next to the Play button)
- Click it and select your iPhone (it should show your iPhone name)

**B. Configure Signing (if needed)**
- In the left sidebar, click on "App" (blue icon, under TARGETS)
- Click the "Signing & Capabilities" tab (at the top)
- Check ✅ "Automatically manage signing"
- Under "Team", select your Apple ID (free account works!)
- Xcode will automatically create certificates (may take a minute)

**C. Enable Developer Mode (iOS 16+)**
- If you see "Developer Mode" error:
  1. On your iPhone: Settings → Privacy & Security → Developer Mode
  2. Toggle it ON
  3. Restart your iPhone
  4. Confirm when prompted

---

### 3. Build and Run

- Click the **Play button (▶️)** in Xcode (top left)
- Or press `Cmd + R`
- Wait for build to complete (first time: 5-10 minutes)
- The app will install and launch on your iPhone automatically!

---

### 4. Grant Permissions

When the app launches:
- Tap **"Allow"** when it asks for camera permission
- If you denied it: Settings → HelloBrick → Camera → Enable

---

## Troubleshooting

### Device Not Showing in Xcode?

1. **Check USB connection**
   - Try a different USB cable
   - Try a different USB port
   - Make sure cable supports data (not just charging)

2. **Trust computer**
   - On iPhone: Settings → General → Reset → Reset Location & Privacy
   - Reconnect and trust again

3. **Restart Xcode**
   - Quit Xcode completely
   - Reopen the project

### "No Signing Certificate" Error?

1. In Xcode → Signing & Capabilities
2. Select your Team (Apple ID)
3. If no team: Click "Add Account..." and sign in
4. Free Apple ID works - no paid developer account needed!

### "Developer Mode" Error?

1. On iPhone: Settings → Privacy & Security → Developer Mode
2. Toggle ON
3. Restart iPhone
4. Confirm when prompted

### Build Fails?

1. **Clean build:**
   - Product → Clean Build Folder (Cmd+Shift+K)
   - Then try building again

2. **Check for errors:**
   - Look at the error messages in Xcode
   - Fix any code issues shown

---

## Quick Checklist

- [ ] iPhone connected via USB
- [ ] iPhone unlocked
- [ ] Trusted computer on iPhone
- [ ] Device selected in Xcode dropdown
- [ ] Signing configured (Team selected)
- [ ] Developer Mode enabled (if iOS 16+)
- [ ] Click Play button (▶️)
- [ ] Wait for build
- [ ] App launches on iPhone!

---

## After Launch

Once the app is on your iPhone:
- Test all features
- Make sure backend is running (for detection)
- Test camera and detection
- Test quests and gamification

---

## Quick Command Reference

**Open Xcode project:**
```bash
npx cap open ios
```

**Rebuild after code changes:**
```bash
npm run build
npx cap sync ios
# Then click Play in Xcode again
```




