# 📱 Simplest Way to Test on iPhone

## Step 1: Install Node.js (One-Time, 5 Minutes)

**Just download and install:**
1. Go to: **https://nodejs.org/**
2. Click **"Download Node.js (LTS)"** - the green button
3. Run the installer (just click through)
4. **Restart your terminal**

That's it! Node.js is installed.

---

## Step 2: Run One Command

```bash
cd /Users/akeemojuko/Downloads/hellobrick
./install-and-test.sh
```

**That's it!** The script does everything else.

---

## Step 3: Open on iPhone

The script will show you a URL like:
```
http://192.168.1.100:5173
```

**On your iPhone:**
1. Make sure iPhone is on **same WiFi** as your computer
2. Open **Safari**
3. Type the URL
4. Tap **"Allow"** for camera
5. **Start testing!**

---

## ✅ That's It!

**Total time:** ~5 minutes (one-time Node.js install) + 30 seconds to start

**No Xcode, no native app, no complex setup** - just web testing in Safari!

---

## 🐛 If You Get Stuck

**Node.js not working after install?**
- Restart terminal completely
- Or restart your computer

**Can't access from iPhone?**
- Make sure same WiFi network
- Try the IP address shown by the script
- Check firewall isn't blocking port 5173

**Camera doesn't work?**
- That's normal - Safari on iPhone needs HTTPS for camera
- **Everything else works!** (UI, quests, gamification, etc.)
- Test camera on Mac Safari: `http://localhost:5173`

---

**This is the simplest way! 🚀**

