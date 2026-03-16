---
name: iOS App Store Deployment
overview: Complete the iOS app configuration, create all required assets, set up App Store Connect, and submit the app for review to go live on the App Store within the next few days.
todos:
  - id: update-privacy-descriptions
    content: Update Info.plist to remove 'LEGO' references from camera/photo permission descriptions
    status: completed
  - id: generate-app-icons
    content: Generate all required app icon sizes (20x20 to 1024x1024) from new logo design and update Contents.json
    status: completed
  - id: update-splash-screens
    content: Create/update splash screens with new branding for all device sizes
    status: completed
  - id: configure-build-settings
    content: Set version numbers, bundle ID, and minimum iOS version in Xcode project
    status: completed
  - id: capture-screenshots
    content: Capture App Store screenshots for all required device sizes (iPhone 6.7", 6.5", 5.5", iPad Pro 12.9", 11")
    status: completed
  - id: create-app-store-description
    content: Write app description, subtitle, keywords, and promotional text for App Store listing
    status: completed
  - id: setup-apple-developer
    content: Sign up for Apple Developer Program ($99/year) and wait for approval
    status: completed
  - id: create-app-store-connect-listing
    content: Create new app in App Store Connect, set category, pricing, and availability
    status: completed
    dependencies:
      - setup-apple-developer
  - id: host-privacy-policy
    content: Host privacy policy at publicly accessible URL (GitHub Pages, website, etc.)
    status: completed
  - id: configure-code-signing
    content: Set up code signing in Xcode with Apple Developer Team, enable automatic signing
    status: completed
    dependencies:
      - setup-apple-developer
  - id: build-and-archive
    content: Build production version, archive in Xcode, validate archive
    status: completed
    dependencies:
      - update-privacy-descriptions
      - generate-app-icons
      - configure-code-signing
  - id: upload-to-app-store-connect
    content: Distribute archive to App Store Connect and wait for processing
    status: completed
    dependencies:
      - build-and-archive
      - create-app-store-connect-listing
  - id: complete-app-store-listing
    content: Upload screenshots, add description, set support URL, privacy policy URL in App Store Connect
    status: completed
    dependencies:
      - upload-to-app-store-connect
      - capture-screenshots
      - create-app-store-description
      - host-privacy-policy
  - id: submit-for-review
    content: Select build, complete export compliance, submit app for App Store review
    status: completed
    dependencies:
      - complete-app-store-listing
---

# iOS App Store Deployment Plan

## Current Status

- ✅ Capacitor configured with iOS platform
- ✅ iOS project exists in `ios/App/`
- ✅ Basic Info.plist with camera permissions
- ✅ Privacy policy document exists
- ✅ Privacy descriptions updated (removed "LEGO" references)
- ✅ Capacitor config updated (removed "LEGO", added SplashScreen config)
- ✅ App Store description content created (APP_STORE_DESCRIPTION.md)
- ✅ Icon Contents.json updated with all required sizes
- ✅ Build settings verified (version 1.0.0, build 1, iOS 13.0+)
- ⚠️ App icons need to be generated (Contents.json ready, need PNG files)
- ⚠️ Splash screens need updating with new branding
- ❌ App Store screenshots not captured yet
- ❌ App Store Connect setup not done
- ❌ Privacy policy not hosted publicly yet

## Phase 1: iOS Project Configuration (Day 1 - Morning)

### 1.1 Update Privacy Descriptions

**File**: `ios/App/App/Info.plist`

- Remove "LEGO" references from `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription`
- Update to: "This app needs camera access to scan and identify building bricks"
- Add `NSPhotoLibraryAddUsageDescription` if saving images

### 1.2 Complete App Icons

**Directory**: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

- Generate all required icon sizes from the new logo design:
  - 20x20 (@2x, @3x) = 40x40, 60x60
  - 29x29 (@2x, @3x) = 58x58, 87x87
  - 40x40 (@2x, @3x) = 80x80, 120x120
  - 60x60 (@2x, @3x) = 120x120, 180x180
  - 76x76 (@2x) = 152x152 (iPad)
  - 83.5x83.5 (@2x) = 167x167 (iPad Pro)
  - 1024x1024 (App Store)
- Update `Contents.json` with all icon entries
- Use the new logo mark (yellow square with orange inner square and black squares)

### 1.3 Update Splash Screens

**Directory**: `ios/App/App/Assets.xcassets/Splash.imageset/`

- Create splash screens matching app branding
- Include logo centered on background
- Support all device sizes (iPhone, iPad)

### 1.4 Configure Build Settings

**File**: `ios/App/App.xcodeproj/project.pbxproj` (via Xcode)

- Set `MARKETING_VERSION` to "1.0.0"
- Set `CURRENT_PROJECT_VERSION` to "1"
- Verify `PRODUCT_BUNDLE_IDENTIFIER` is "com.hellobrick.app"
- Set minimum iOS version to 13.0 (or higher if needed)
- Configure build configurations (Debug, Release)

### 1.5 Update Capacitor Config

**File**: `capacitor.config.ts`

- Verify `appId` matches bundle identifier
- Add iOS-specific settings if needed
- Ensure `webDir` points to `dist`

## Phase 2: App Store Assets Creation (Day 1 - Afternoon)

### 2.1 App Store Screenshots

**Required sizes** (at minimum):

- iPhone 6.7" (iPhone 14 Pro Max): 1290x2796
- iPhone 6.5" (iPhone 11 Pro Max): 1242x2688
- iPhone 5.5" (iPhone 8 Plus): 1242x2208
- iPad Pro 12.9": 2048x2732
- iPad Pro 11": 1668x2388

**Content to capture**:

- Home screen with scanner CTA
- Scanner screen with detection overlay
- Collection screen showing bricks
- Quests screen
- Profile screen
- Feed screen (if applicable)

### 2.2 App Preview Video (Optional but Recommended)

- 15-30 second video showing key features
- Record on actual device
- Show scanning, detection, collection features

### 2.3 App Icon for App Store

- 1024x1024 PNG (no transparency, no rounded corners)
- Based on new logo design

## Phase 3: App Store Connect Setup (Day 2 - Morning)

### 3.1 Apple Developer Account

- **Required**: Paid Apple Developer Program membership ($99/year)
- Sign up at: https://developer.apple.com/programs/
- Wait for approval (usually instant, can take up to 48 hours)

### 3.2 Create App in App Store Connect

- Log into https://appstoreconnect.apple.com
- Click "+" to create new app
- Fill in:
  - **Name**: HelloBrick
  - **Primary Language**: English
  - **Bundle ID**: com.hellobrick.app (must match Xcode)
  - **SKU**: Unique identifier (e.g., "hellobrick-001")
  - **User Access**: Full Access

### 3.3 App Information

- **Category**: Utilities or Productivity
- **Subcategory**: (optional)
- **Content Rights**: Confirm you have rights to all content
- **Age Rating**: Complete questionnaire (likely 4+ or 9+)

### 3.4 Pricing and Availability

- Set price (Free or Paid)
- Select countries/regions
- Set availability date

## Phase 4: App Store Listing Content (Day 2 - Afternoon)

### 4.1 App Description

**File**: Create `APP_STORE_DESCRIPTION.md`

- **Subtitle** (30 chars): "AI Building Brick Scanner"
- **Description** (4000 chars max):
  - Highlight key features
  - Explain AI detection
  - Mention collection organization
  - Include quests/gamification
  - Call to action

### 4.2 Keywords

- Maximum 100 characters
- Include: building bricks, scanner, AI, detection, collection, organization, LEGO alternative

### 4.3 Support URL

- Host privacy policy at: https://hellobrick.app/privacy (or similar)
- Create support page/email

### 4.4 Marketing URL (Optional)

- Landing page: https://hellobrick.app

### 4.5 Privacy Policy URL

- Must be publicly accessible
- Use existing `PRIVACY_POLICY.md` content
- Host on website or GitHub Pages

### 4.6 Promotional Text (Optional)

- 170 characters
- Can be updated without new submission

## Phase 5: Code Signing & Certificates (Day 2 - Evening)

### 5.1 Xcode Signing Setup

**In Xcode**:

1. Open `ios/App/App.xcworkspace`
2. Select "App" target
3. Go to "Signing & Capabilities"
4. Enable "Automatically manage signing"
5. Select your Apple Developer Team
6. Xcode will create:

   - Development certificate
   - Distribution certificate
   - Provisioning profiles

### 5.2 Verify Bundle ID

- Ensure `com.hellobrick.app` matches App Store Connect
- If conflict, update in App Store Connect or Xcode

## Phase 6: Build & Archive (Day 3 - Morning)

### 6.1 Production Build

```bash
# Build web app
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### 6.2 Archive in Xcode

1. Select "Any iOS Device" or "Generic iOS Device" as target
2. Product > Archive
3. Wait for build to complete
4. Organizer window opens automatically

### 6.3 Validate Archive

1. In Organizer, select archive
2. Click "Validate App"
3. Fix any issues (missing icons, etc.)
4. Re-archive if needed

### 6.4 Distribute to App Store

1. In Organizer, select validated archive
2. Click "Distribute App"
3. Choose "App Store Connect"
4. Select "Upload"
5. Follow wizard:

   - Select distribution options
   - App Store Connect distribution
   - Automatic signing (recommended)
   - Upload

### 6.5 Wait for Processing

- App Store Connect processes upload (15 minutes to 2 hours)
- Check status in App Store Connect > TestFlight or App Store > App Information

## Phase 7: TestFlight Beta Testing (Day 3 - Afternoon, Optional but Recommended)

### 7.1 Enable TestFlight

- In App Store Connect, go to TestFlight tab
- Add internal testers (up to 100)
- Add external testers (up to 10,000) - requires Beta App Review

### 7.2 Test on Devices

- Install TestFlight app on test devices
- Invite testers via email
- Test all features thoroughly
- Fix critical bugs before submission

## Phase 8: Final Submission (Day 3 - Evening or Day 4)

### 8.1 Complete App Store Listing

- Upload all screenshots
- Add app description
- Set keywords
- Add support URL
- Add privacy policy URL
- Upload app preview (optional)

### 8.2 Build Selection

- In App Store Connect > App Store > Version
- Select the uploaded build
- If build doesn't appear, wait for processing

### 8.3 Export Compliance

- Answer export compliance questions
- If using encryption: May need to provide details

### 8.4 Content Rights

- Confirm you have rights to all content
- Confirm age rating is accurate

### 8.5 Advertising Identifier (IDFA)

- If not using ads: Select "No"
- If using analytics: May need to declare

### 8.6 Submit for Review

- Click "Submit for Review"
- App status changes to "Waiting for Review"
- Review typically takes 24-48 hours (can be up to 7 days)

## Phase 9: Post-Submission (Day 4+)

### 9.1 Monitor Review Status

- Check App Store Connect daily
- Respond to any reviewer questions quickly
- If rejected: Address issues and resubmit

### 9.2 Prepare for Launch

- Set up analytics (if not already)
- Prepare marketing materials
- Announce launch date
- Monitor for crashes/issues

### 9.3 After Approval

- App status changes to "Ready for Sale"
- App appears in App Store within 24 hours
- Monitor reviews and ratings
- Respond to user feedback

## Critical Files to Update

1. **`ios/App/App/Info.plist`**: Remove "LEGO" references
2. **`ios/App/App/Assets.xcassets/AppIcon.appiconset/`**: Add all icon sizes
3. **`ios/App/App/Assets.xcassets/Splash.imageset/`**: Update splash screens
4. **`capacitor.config.ts`**: Verify configuration
5. **Create `APP_STORE_DESCRIPTION.md`**: Write app description
6. **Host `PRIVACY_POLICY.md`**: Make publicly accessible

## Prerequisites Checklist

- [ ] Apple Developer Program membership ($99/year)
- [ ] Mac with Xcode 14+ installed
- [ ] iOS device for testing (optional but recommended)
- [ ] Website/domain for privacy policy hosting
- [ ] All app icons generated (1024x1024 source)
- [ ] Screenshots captured on devices
- [ ] App tested thoroughly on physical device

## Timeline Estimate

- **Day 1**: Configuration + Assets (8-10 hours)
- **Day 2**: App Store Connect setup + Listing content (4-6 hours)
- **Day 3**: Build, archive, upload, TestFlight (4-6 hours)
- **Day 4**: Submit for review
- **Day 5-7**: Wait for review (24-48 hours typical)
- **Total**: 3-4 days to submission, 5-7 days to live

## Notes

- Apple Developer account approval can take up to 48 hours (usually instant)
- App review typically takes 24-48 hours (can be up to 7 days)
- First submission may take longer to review
- TestFlight beta review takes 24-48 hours (for external testers)
- All "LEGO" references must be removed before submission
- Privacy policy must be publicly accessible
- App icons must be complete (missing icons will cause rejection)