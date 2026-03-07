# Testing Checklist - HelloBrick App

## Pre-Testing Setup

### 1. Start Backend Services
```bash
./start-all-services.sh
```

This starts:
- ✅ Auth Service (port 3005)
- ✅ XP Service (port 3005)
- ✅ Feed Service (port 3006)
- ✅ Detection Server (port 3004)

### 2. Build and Sync App
```bash
npm run build
npm run mobile:sync
```

### 3. Open in Xcode
```bash
npm run mobile:ios
```

## Testing Checklist

### ✅ Authentication & Account
- [ ] **Email Signup**
  - [ ] Create account with email/password
  - [ ] Validation works (email format, password length)
  - [ ] Password show/hide toggle works
  - [ ] Account created successfully
  - [ ] User ID saved to localStorage

- [ ] **Email Login**
  - [ ] Login with correct credentials
  - [ ] Login fails with wrong password
  - [ ] Login fails with non-existent email
  - [ ] User stays logged in after app restart

- [ ] **Google Sign In** (if Supabase configured)
  - [ ] Google sign-in button appears
  - [ ] OAuth flow works
  - [ ] User authenticated after OAuth

### ✅ Settings Screen
- [ ] **Privacy Toggle**
  - [ ] Toggle switches on/off
  - [ ] Setting persists after app restart
  - [ ] Setting saved to backend (check logs)

- [ ] **Push Notifications Toggle**
  - [ ] Toggle switches on/off
  - [ ] Setting persists after app restart
  - [ ] Permission requested on native (iOS/Android)
  - [ ] Setting saved to backend

- [ ] **Reset Password**
  - [ ] Button opens modal
  - [ ] Email input works
  - [ ] Reset email sent (check console/logs)
  - [ ] Modal closes after submission

- [ ] **Privacy Policy**
  - [ ] Button opens privacy policy in new tab
  - [ ] Page loads correctly
  - [ ] Content is readable

- [ ] **Terms of Service**
  - [ ] Button opens terms in new tab
  - [ ] Page loads correctly
  - [ ] Content is readable

- [ ] **Delete Account**
  - [ ] Step 1: Initial warning appears
  - [ ] Step 2: Data loss warning with list
  - [ ] Step 3: Type "CONFIRM" required
  - [ ] Delete button disabled until "CONFIRM" typed
  - [ ] Account deleted successfully
  - [ ] User logged out after deletion
  - [ ] Data cleared from localStorage

### ✅ Camera & Scanning
- [ ] **Camera Quality**
  - [ ] Camera is sharp (1920x1080)
  - [ ] Video is smooth (30fps)
  - [ ] Tap-to-focus works
  - [ ] Focus indicator appears on tap

- [ ] **Brick Detection**
  - [ ] Bounding boxes appear
  - [ ] Boxes are correctly positioned
  - [ ] Detection is accurate
  - [ ] Multiple bricks detected

- [ ] **Save to Collection**
  - [ ] Bricks saved correctly
  - [ ] Collection updates
  - [ ] Data persists

### ✅ Feed/Connect Screen
- [ ] **Create Post**
  - [ ] "Create post" button works
  - [ ] Camera opens
  - [ ] Capture button visible
  - [ ] Photo captured
  - [ ] Caption modal appears
  - [ ] Post submitted
  - [ ] Post shows as "pending"

- [ ] **Post Interactions**
  - [ ] Like button works
  - [ ] Like count updates
  - [ ] Comment button visible (pro only)
  - [ ] Comments restricted to pro users

### ✅ Home Screen
- [ ] **Scrolling**
  - [ ] Page scrolls vertically
  - [ ] All content accessible
  - [ ] No content cut off

### ✅ Profile Screen
- [ ] **Resume Sorting**
  - [ ] Shows dynamic data (not dummy)
  - [ ] Updates correctly

### ✅ Quests Screen
- [ ] **Layout**
  - [ ] Buttons aligned correctly
  - [ ] Streak indicator positioned properly
  - [ ] No overflow issues

### ✅ Settings Screen
- [ ] **Text Overflow**
  - [ ] All text visible
  - [ ] No words cut off
  - [ ] Proper truncation where needed

## Known Issues to Watch For

1. **Camera Blur**: Should be fixed with 1920x1080 resolution
2. **Bounding Box Position**: Should be accurate now
3. **Settings Persistence**: Should work with localStorage + backend
4. **Delete Account**: Triple confirmation should prevent accidents

## Backend Service Health Checks

Check services are running:
```bash
curl http://localhost:3005/api/health  # Auth/XP Service
curl http://localhost:3006/api/feed/posts  # Feed Service
curl http://localhost:3004/api/health  # Detection Server
```

## Logs

Check service logs:
```bash
tail -f logs/auth-service.log
tail -f logs/xp-service.log
tail -f logs/feed-service.log
tail -f logs/detection-server.log
```

## Stop Services

When done testing:
```bash
./stop-all-services.sh
```

## Next Steps After Testing

1. Fix any bugs found
2. Test on physical iPhone
3. Test on Android device
4. Submit to App Store
