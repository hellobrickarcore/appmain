# Guide: Upload to App Store Connect

## Prerequisites

- ✅ App archived in Xcode
- ✅ Archive validated successfully
- ✅ App created in App Store Connect
- ✅ Code signing configured

## Step-by-Step Instructions

### 1. Open Organizer in Xcode

1. **Window > Organizer**
   - Or: Xcode > Window > Organizer
   - Or: Cmd + Shift + 9
2. Select **"Archives"** tab
3. Find your latest archive

### 2. Distribute App

1. Select your archive
2. Click **"Distribute App"** button
3. Choose distribution method:
   - **App Store Connect** ← Select this
   - Ad Hoc (for testing)
   - Enterprise (for internal)
   - Development (for devices)

### 3. Distribution Options

1. **Select "Upload"**
   - Not "Export" (that's for manual upload)
2. Click **"Next"**

### 4. Distribution Method

1. **App Store Connect distribution**
   - Automatic signing (recommended)
   - Or manual signing (advanced)
2. Click **"Next"**

### 5. App Thinning

1. **"Upload your app's symbols"** ✅ (recommended)
   - Helps with crash reports
2. **"Manage Version and Build Number"** (optional)
   - Can change version here if needed
3. Click **"Next"**

### 6. Review Summary

1. Check:
   - ✅ App name: HelloBrick
   - ✅ Version: 1.0.0
   - ✅ Build: 1
   - ✅ Bundle ID: com.hellobrick.app
   - ✅ Signing: Automatic
2. Click **"Upload"**

### 7. Upload Progress

1. **Xcode uploads archive**
   - Progress shown in Xcode
   - Can take 10-30 minutes
   - Depends on archive size and internet speed
2. **Wait for completion**
   - Don't close Xcode
   - Don't close Organizer

### 8. Upload Complete

**Success message:**
- ✅ "Upload successful"
- ✅ "Your app is being processed"

**If errors:**
- Check error message
- Common issues:
  - Network timeout → Try again
  - Code signing → Fix signing
  - Invalid bundle → Check bundle ID

## Check Processing Status

### In App Store Connect

1. Go to: https://appstoreconnect.apple.com
2. Select your app: **HelloBrick**
3. Go to **"TestFlight"** tab
4. Check **"iOS Builds"** section
5. Status will show:
   - **Processing** (15 minutes to 2 hours)
   - **Ready to Submit** ✅ (when done)
   - **Invalid Binary** ❌ (if issues)

### Processing Time

- **First upload**: 1-2 hours
- **Subsequent uploads**: 30-60 minutes
- **During busy times**: Up to 4 hours

## What Happens During Processing

Apple processes your app:
1. **Validates** binary
2. **Scans** for malware
3. **Checks** code signing
4. **Verifies** bundle ID
5. **Extracts** app metadata
6. **Generates** app preview images

## After Processing

**When status is "Ready to Submit":**

1. Go to **App Store** tab (not TestFlight)
2. Select version (1.0.0)
3. **Build** dropdown appears
4. Select your uploaded build
5. Complete App Store listing
6. Submit for review

## Troubleshooting

### "Upload failed"

**Common causes:**
- Network issues → Try again
- Code signing → Re-archive with correct signing
- Invalid bundle → Check bundle ID matches App Store Connect

### "Processing failed"

**Common causes:**
- Missing icons → Add all required icon sizes
- Invalid entitlements → Fix in Xcode
- Missing privacy policy → Add privacy policy URL

**Solution:**
1. Check email from Apple (usually sent)
2. Fix issues in Xcode
3. Re-archive and re-upload

### "Build not appearing"

**Wait longer:**
- Processing can take 2+ hours
- Check TestFlight tab (builds appear there first)
- Refresh App Store Connect page

### "Invalid binary"

**Check email from Apple:**
- Usually explains the issue
- Common: Missing icons, code signing, entitlements
- Fix and re-upload

## Next Steps

After successful upload and processing:
1. Build appears in App Store Connect
2. Complete App Store listing (see GUIDE_COMPLETE_LISTING.md)
3. Submit for review (see GUIDE_SUBMIT_REVIEW.md)

## Important Notes

- **Don't close Xcode** during upload
- **Keep archive** for version history
- **Processing is automatic** (no action needed)
- **Check email** for any issues
- **Can upload multiple builds** (only latest is used)




