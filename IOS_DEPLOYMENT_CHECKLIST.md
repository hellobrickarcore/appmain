# iOS App Store Deployment Checklist

## Phase 1: iOS Project Configuration ✅ IN PROGRESS

### 1.1 Update Privacy Descriptions ✅
- [x] Removed "LEGO" from `NSCameraUsageDescription` in Info.plist
- [x] Removed "LEGO" from `NSPhotoLibraryUsageDescription` in Info.plist
- [x] Added `NSPhotoLibraryAddUsageDescription` in Info.plist
- [x] Updated Capacitor config to remove "LEGO" references
- [x] Added SplashScreen configuration to Capacitor config

### 1.2 Complete App Icons ⚠️
- [x] Updated Contents.json with all required icon sizes
- [ ] Generate 1024x1024 source image with new logo design
- [ ] Generate all icon sizes (20x20 to 1024x1024)
- [ ] Place all PNG files in AppIcon.appiconset folder
- [ ] Verify icons in Xcode

**Action Required**: Create 1024x1024 source image and generate all sizes (see GENERATE_APP_ICONS.md)

### 1.3 Update Splash Screens ⚠️
- [ ] Review current splash screen assets
- [ ] Update splash screens with new branding (yellow/orange theme)
- [ ] Ensure splash screens match app icon design

### 1.4 Configure Build Settings ✅
- [x] Version: 1.0.0 (MARKETING_VERSION)
- [x] Build: 1 (CURRENT_PROJECT_VERSION)
- [x] Bundle ID: com.hellobrick.app
- [ ] Verify minimum iOS version (should be 13.0+)

### 1.5 Update Capacitor Config ✅
- [x] Verified appId matches bundle identifier
- [x] Updated webDir to 'dist'
- [x] Added SplashScreen plugin config

## Phase 2: App Store Assets Creation

### 2.1 App Store Screenshots
- [ ] Capture screenshots for iPhone 6.7" (1290x2796)
- [ ] Capture screenshots for iPhone 6.5" (1242x2688)
- [ ] Capture screenshots for iPhone 5.5" (1242x2208)
- [ ] Capture screenshots for iPad Pro 12.9" (2048x2732)
- [ ] Capture screenshots for iPad Pro 11" (1668x2388)

**Screenshots needed**:
1. Home screen with scanner CTA
2. Scanner screen with detection overlay
3. Collection screen showing bricks
4. Quests screen
5. Profile screen
6. Feed screen (if applicable)

### 2.2 App Preview Video (Optional)
- [ ] Record 15-30 second video showing key features
- [ ] Edit and optimize for App Store

### 2.3 App Icon for App Store ✅
- [x] Contents.json configured for 1024x1024
- [ ] Generate actual 1024x1024 PNG (no transparency, no rounded corners)

## Phase 3: App Store Connect Setup

### 3.1 Apple Developer Account
- [ ] Sign up for Apple Developer Program ($99/year)
- [ ] Wait for approval (usually instant, can take up to 48 hours)

### 3.2 Create App in App Store Connect
- [ ] Log into https://appstoreconnect.apple.com
- [ ] Create new app
- [ ] Set name: HelloBrick
- [ ] Set primary language: English
- [ ] Set Bundle ID: com.hellobrick.app
- [ ] Set SKU: hellobrick-001 (or unique identifier)

### 3.3 App Information
- [ ] Set category: Utilities or Productivity
- [ ] Complete age rating questionnaire
- [ ] Set content rights

### 3.4 Pricing and Availability
- [ ] Set price (Free recommended)
- [ ] Select countries/regions
- [ ] Set availability date

## Phase 4: App Store Listing Content ✅

### 4.1 App Description ✅
- [x] Created APP_STORE_DESCRIPTION.md with:
  - Subtitle: "AI Building Brick Scanner"
  - Full description (4000 chars)
  - Keywords
  - Promotional text
  - Support URL placeholder
  - Privacy policy URL placeholder

### 4.2 Host Privacy Policy
- [ ] Host PRIVACY_POLICY.md at publicly accessible URL
- [ ] Options:
  - GitHub Pages
  - Your own website
  - Simple hosting service

## Phase 5: Code Signing & Certificates

### 5.1 Xcode Signing Setup
- [ ] Open ios/App/App.xcworkspace in Xcode
- [ ] Select "App" target
- [ ] Go to "Signing & Capabilities"
- [ ] Enable "Automatically manage signing"
- [ ] Select Apple Developer Team
- [ ] Verify provisioning profile created

### 5.2 Verify Bundle ID
- [ ] Ensure com.hellobrick.app matches App Store Connect
- [ ] If conflict, update in App Store Connect or Xcode

## Phase 6: Build & Archive

### 6.1 Production Build
```bash
npm run build
npx cap sync ios
npx cap open ios
```

### 6.2 Archive in Xcode
- [ ] Select "Any iOS Device" or "Generic iOS Device"
- [ ] Product > Archive
- [ ] Wait for build to complete

### 6.3 Validate Archive
- [ ] In Organizer, select archive
- [ ] Click "Validate App"
- [ ] Fix any issues
- [ ] Re-archive if needed

### 6.4 Distribute to App Store
- [ ] In Organizer, select validated archive
- [ ] Click "Distribute App"
- [ ] Choose "App Store Connect"
- [ ] Select "Upload"
- [ ] Follow wizard

## Phase 7: TestFlight Beta Testing (Optional)

### 7.1 Enable TestFlight
- [ ] In App Store Connect, go to TestFlight tab
- [ ] Add internal testers (up to 100)
- [ ] Add external testers (requires Beta App Review)

### 7.2 Test on Devices
- [ ] Install TestFlight on test devices
- [ ] Invite testers
- [ ] Test all features
- [ ] Fix critical bugs

## Phase 8: Final Submission

### 8.1 Complete App Store Listing
- [ ] Upload all screenshots
- [ ] Add app description from APP_STORE_DESCRIPTION.md
- [ ] Set keywords
- [ ] Add support URL
- [ ] Add privacy policy URL
- [ ] Upload app preview (optional)

### 8.2 Build Selection
- [ ] In App Store Connect > App Store > Version
- [ ] Select the uploaded build
- [ ] Wait for processing if needed

### 8.3 Export Compliance
- [ ] Answer export compliance questions
- [ ] Provide encryption details if needed

### 8.4 Submit for Review
- [ ] Click "Submit for Review"
- [ ] Monitor review status

## Current Status

**Completed:**
- ✅ Privacy descriptions updated (removed LEGO references)
- ✅ Capacitor config updated
- ✅ App Store description content created
- ✅ Icon Contents.json updated with all sizes

**In Progress:**
- ⚠️ App icons need to be generated
- ⚠️ Splash screens need updating

**Next Steps:**
1. Generate app icons from 1024x1024 source
2. Update splash screens
3. Set up Apple Developer account
4. Create app in App Store Connect
5. Host privacy policy publicly




