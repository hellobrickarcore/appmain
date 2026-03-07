# iOS Requirements Clarification: Assets & Developer Setup

## 📦 ASSETS REQUIRED

### 1. App Icons (REQUIRED - BLOCKER)

**What You Need:**
- **1 source image**: 1024×1024 PNG with HelloBrick logo
- **15 generated icons**: All sizes automatically generated from source

**Icon Specifications:**
- **Format**: PNG (no transparency for App Store icon)
- **Design**: 
  - Yellow outer rounded square (#FFD600)
  - Orange inner rounded square (#F97316)
  - Two small black squares inside
- **No rounded corners** (Apple adds them automatically)
- **No transparency** for App Store icon (1024×1024)

**Required Sizes (15 total):**
```
iPhone:
- 40×40 (20pt @2x)
- 60×60 (20pt @3x)
- 58×58 (29pt @2x)
- 87×87 (29pt @3x)
- 80×80 (40pt @2x)
- 120×120 (40pt @3x)
- 120×120 (60pt @2x)
- 180×180 (60pt @3x)

iPad:
- 20×20 (20pt @1x)
- 40×40 (20pt @2x)
- 29×29 (29pt @1x)
- 58×58 (29pt @2x)
- 40×40 (40pt @1x)
- 80×80 (40pt @2x)
- 76×76 (76pt @1x)
- 152×152 (76pt @2x)
- 167×167 (83.5pt @2x)

App Store:
- 1024×1024 (marketing icon)
```

**How to Generate:**
1. Create 1024×1024 source image
2. Use provided script: `./scripts/generate-icons.sh icon-1024.png`
3. Or use Xcode (drag 1024×1024 into AppIcon asset - auto-generates all sizes)
4. Or use online tool: https://appicon.co/

**Time Required:** 15-30 minutes
**Priority:** 🔴 HIGH (blocks App Store submission)

---

### 2. Splash Screens (REQUIRED)

**What You Need:**
- **9 splash screen images** for different device sizes
- HelloBrick branding (logo + colors)

**Splash Screen Specifications:**
- **Background**: Yellow (#FFD600) or dark blue (#0B1736)
- **Center**: HelloBrick logo
- **Text**: "HelloBrick" (optional)

**Required Sizes (9 total):**
```
iPhone:
- 640×1136 (iPhone 5/SE)
- 750×1334 (iPhone 6/7/8)
- 1242×2208 (iPhone 6+/7+/8+)
- 1125×2436 (iPhone X/XS)
- 1242×2688 (iPhone XS Max)
- 1284×2778 (iPhone 14 Pro Max)

iPad:
- 1536×2048 (iPad)
- 1668×2224 (iPad Pro 10.5")
- 2048×2732 (iPad Pro 12.9")
```

**How to Generate:**
1. Use provided tool: `scripts/generate-splash-screens.html`
2. Create branded splash screens
3. Replace files in `ios/App/App/Assets.xcassets/Splash.imageset/`

**Time Required:** 10-15 minutes
**Priority:** 🟡 MEDIUM

---

### 3. Privacy Policy (REQUIRED)

**What You Need:**
- **1 HTML file**: Already created (`scripts/setup-privacy-policy.html`)
- **1 public HTTPS URL**: Where it's hosted

**Hosting Options (FREE):**
1. **GitHub Pages** (Recommended)
   - Create repo
   - Upload HTML file (rename to `index.html`)
   - Enable GitHub Pages in settings
   - URL: `https://yourusername.github.io/repo-name/`

2. **Netlify** (Easiest)
   - Go to https://netlify.com
   - Drag & drop HTML file
   - Get instant URL

3. **Vercel** (Fast)
   - Go to https://vercel.com
   - Upload HTML file
   - Get instant URL

4. **Your Own Website**
   - Upload to your existing website
   - Must be HTTPS

**Time Required:** 15-30 minutes
**Priority:** 🟡 MEDIUM (required for App Store listing)

---

### 4. App Store Screenshots (REQUIRED)

**What You Need:**
- **Screenshots for each device size** showing your app

**Required Sizes:**
```
iPhone 6.7" (1290×2796): iPhone 14 Pro Max, 15 Pro Max
iPhone 6.5" (1242×2688): iPhone 11 Pro Max, XS Max
iPhone 5.5" (1242×2208): iPhone 8 Plus
iPad Pro 12.9" (2048×2732)
iPad Pro 11" (1668×2388)
```

**Screenshots Needed (6 screens):**
1. Home screen with scanner CTA
2. Scanner screen with detection overlay
3. Collection screen showing bricks
4. Quests screen
5. Profile screen
6. Feed screen

**How to Capture:**
- Run app on device/simulator
- Navigate to each screen
- Take screenshots (Cmd+S in simulator, or device screenshot)
- Organize by device size

**Time Required:** 30-60 minutes
**Priority:** 🟡 MEDIUM (can do after build is uploaded)

---

## 👤 DEVELOPER SETUP REQUIRED

### 1. Apple Developer Account (REQUIRED - BLOCKER)

**What You Need:**
- **Apple ID** (personal or business)
- **Credit card** for payment
- **$99 USD/year** annual fee

**Account Types:**
- **Individual**: Personal Apple ID, $99/year, your name as developer
- **Organization**: Business Apple ID, $99/year, requires D-U-N-S number, company name as developer

**What You Get:**
- Access to App Store Connect
- Ability to submit apps to App Store
- TestFlight beta testing
- Developer certificates and provisioning profiles
- Access to beta iOS versions

**Enrollment Steps:**
1. Go to https://developer.apple.com/programs/
2. Click "Enroll"
3. Sign in with Apple ID
4. Complete enrollment form:
   - Personal or Organization
   - Contact information
   - Payment ($99/year)
5. Wait for approval:
   - **Individual**: Usually instant (minutes)
   - **Organization**: 1-2 business days (D-U-N-S verification)

**Time Required:** 30-60 minutes + approval wait
**Priority:** 🔴 HIGH (required for submission)

**Cost:** $99 USD/year (auto-renewal, can cancel)

---

### 2. App Store Connect Setup (REQUIRED)

**Prerequisites:**
- Apple Developer account must be approved

**What You Need:**
- Access to App Store Connect (comes with Developer account)
- App information ready

**Steps:**
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: HelloBrick
   - **Primary Language**: English
   - **Bundle ID**: com.hellobrick.app (must match Xcode)
   - **SKU**: hellobrick-001 (or any unique identifier)
   - **User Access**: Full Access
4. Click "Create"
5. Complete app information:
   - **Category**: Utilities or Productivity
   - **Age Rating**: Complete questionnaire
   - **Content Rights**: Confirm you own/have rights

**Time Required:** 15-30 minutes
**Priority:** 🔴 HIGH (required for submission)

---

### 3. Code Signing Configuration (REQUIRED)

**Prerequisites:**
- Apple Developer account approved
- App created in App Store Connect
- Xcode installed

**What You Need:**
- Xcode installed on Mac
- Apple Developer Team selected

**Steps:**
1. Open project in Xcode:
   ```bash
   npm run build
   npx cap sync ios
   npx cap open ios
   ```
2. In Xcode:
   - Select "App" target
   - Go to "Signing & Capabilities" tab
   - Enable "Automatically manage signing"
   - Select your Apple Developer Team
   - Xcode creates provisioning profile automatically

**Time Required:** 10-15 minutes
**Priority:** 🔴 HIGH (required for building)

---

## 📊 SUMMARY

### Assets Checklist
- [ ] **App Icons** (15 sizes) - 15-30 min - 🔴 HIGH
- [ ] **Splash Screens** (9 sizes) - 10-15 min - 🟡 MEDIUM
- [ ] **Privacy Policy** (hosted URL) - 15-30 min - 🟡 MEDIUM
- [ ] **App Store Screenshots** (6 screens × 5 device sizes) - 30-60 min - 🟡 MEDIUM

### Developer Setup Checklist
- [ ] **Apple Developer Account** - 30-60 min + approval - 🔴 HIGH
- [ ] **App Store Connect** (create app) - 15-30 min - 🔴 HIGH
- [ ] **Code Signing** (in Xcode) - 10-15 min - 🔴 HIGH

### Total Time Estimate
- **Assets**: 1-2 hours
- **Developer Setup**: 1-2 hours
- **Total**: 2-4 hours of work

### Costs
- **Apple Developer Program**: $99 USD/year (one-time annual fee)
- **Assets**: FREE (use provided tools)
- **Hosting**: FREE (GitHub Pages, Netlify, or Vercel)

---

## 🎯 IMMEDIATE NEXT ACTIONS

1. **Generate App Icons** (BLOCKER)
   - Create 1024×1024 source image
   - Run: `./scripts/generate-icons.sh icon-1024.png`

2. **Set Up Apple Developer Account** (BLOCKER)
   - Go to https://developer.apple.com/programs/
   - Enroll ($99/year)
   - Wait for approval

3. **Create App in App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Create new app with Bundle ID: com.hellobrick.app

---

## 📚 Reference Documents

- `IOS_NEXT_STEPS.md` - Complete step-by-step guide
- `GUIDE_APPLE_DEVELOPER_SETUP.md` - Developer account setup details
- `GUIDE_APP_STORE_CONNECT.md` - App Store Connect setup details
- `GENERATE_APP_ICONS.md` - Icon generation instructions
- `GUIDE_CODE_SIGNING.md` - Code signing configuration

---

**Status**: All requirements clarified. Ready to proceed! 🚀




