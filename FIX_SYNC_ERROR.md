# 🔧 Fix Capacitor Sync Error

## Common Sync Errors & Fixes

### Error 1: "dist folder not found"

**Fix:**
```bash
npm run build
```

Then try sync again:
```bash
npx cap sync ios
```

---

### Error 2: "Capacitor not initialized"

**Fix:**
```bash
npx cap init
```

Or if config exists but is wrong:
```bash
# Check capacitor.config.ts has:
# webDir: 'dist'
```

---

### Error 3: "iOS platform missing"

**Fix:**
```bash
npx cap add ios
npx cap sync ios
```

---

### Error 4: Corrupted iOS folder

**Fix:**
```bash
rm -rf ios
npx cap add ios
npx cap sync ios
```

---

## Complete Reset (if nothing works)

```bash
# 1. Build the app
npm run build

# 2. Remove iOS platform
rm -rf ios

# 3. Re-add iOS platform
npx cap add ios

# 4. Sync
npx cap sync ios

# 5. Open in Xcode
npx cap open ios
```

---

## Check What's Wrong

Run these to see the actual error:

```bash
# Check if build exists
ls -la dist/

# Check Capacitor config
cat capacitor.config.ts

# Try sync with full output
npx cap sync ios
```

**Copy the actual error message** and we can fix it specifically!

---

## Quick Fix Command

Try this all-in-one fix:

```bash
npm run build && rm -rf ios && npx cap add ios && npx cap sync ios && npx cap open ios
```




