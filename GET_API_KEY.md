# How to Get a Valid Gemini API Key

## Quick Steps

1. **Visit Google AI Studio**
   - Go to: https://aistudio.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key" button
   - Select "Create API key in new project" (or existing project)
   - Copy the generated key (starts with `AIza...`)

3. **Update .env.local**
   ```bash
   VITE_GEMINI_API_KEY=your_new_key_here
   ```

4. **Restart Dev Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

## Verify Key is Working

1. Open browser console (F12)
2. Look for: `🔑 API Key loaded: AIzaSy...`
3. If you see errors, check:
   - Key format (should start with `AIza`)
   - Key length (should be ~39 characters)
   - No extra spaces or quotes

## Common Issues

### "Invalid API Key" Error
- **Cause**: Key was revoked, expired, or doesn't have Gemini API enabled
- **Fix**: Generate a new key at https://aistudio.google.com/app/apikey

### "API Key not found"
- **Cause**: Environment variable not loaded
- **Fix**: 
  - Check `.env.local` file exists
  - Verify it starts with `VITE_GEMINI_API_KEY=`
  - Restart dev server after changes

### "Quota Exceeded"
- **Cause**: Free tier limit reached
- **Fix**: Wait for quota reset or upgrade plan

## Security Reminder

⚠️ **NEVER commit your API key to git!**
- `.env.local` is already in `.gitignore`
- Don't share your key publicly
- Rotate keys if exposed




