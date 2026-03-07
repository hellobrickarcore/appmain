# iOS App Store Deployment - Quick Start Guide

## Prerequisites Checklist

- [ ] Mac computer (required for iOS development)
- [ ] Xcode 14+ installed (check: `xcodebuild -version`)
- [ ] Apple Developer account ($99/year) - [Sign up here](https://developer.apple.com/programs/)
- [ ] iOS device for testing (optional but recommended)

## Step 1: Generate App Icons (REQUIRED)

You need to create a 1024x1024 PNG image with the new logo design, then generate all icon sizes.

### Option A: Using the Script (Requires ImageMagick)
```bash
# Install ImageMagick if needed
brew install imagemagick

# Generate icons (replace with path to your 1024x1024 source image)
./scripts/generate-icons.sh path/to/your-logo-1024x1024.png
```

### Option B: Using Xcode (Easiest)
1. Create 1024x1024 PNG with new logo design
2. Open `ios/App/App.xcworkspace` in Xcode
3. Select `App` target > `General` tab
4. Under `App Icons and Launch Screen`, click AppIcon
5. Drag your 1024x1024 image into the 1024x1024 slot
6. Xcode will auto-generate all sizes

### Option C: Online Tool
1. Go to https://www.appicon.co/
2. Upload your 1024x1024 image
3. Download generated icon set
4. Extract to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

## Step 2: Set Up Apple Developer Account

1. Go to https://developer.apple.com/programs/
2. Sign in with Apple ID
3. Enroll in Apple Developer Program ($99/year)
4. Wait for approval (usually instant, can take up to 48 hours)

## Step 3: Configure Code Signing in Xcode

1. Open `ios/App/App.xcworkspace` in Xcode
2. Select `App` target in left sidebar
3. Go to `Signing & Capabilities` tab
4. ✅ Check "Automatically manage signing"
5. Select your Apple Developer Team from dropdown
6. If not listed, click "Add Account..." and sign in
7. Xcode will automatically create certificates and provisioning profiles

## Step 4: Build and Test Locally

```bash
# Build web app
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

In Xcode:
1. Select your connected iPhone/iPad from device dropdown
2. Click Play button (▶️) to build and run
3. Grant camera permission when prompted
4. Test all features

## Step 5: Create App in App Store Connect

1. Log into https://appstoreconnect.apple.com
2. Click "+" to create new app
3. Fill in:
   - **Name**: HelloBrick
   - **Primary Language**: English
   - **Bundle ID**: com.hellobrick.app
   - **SKU**: hellobrick-001 (or unique identifier)
4. Click "Create"

## Step 6: Archive and Upload

1. In Xcode, select "Any iOS Device" or "Generic iOS Device"
2. Product > Archive
3. Wait for build (5-10 minutes first time)
4. In Organizer window:
   - Click "Validate App"
   - Fix any issues
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow wizard to upload

## Step 7: Complete App Store Listing

1. In App Store Connect, go to your app
2. Go to "App Store" tab
3. Fill in:
   - **Subtitle**: "AI Building Brick Scanner"
   - **Description**: Copy from `APP_STORE_DESCRIPTION.md`
   - **Keywords**: building bricks,scanner,AI,detection,collection
   - **Support URL**: Your support page URL
   - **Privacy Policy URL**: Your hosted privacy policy URL
4. Upload screenshots (see IOS_DEPLOYMENT_CHECKLIST.md for sizes)
5. Select the uploaded build
6. Click "Submit for Review"

## Step 8: Host Privacy Policy

You need to host `PRIVACY_POLICY.md` at a publicly accessible URL.

### Option A: GitHub Pages (Free)
1. Create a new GitHub repository
2. Upload PRIVACY_POLICY.md
3. Enable GitHub Pages in repository settings
4. Use the GitHub Pages URL as your privacy policy URL

### Option B: Your Own Website
1. Upload PRIVACY_POLICY.md to your web server
2. Accessible at: https://yourdomain.com/privacy

### Option C: Simple Hosting
- Netlify, Vercel, or similar free hosting
- Upload PRIVACY_POLICY.md
- Get public URL

## Current Status

✅ **Completed:**
- Privacy descriptions updated (removed LEGO)
- Capacitor config updated
- App Store description content created
- Icon Contents.json configured
- Build settings verified

⚠️ **Action Required:**
- Generate app icons (see Step 1)
- Set up Apple Developer account
- Host privacy policy publicly
- Capture App Store screenshots

## Timeline Estimate

- **Today**: Generate icons, set up developer account (1-2 hours)
- **Tomorrow**: Build, archive, upload, complete listing (2-3 hours)
- **Day 3**: Submit for review
- **Day 4-7**: Wait for review (24-48 hours typical)

## Helpful Commands

```bash
# Check Xcode version
xcodebuild -version

# Check if developer account is set up
security find-identity -v -p codesigning

# Build and sync
npm run build && npx cap sync ios

# Open in Xcode
npx cap open ios
```

## Troubleshooting

**"No valid code signing certificates"**
- Go to Xcode > Preferences > Accounts
- Add your Apple ID
- Select team in Signing & Capabilities

**"Bundle ID already exists"**
- Change Bundle ID in Xcode to something unique
- Or use a different Bundle ID in App Store Connect

**"Developer Mode" error on device**
- Settings > Privacy & Security > Developer Mode > Enable
- Device will restart

## Next Steps After Submission

1. Monitor review status in App Store Connect
2. Respond quickly to any reviewer questions
3. After approval, app goes live within 24 hours
4. Monitor reviews and ratings
5. Plan first update based on user feedback




