# 🚀 Start Here - Test on iPhone

## ⚡ One Command to Test on iPhone

```bash
cd /Users/akeemojuko/Downloads/hellobrick
./install-and-test.sh
```

**That's it!** The script will:
1. ✅ Install Node.js (if needed, via Homebrew)
2. ✅ Install project dependencies
3. ✅ Find your computer's IP address
4. ✅ Start the dev server
5. ✅ Show you the URL to open on iPhone

---

## 📦 If Node.js is Not Installed

The script will automatically install Node.js via Homebrew if:
- You have Homebrew installed
- You don't have Node.js yet

**If you don't have Homebrew:**
1. Install Homebrew first:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Then run: `./install-and-test.sh`

**Or install Node.js manually:**
- Go to https://nodejs.org/
- Download and install the LTS version
- Restart terminal
- Run: `./install-and-test.sh`

---

## 📱 Then on Your iPhone:

1. **Make sure iPhone is on the same WiFi** as your computer
2. **Open Safari**
3. **Type the URL** shown by the script (e.g., `http://192.168.1.100:5173`)
4. **Tap "Allow"** when asked for camera permission
5. **Start testing!**

---

## 🎮 What You Can Test:

- ✅ Home screen with BrickBuddy mascot
- ✅ Camera access (tap "Scan" tab)
- ✅ Brick detection (tap "Scan Bricks")
- ✅ Quest system (start and complete quests)
- ✅ XP, levels, badges, streaks
- ✅ All animations and interactions

---

## 🐛 Troubleshooting

### Can't Access from iPhone?

**Check:**
- iPhone and computer on same WiFi?
- Firewall blocking port 5173?
- Try the IP address shown by the script

### Camera Not Working?

**Safari on iPhone requires HTTPS for camera on non-localhost.**

**Solutions:**
1. **Test on Mac Safari first** - Go to `http://localhost:5173` (camera works)
2. **Use Chrome/Firefox on iPhone** - Better camera support than Safari
3. **All other features work** - Even if camera doesn't work, you can test everything else

---

## ✅ That's It!

No Xcode, no native app setup - just run the script and open on iPhone Safari!

**Happy Testing! 🎉**

