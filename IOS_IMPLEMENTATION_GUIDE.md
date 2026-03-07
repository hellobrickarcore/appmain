# iOS App Store Implementation Guide

This guide provides step-by-step instructions for completing all iOS deployment tasks.

## ✅ Completed Tasks

1. **Privacy Descriptions** - Updated Info.plist and Capacitor config
2. **App Store Description** - Created APP_STORE_DESCRIPTION.md
3. **Build Settings** - Verified version, build, and bundle ID

## 📋 Tasks Requiring Your Action

### 1. Generate App Icons ⚠️ IN PROGRESS

**Option A: Using the HTML Generator (Easiest)**
1. Open `scripts/generate-icon-1024.html` in your browser
2. Click "Download (Transparent Background)" to get the 1024×1024 source
3. Save it as `icon-source-1024.png` in the project root
4. Run the script:
   ```bash
   ./scripts/generate-icons.sh icon-source-1024.png
   ```
5. Verify all icons are in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

**Option B: Using Xcode (Recommended)**
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select `App` target > `General` tab
3. Under "App Icons and Launch Screen", click AppIcon
4. Generate 1024×1024 icon using the HTML generator above
5. Drag the 1024×1024 image into the App Store slot
6. Xcode will auto-generate all sizes

**Option C: Using Online Tool**
1. Go to https://www.appicon.co/
2. Upload your 1024×1024 icon
3. Download generated icon set
4. Extract to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### 2. Generate Splash Screens

1. Open `scripts/generate-splash-screens.html` in your browser
2. Download all required sizes:
   - iPhone Portrait (1242 × 2688)
   - iPhone Landscape (2688 × 1242)
   - iPad Portrait (2048 × 2732)
   - iPad Landscape (2732 × 2048)
3. Replace files in `ios/App/App/Assets.xcassets/Splash.imageset/`
4. Update `Contents.json` if filenames differ

### 3. Host Privacy Policy

**Option A: GitHub Pages (Free)**
1. Create a new GitHub repository (e.g., `hellobrick-privacy`)
2. Copy `scripts/setup-privacy-policy.html` to the repository
3. Rename to `index.html`
4. Enable GitHub Pages in repository settings
5. Use the GitHub Pages URL as your privacy policy URL

**Option B: Your Website**
1. Upload `scripts/setup-privacy-policy.html` to your web server
2. Accessible at: `https://yourdomain.com/privacy`
3. Use this URL in App Store Connect

**Option C: Netlify/Vercel (Free)**
1. Create account on Netlify or Vercel
2. Upload `scripts/setup-privacy-policy.html`
3. Get public URL
4. Use this URL in App Store Connect

### 4. Set Up Apple Developer Account

1. Go to https://developer.apple.com/programs/
2. Sign in with your Apple ID
3. Click "Enroll" and complete enrollment ($99/year)
4. Wait for approval (usually instant, can take up to 48 hours)
5. Once approved, you can proceed to App Store Connect

### 5. Create App in App Store Connect

1. Log into https://appstoreconnect.apple.com
2. Click "+" button to create new app
3. Fill in:
   - **Name**: HelloBrick
   - **Primary Language**: English
   - **Bundle ID**: com.hellobrick.app
   - **SKU**: hellobrick-001 (or unique identifier)
   - **User Access**: Full Access
4. Click "Create"
5. Complete App Information:
   - **Category**: Utilities or Productivity
   - **Content Rights**: Confirm you have rights
   - **Age Rating**: Complete questionnaire (likely 4+)
6. Set Pricing and Availability:
   - **Price**: Free (or set price)
   - **Availability**: All countries (or select specific)

### 6. Configure Code Signing in Xcode

1. Open `ios/App/App.xcworkspace` in Xcode
2. Select "App" target in left sidebar
3. Go to "Signing & Capabilities" tab
4. ✅ Check "Automatically manage signing"
5. Select your Apple Developer Team from dropdown
6. If not listed:
   - Click "Add Account..."
   - Sign in with your Apple Developer account
   - Select team
7. Xcode will automatically create certificates and provisioning profiles

### 7. Build and Archive

```bash
# 1. Build web app
npm run build

# 2. Sync to iOS
npx cap sync ios

# 3. Open in Xcode
npx cap open ios
```

**In Xcode:**
1. Select "Any iOS Device" or "Generic iOS Device" as target
2. Product > Archive
3. Wait for build (5-10 minutes first time)
4. Organizer window opens automatically

### 8. Validate and Upload

**In Xcode Organizer:**
1. Select your archive
2. Click "Validate App"
3. Fix any issues (missing icons, etc.)
4. Click "Distribute App"
5. Choose "App Store Connect"
6. Select "Upload"
7. Follow wizard:
   - Automatic signing (recommended)
   - Upload
8. Wait for processing (15 minutes to 2 hours)

### 9. Capture App Store Screenshots

**Required Sizes:**
- iPhone 6.7" (1290 × 2796)
- iPhone 6.5" (1242 × 2688)
- iPhone 5.5" (1242 × 2208)
- iPad Pro 12.9" (2048 × 2732)
- iPad Pro 11" (1668 × 2388)

**Screens to Capture:**
1. Home screen with scanner CTA
2. Scanner screen with detection overlay
3. Collection screen showing bricks
4. Quests screen
5. Profile screen
6. Feed screen

**How to Capture:**
1. Run app on device or simulator
2. Navigate to each screen
3. Take screenshot (Device: Power + Volume Up, Simulator: Cmd + S)
4. Use simulator with correct device size
5. Save screenshots with descriptive names

### 10. Complete App Store Listing

**In App Store Connect:**
1. Go to your app > "App Store" tab
2. Fill in:
   - **Subtitle**: "AI Building Brick Scanner" (from APP_STORE_DESCRIPTION.md)
   - **Description**: Copy from APP_STORE_DESCRIPTION.md
   - **Keywords**: building bricks,scanner,AI,detection,collection
   - **Support URL**: Your support page URL
   - **Privacy Policy URL**: Your hosted privacy policy URL
   - **Marketing URL**: (Optional) Your website
3. Upload screenshots for each device size
4. Upload app preview video (optional but recommended)
5. Select the uploaded build
6. Click "Save"

### 11. Submit for Review

**In App Store Connect:**
1. Go to "App Store" tab
2. Ensure all required fields are filled
3. Select the uploaded build
4. Answer export compliance questions
5. Confirm content rights
6. Click "Submit for Review"
7. App status changes to "Waiting for Review"

## 📝 Checklist

- [ ] Generate app icons (1024×1024 source + all sizes)
- [ ] Generate splash screens (all device sizes)
- [ ] Host privacy policy publicly
- [ ] Set up Apple Developer account
- [ ] Create app in App Store Connect
- [ ] Configure code signing in Xcode
- [ ] Build and archive app
- [ ] Validate and upload to App Store Connect
- [ ] Capture App Store screenshots
- [ ] Complete App Store listing
- [ ] Submit for review

## ⏱️ Timeline

- **Today**: Generate icons, splash screens, host privacy policy (2-3 hours)
- **Tomorrow**: Set up Apple Developer, create app, configure signing (1-2 hours)
- **Day 3**: Build, archive, upload, capture screenshots (3-4 hours)
- **Day 4**: Complete listing, submit for review (1 hour)
- **Day 5-7**: Wait for review (24-48 hours typical)

## 🆘 Troubleshooting

**"No valid code signing certificates"**
- Ensure Apple Developer account is active
- Check Xcode > Preferences > Accounts
- Add your Apple ID if not listed

**"Bundle ID already exists"**
- Change Bundle ID in Xcode to something unique
- Or use existing Bundle ID if you own it

**"Missing app icons"**
- Ensure all icon sizes are in AppIcon.appiconset
- Verify Contents.json references correct filenames
- Re-archive after adding icons

**"Privacy policy URL not accessible"**
- Verify URL is publicly accessible (no login required)
- Check URL returns 200 status code
- Ensure HTTPS is used

## 📚 Additional Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)




