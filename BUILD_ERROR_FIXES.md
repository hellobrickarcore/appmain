# 🔧 Fix Xcode Build Errors

## Common Build Errors & Fixes

### Error 1: "No such module" or Missing Dependencies

**Fix:**
```bash
cd /Users/akeemojuko/Downloads/hellobrick
npm install
npm run build
npx cap sync ios
```

Then in Xcode:
- Product → Clean Build Folder (Cmd+Shift+K)
- Try building again

---

### Error 2: "dist folder not found"

**Fix:**
```bash
npm run build
npx cap sync ios
```

---

### Error 3: Signing/Certificate Errors

**Fix in Xcode:**
1. Select "App" target (left sidebar)
2. Signing & Capabilities tab
3. Uncheck "Automatically manage signing"
4. Check it again
5. Select your Team
6. Try building again

---

### Error 4: CocoaPods Issues

**Fix:**
```bash
cd ios/App
pod install
cd ../..
npx cap sync ios
```

---

### Error 5: General Build Failures

**Complete Reset:**
```bash
# 1. Rebuild web app
npm run build

# 2. Sync Capacitor
npx cap sync ios

# 3. Clean Xcode
# In Xcode: Product → Clean Build Folder (Cmd+Shift+K)

# 4. Delete DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData

# 5. Reopen Xcode
npx cap open ios

# 6. Try building again
```

---

## Quick Fix Script

Run this:
```bash
bash fix-build-error.sh
```

Then in Xcode:
- Clean Build Folder (Cmd+Shift+K)
- Try building again

---

## What Error Are You Seeing?

**Please share:**
1. The exact error message from Xcode
2. Which step it fails at (compiling, linking, etc.)
3. Any red errors in Xcode

Common error types:
- **Signing errors** → Fix signing in Xcode
- **Module not found** → Run `npm install` and `npx cap sync ios`
- **Build failed** → Clean build folder and try again
- **Missing files** → Run `npm run build` first

---

## Step-by-Step Fix

1. **Check dist folder exists:**
   ```bash
   ls -la dist/
   ```
   If empty or missing: `npm run build`

2. **Sync Capacitor:**
   ```bash
   npx cap sync ios
   ```

3. **In Xcode:**
   - Product → Clean Build Folder
   - Close Xcode
   - Reopen: `npx cap open ios`
   - Try building again

4. **If still fails:**
   - Share the exact error message
   - Check Xcode console for details




