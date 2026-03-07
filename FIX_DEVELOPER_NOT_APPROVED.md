# 🔧 Fix: Developer Not Approved on iPhone

## The Error
"Developer is not approved" or "Untrusted Developer" on iPhone

## Quick Fix (3 Steps)

### Step 1: Trust the Developer Certificate on iPhone

1. **On your iPhone**, go to:
   - Settings → General → VPN & Device Management
   - (Or Settings → General → Device Management on older iOS)

2. **You'll see a section** like "Developer App" or "Enterprise App"

3. **Tap on your Apple ID** (the one you used in Xcode)

4. **Tap "Trust [Your Apple ID]"**

5. **Confirm** by tapping "Trust" again

---

### Step 2: Enable Developer Mode (iOS 16+)

If you're on iOS 16 or later:

1. **On your iPhone**: Settings → Privacy & Security → Developer Mode
2. **Toggle Developer Mode ON**
3. **Restart your iPhone** (required)
4. **Confirm** when prompted after restart

---

### Step 3: Trust the Computer (if needed)

1. **Connect iPhone via USB**
2. **Unlock your iPhone**
3. **If you see "Trust This Computer?"** popup:
   - Tap **"Trust"**
   - Enter your iPhone passcode

---

## After These Steps

1. **In Xcode**, try building again (Cmd+R)
2. The app should install and launch on your iPhone

---

## Still Not Working?

### Option A: Re-sign the App

1. In Xcode → Signing & Capabilities
2. Uncheck "Automatically manage signing"
3. Check it again
4. Select your Team again
5. Try building again

### Option B: Delete and Reinstall

1. On iPhone: Delete the HelloBrick app (if already installed)
2. In Xcode: Clean Build Folder (Cmd+Shift+K)
3. Build and run again (Cmd+R)

---

## Quick Checklist

- [ ] Trusted developer certificate on iPhone (Settings → General → Device Management)
- [ ] Developer Mode enabled (iOS 16+)
- [ ] iPhone trusts the computer
- [ ] Team selected in Xcode Signing & Capabilities
- [ ] iPhone connected via USB
- [ ] iPhone unlocked

---

## Why This Happens

When you build an app for the first time on a device:
- iOS requires you to explicitly trust the developer
- This is a security feature
- You only need to do this once per Apple ID

After trusting, future builds will work automatically!




