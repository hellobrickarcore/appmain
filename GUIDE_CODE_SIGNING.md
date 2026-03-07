# Guide: Configure Code Signing in Xcode

## Prerequisites

- ✅ Active Apple Developer Program membership
- ✅ App created in App Store Connect
- ✅ Xcode installed (14+ recommended)
- ✅ Project opened: `ios/App/App.xcworkspace`

## Step-by-Step Instructions

### 1. Open Project in Xcode

```bash
cd /Users/akeemojuko/Downloads/hellobrick
npm run build
npx cap sync ios
npx cap open ios
```

This opens `ios/App/App.xcworkspace` in Xcode.

### 2. Select App Target

1. In Xcode, click on **"App"** in the left sidebar (project navigator)
2. Select **"App"** target (under TARGETS)
3. Click **"Signing & Capabilities"** tab

### 3. Add Apple Developer Account

**If account not listed:**

1. Click **"Add Account..."** button
2. Enter your Apple ID (used for Developer Program)
3. Enter password
4. Click **"Sign In"**
5. Account appears in team dropdown

### 4. Enable Automatic Signing

1. ✅ Check **"Automatically manage signing"**
2. Select your **Team** from dropdown
   - Should show your name or organization
   - If not listed, add account (step 3)

### 5. Verify Bundle Identifier

- Should show: `com.hellobrick.app`
- Must match App Store Connect
- If different, update to match

### 6. Xcode Creates Certificates

Xcode automatically:
- Creates Development certificate
- Creates Distribution certificate (for App Store)
- Creates Provisioning profiles
- Links everything together

**You'll see:**
- ✅ "Signing certificate" created
- ✅ "Provisioning profile" created
- Status: "Ready to use"

### 7. Verify Signing

**For Debug (Development):**
- Configuration: Debug
- Team: Your team
- Signing Certificate: Apple Development
- Provisioning Profile: (Auto-generated)

**For Release (App Store):**
- Configuration: Release
- Team: Your team
- Signing Certificate: Apple Distribution
- Provisioning Profile: (Auto-generated)

### 8. Test Build

1. Select **"Any iOS Device"** or connected device
2. Click **Play** button (▶️) or Cmd + R
3. Build should succeed
4. If errors, check:
   - Team is selected
   - Bundle ID matches App Store Connect
   - Certificates are valid

## Troubleshooting

### "No valid code signing certificates"

**Solution:**
1. Xcode > Preferences > Accounts
2. Select your Apple ID
3. Click "Download Manual Profiles"
4. Or remove and re-add account

### "Bundle identifier is already in use"

**Solution:**
- Bundle ID must be unique
- If you own it: Use it in App Store Connect
- If not: Change Bundle ID in Xcode to match available one

### "Provisioning profile doesn't match"

**Solution:**
1. Uncheck "Automatically manage signing"
2. Check it again
3. Xcode will regenerate profiles

### "Team not found"

**Solution:**
1. Verify Apple Developer account is active
2. Check membership hasn't expired
3. Re-add account in Xcode Preferences

## Manual Signing (Not Recommended)

Only if automatic signing fails:

1. Uncheck "Automatically manage signing"
2. Select Provisioning Profile manually
3. Download from Apple Developer portal
4. More complex, error-prone

## Verify Everything Works

```bash
# Clean build
xcodebuild clean -workspace ios/App/App.xcworkspace -scheme App

# Build for device
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  CODE_SIGNING_REQUIRED=YES
```

## Next Steps

After code signing is configured:
1. Build and archive app (see GUIDE_BUILD_ARCHIVE.md)
2. Validate archive
3. Upload to App Store Connect

## Important Notes

- **Automatic signing** is recommended (easier, less errors)
- **Certificates** expire annually (Xcode auto-renews)
- **Provisioning profiles** auto-update
- **Bundle ID** must match App Store Connect exactly
- **Team** must match Apple Developer account




