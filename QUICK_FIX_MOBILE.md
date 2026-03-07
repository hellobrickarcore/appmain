# 🔧 Quick Fix for Mobile Access Not Working

## Common Issues & Solutions

### Issue 1: Firewall Blocking Port 5173

**Check:**
1. System Settings → Network → Firewall
2. If enabled, check if Node.js/Vite is blocked

**Fix:**
- Option A: Allow Node.js in firewall settings
- Option B: Temporarily disable firewall to test
- Option C: Add port 5173 exception

---

### Issue 2: Server Not Running

**Check:**
```bash
lsof -i :5173
```

**Fix:**
```bash
npm run dev
```

---

### Issue 3: Wrong IP Address

**Get correct IP:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Or check: System Settings → Network → Wi-Fi → Advanced → TCP/IP

---

### Issue 4: Different WiFi Networks

**Check:**
- Phone and computer must be on **same WiFi network**
- Not on guest network
- Not on different network bands (2.4GHz vs 5GHz on same router is OK)

---

### Issue 5: Vite Not Listening on Network

**Check vite.config.ts:**
```typescript
server: {
  host: '0.0.0.0',  // Must be this, not 'localhost'
  port: 5173,
}
```

**Fix:** Should already be set to `0.0.0.0` (check current config)

---

## Step-by-Step Debug

1. **Test locally first:**
   ```bash
   # Start server
   npm run dev
   
   # Test on computer
   open http://localhost:5173
   ```
   If this doesn't work, the server isn't running properly.

2. **Check firewall:**
   - System Settings → Network → Firewall
   - Temporarily disable to test

3. **Get your IP:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

4. **Test from phone:**
   - Same WiFi network
   - Use IP from step 3
   - Try: `http://YOUR_IP:5173`

5. **Check browser console on phone:**
   - Safari: Settings → Advanced → Web Inspector
   - Chrome: Connect via USB debugging

---

## Alternative: Use ngrok (Easiest)

If network issues persist, use ngrok for instant tunneling:

```bash
# Install ngrok (if not installed)
brew install ngrok

# Start your dev server
npm run dev

# In another terminal, create tunnel
ngrok http 5173
```

This gives you a public URL like: `https://abc123.ngrok.io`

Use that URL on your phone - works from anywhere, no WiFi needed!

---

## Still Not Working?

Run the diagnostic script:
```bash
bash debug-mobile-access.sh
```

This will show exactly what's wrong.




