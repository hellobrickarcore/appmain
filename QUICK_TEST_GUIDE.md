# Quick Test Guide - HelloBrick

## 🚀 Quick Start Testing

### Step 1: Start Backend Services
```bash
./start-all-services.sh
```

This starts all required services:
- Auth Service (port 3005)
- XP Service (port 3005) 
- Feed Service (port 3006)
- Detection Server (port 3004)

### Step 2: Build & Sync
```bash
npm run build
npm run mobile:sync
```

### Step 3: Open in Xcode
```bash
npm run mobile:ios
```

Then in Xcode:
1. Select your iPhone as the target device
2. Click the Play button (▶️) to build and run

## 🧪 What to Test

### Critical Tests
1. **Email Signup/Login** - Create account and login
2. **Settings Toggles** - Privacy and notifications should save
3. **Delete Account** - Triple confirmation flow
4. **Camera Quality** - Should be sharp (1920x1080)
5. **Brick Detection** - Bounding boxes should be accurate
6. **Feed Posts** - Create post with caption
7. **All Buttons** - Reset password, Privacy Policy, Terms

### Quick Verification
- ✅ Camera is sharp (not blurry)
- ✅ Bounding boxes are positioned correctly
- ✅ Settings persist after app restart
- ✅ Delete account requires typing "CONFIRM"
- ✅ All buttons work (no dead clicks)

## 🐛 If Something Breaks

### Services Not Running?
```bash
# Check if services are running
curl http://localhost:3005/api/health
curl http://localhost:3004/api/health

# Restart services
./stop-all-services.sh
./start-all-services.sh
```

### Build Errors?
```bash
# Clean and rebuild
rm -rf dist ios/App/Pods
npm run build
npm run mobile:sync
```

### Xcode Issues?
1. Clean build folder: Product → Clean Build Folder (Shift+Cmd+K)
2. Close and reopen Xcode
3. Run `pod install` in `ios/App` directory

## 📝 Logs

View service logs:
```bash
tail -f logs/auth-service.log
tail -f logs/xp-service.log
```

## 🛑 Stop Services

When done:
```bash
./stop-all-services.sh
```

## ✅ Success Criteria

App is ready when:
- [ ] All authentication works
- [ ] Settings save and persist
- [ ] Camera is sharp and responsive
- [ ] Detection is accurate
- [ ] No crashes or errors
- [ ] All buttons functional
