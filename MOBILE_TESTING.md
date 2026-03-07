# 📱 Mobile Device Testing Guide

## Prerequisites

### For iOS Testing:
- ✅ Mac computer (required for iOS development)
- ✅ Xcode 14+ installed
- ✅ Apple Developer account (free account works for testing)
- ✅ iPhone/iPad with USB cable
- ✅ iOS 13+ on your device

### For Android Testing:
- ✅ Android Studio installed
- ✅ Android SDK installed
- ✅ Android device with USB debugging enabled
- ✅ USB cable

---

## Step 1: Install Dependencies

```bash
cd /Users/akeemojuko/Downloads/hellobrick
npm install
```

This installs all packages including Capacitor plugins.

---

## Step 2: Build the Web App

```bash
npm run build
```

This creates the `dist/` folder with your compiled app.

---

## Step 3: Set Up Mobile Platforms

### Option A: Automated Setup (Recommended)

```bash
npm run setup:mobile
```

This will:
- Initialize Capacitor
- Add iOS and Android platforms
- Configure permissions automatically
- Sync everything

### Option B: Manual Setup

```bash
# Initialize Capacitor (if not done)
npx cap init

# Add platforms
npx cap add ios
npx cap add android

# Sync
npx cap sync
```

---

## Step 4: Test on iOS Device

### 4a. Open in Xcode

```bash
npm run mobile:ios
# OR
npx cap open ios
```

### 4b. Configure Signing

1. In Xcode, select the **App** target in the left sidebar
2. Go to **Signing & Capabilities** tab
3. Select your **Team** (your Apple ID)
4. Xcode will automatically create a provisioning profile

### 4c. Connect Your iPhone/iPad

1. Connect your device via USB
2. Unlock your device
3. Trust the computer if prompted
4. In Xcode, select your device from the device dropdown (top toolbar)

### 4d. Enable Developer Mode (iOS 16+)

If you see "Developer Mode" error:
1. On your device: Settings > Privacy & Security > Developer Mode
2. Toggle it ON
3. Restart your device
4. Confirm when prompted

### 4e. Run the App

1. Click the **Play** button (▶️) in Xcode
2. Wait for build to complete (first time: 5-10 minutes)
3. App will install and launch on your device

### 4f. Grant Camera Permission

When the app requests camera access:
1. Tap **Allow** when prompted
2. If denied, go to: Settings > HelloBrick > Camera > Enable

---

## Step 5: Test on Android Device

### 5a. Enable USB Debugging

On your Android device:
1. Go to **Settings > About Phone**
2. Tap **Build Number** 7 times (enables Developer Options)
3. Go back to **Settings > Developer Options**
4. Enable **USB Debugging**
5. Connect device via USB
6. Accept "Allow USB Debugging" prompt on device

### 5b. Open in Android Studio

```bash
npm run mobile:android
# OR
npx cap open android
```

### 5c. Wait for Gradle Sync

Android Studio will automatically sync Gradle (first time: 5-10 minutes)

### 5d. Select Your Device

1. In Android Studio, click the device dropdown (top toolbar)
2. Select your connected Android device
3. If device not showing, check USB connection and USB debugging

### 5e. Run the App

1. Click the **Run** button (▶️) or press `Shift+F10`
2. Wait for build (first time: 5-10 minutes)
3. App will install and launch on your device

### 5f. Grant Camera Permission

When the app requests camera access:
1. Tap **Allow** when prompted
2. If denied, go to: Settings > Apps > HelloBrick > Permissions > Camera > Enable

---

## Step 6: Testing Checklist

### ✅ Basic Functionality

- [ ] App launches without crashing
- [ ] Home screen displays correctly
- [ ] Navigation tabs work (Home, Scan, Quests, Inventory)
- [ ] BrickBuddy mascot appears and animates
- [ ] XP and streak display correctly

### ✅ Camera Testing

- [ ] Camera permission request appears
- [ ] Camera opens when tapping "Scan" tab
- [ ] Video feed displays (back camera on mobile)
- [ ] Camera works in both portrait and landscape
- [ ] Camera stops when leaving Scan tab

### ✅ Brick Detection

- [ ] "Scan Bricks" button works
- [ ] Scanning animation appears
- [ ] Mock detection results display
- [ ] Brick count shows correctly
- [ ] Colors and categories detected

### ✅ Quest System

- [ ] Quest cards display in Quests tab
- [ ] Can start a quest
- [ ] Quest completion awards XP
- [ ] Confetti animation plays on completion
- [ ] Progress updates correctly

### ✅ Gamification

- [ ] XP increases after completing quests
- [ ] Level increases when XP threshold reached
- [ ] Daily streak updates
- [ ] Badges unlock correctly
- [ ] Daily goals track progress

### ✅ UI/UX

- [ ] All buttons are tappable
- [ ] Animations are smooth
- [ ] Colors display correctly
- [ ] Text is readable
- [ ] Layout works on different screen sizes

---

## Step 7: Live Reload (Development)

For faster development, use live reload:

### 7a. Start Dev Server

```bash
npm run dev
```

Note the URL (usually `http://localhost:5173`)

### 7b. Update Capacitor Config

Edit `capacitor.config.ts`:

```typescript
server: {
  url: 'http://YOUR_IP:5173',  // Replace YOUR_IP with your computer's IP
  cleartext: true
}
```

Find your IP:
- **Mac/Linux**: `ifconfig | grep "inet "` or `ipconfig getifaddr en0`
- **Windows**: `ipconfig` (look for IPv4 Address)

Example:
```typescript
server: {
  url: 'http://192.168.1.100:5173',
  cleartext: true
}
```

### 7c. Sync and Run

```bash
npx cap sync
npm run mobile:ios    # or mobile:android
```

Now changes will reload automatically on your device!

---

## Step 8: Testing Real Brick Detection

Currently using mock detection. To test with real models:

### 8a. Get YOLO v11 ONNX Model

1. Download YOLO v11 from Ultralytics
2. Convert to ONNX:
   ```python
   from ultralytics import YOLO
   model = YOLO('yolo11n.pt')
   model.export(format='onnx', imgsz=640)
   ```

### 8b. Get SAM3 ONNX Model

1. Download SAM3 from Meta AI
2. Convert to ONNX (see SAM3 docs)

### 8c. Place Models

```
public/models/yolo11n.onnx
public/models/sam3.onnx
```

### 8d. Rebuild and Test

```bash
npm run build
npx cap sync
# Run on device again
```

---

## Troubleshooting

### Camera Not Working

**iOS:**
- Check `ios/App/App/Info.plist` has `NSCameraUsageDescription`
- Settings > HelloBrick > Camera > Enable
- Restart app

**Android:**
- Check `android/app/src/main/AndroidManifest.xml` has camera permission
- Settings > Apps > HelloBrick > Permissions > Camera > Enable
- Restart app

### App Crashes on Launch

- Check Xcode/Android Studio console for errors
- Verify all dependencies installed: `npm install`
- Try: `npx cap sync` and rebuild

### Build Errors

**iOS:**
- Clean build: Product > Clean Build Folder (Cmd+Shift+K)
- Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- Rebuild

**Android:**
- File > Invalidate Caches / Restart
- Clean: Build > Clean Project
- Rebuild

### Device Not Detected

**iOS:**
- Trust computer on device
- Check USB cable
- Restart Xcode

**Android:**
- Enable USB Debugging
- Check USB connection
- Run: `adb devices` to verify connection
- Install device drivers if needed

### Performance Issues

- Use smaller model variants (yolo11n instead of yolo11x)
- Reduce input image size in `brickDetectionService.ts`
- Test on newer devices first

---

## Quick Test Commands

```bash
# Full setup and test
npm install
npm run build
npm run setup:mobile
npm run mobile:ios      # or mobile:android

# After code changes
npm run build
npx cap sync
# Then run in Xcode/Android Studio again

# Live reload setup
npm run dev
# Update capacitor.config.ts with your IP
npx cap sync
npm run mobile:ios
```

---

## Expected Results

When testing, you should see:

1. **Home Screen**: Greeting, quest card, daily goals, stats
2. **Scan Tab**: Camera feed, scan button, detection results
3. **Quests Tab**: Quest cards with play buttons
4. **Inventory Tab**: Bins, badges, progress

All with smooth animations and the BrickBuddy mascot reacting to actions!

---

## Next Steps After Testing

1. ✅ Verify all features work
2. ✅ Test on multiple devices
3. ✅ Add real ML models (YOLO v11 + SAM3)
4. ✅ Optimize performance
5. ✅ Prepare for App Store/Play Store

---

**Happy Testing! 🎉**

