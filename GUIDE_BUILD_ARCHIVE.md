# Guide: Build and Archive App

## Prerequisites

- ✅ Code signing configured in Xcode
- ✅ App created in App Store Connect
- ✅ All app icons generated and added
- ✅ Splash screens updated
- ✅ Web app built: `npm run build`

## Step-by-Step Instructions

### 1. Build Web App

```bash
cd /Users/akeemojuko/Downloads/hellobrick
npm run build
```

This creates the `dist/` folder with production build.

### 2. Sync to iOS

```bash
npx cap sync ios
```

This copies `dist/` to iOS project and updates native dependencies.

### 3. Open in Xcode

```bash
npx cap open ios
```

Or manually:
- Open `ios/App/App.xcworkspace` in Xcode

### 4. Select Build Target

1. In Xcode, look at the top toolbar
2. Click device selector (next to Play button)
3. Select **"Any iOS Device"** or **"Generic iOS Device"**
   - ⚠️ **Important**: Don't select simulator
   - Must select device for App Store archive

### 5. Clean Build (Optional but Recommended)

1. Product > Clean Build Folder (Shift + Cmd + K)
2. Wait for clean to complete

### 6. Archive App

1. **Product > Archive**
   - Or: Shift + Cmd + B
2. Wait for build (5-10 minutes first time)
   - Progress shown in Xcode status bar
   - May see warnings (usually OK)
3. **Organizer window opens automatically**
   - Shows your archive
   - Lists all previous archives

### 7. Verify Archive

**In Organizer:**

1. Select your archive (should be latest)
2. Check:
   - ✅ Version: 1.0.0
   - ✅ Build: 1
   - ✅ Date: Today
   - ✅ Size: Reasonable (not too large)

### 8. Validate Archive

**Before uploading:**

1. In Organizer, select archive
2. Click **"Validate App"** button
3. Follow wizard:
   - **Distribution**: App Store Connect
   - **Automatically manage signing**: ✅ (recommended)
   - Click **"Validate"**
4. Wait for validation (2-5 minutes)
5. **Fix any errors:**
   - Missing icons → Add icons
   - Code signing issues → Fix signing
   - Missing entitlements → Add in Xcode
6. **If validation passes**: ✅ Ready to upload

## Common Build Errors

### "Missing app icons"

**Solution:**
1. Ensure all icon sizes in `AppIcon.appiconset`
2. Verify `Contents.json` references correct files
3. Re-archive after adding icons

### "Code signing error"

**Solution:**
1. Check Signing & Capabilities tab
2. Verify team is selected
3. Try "Automatically manage signing" again
4. Clean build folder and re-archive

### "Missing entitlements"

**Solution:**
1. Go to Signing & Capabilities
2. Add required capabilities:
   - Camera (if using camera)
   - Photo Library (if saving photos)
3. Re-archive

### "Build failed"

**Solution:**
1. Check Xcode error messages
2. Common issues:
   - Missing dependencies
   - TypeScript errors
   - Missing files
3. Fix errors and re-archive

## Build Configuration

**For App Store (Release):**
- Configuration: Release
- Scheme: App
- Destination: Any iOS Device
- Archive: Yes

**For Testing (Debug):**
- Configuration: Debug
- Scheme: App
- Destination: Your device
- Archive: No (just build and run)

## Archive Size

**Typical sizes:**
- Small app: 10-50 MB
- Medium app: 50-100 MB
- Large app: 100+ MB

**If too large:**
- Optimize images
- Remove unused assets
- Enable compression
- Check for large dependencies

## Next Steps

After successful archive:
1. Validate archive (if not done)
2. Distribute to App Store Connect (see GUIDE_UPLOAD.md)
3. Wait for processing
4. Complete App Store listing

## Important Notes

- **First build** takes longer (10-15 minutes)
- **Subsequent builds** are faster (5-10 minutes)
- **Archive** is required for App Store submission
- **Validation** catches issues before upload
- **Keep archives** for version history




