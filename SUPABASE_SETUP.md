# Supabase Setup for Google Authentication

## Overview

This app uses Supabase for Google OAuth authentication. The integration is optional - if Supabase credentials are not configured, the app will fall back to regular authentication.

## Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: HelloBrick (or your choice)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be created (2-3 minutes)

### 2. Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 3. Configure Google OAuth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to enable
3. You'll need to create a Google OAuth app:
   - Go to https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Authorized redirect URIs: 
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     - (Get this from Supabase → Authentication → URL Configuration)
   - Copy **Client ID** and **Client Secret**
4. Back in Supabase, paste:
   - **Client ID** (from Google)
   - **Client Secret** (from Google)
5. Click "Save"

### 4. Add Environment Variables

Add to `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: 
- Never commit `.env.local` to git (already in `.gitignore`)
- Restart dev server after adding these variables

### 5. Configure Redirect URL

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your app's URL to **Redirect URLs**:
   - For development: `http://localhost:5173/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

### 6. Test Google Sign-In

1. Start the dev server: `npm run dev`
2. Click "Continue with Google" button
3. Should redirect to Google sign-in
4. After signing in, redirects back to app

## Files Created

- `src/services/supabaseService.ts` - Supabase client and auth functions
- `src/screens/AuthScreen.tsx` - Updated with Google sign-in button

## How It Works

1. User clicks "Continue with Google"
2. App calls `signInWithGoogle()` from `supabaseService.ts`
3. Supabase redirects to Google OAuth
4. User signs in with Google
5. Google redirects back to Supabase callback URL
6. Supabase redirects to your app's callback URL
7. App receives auth session and proceeds

## Fallback Behavior

If Supabase is not configured:
- Google sign-in button is hidden
- Regular "Create an account" and "Log in" buttons work as before
- No errors are shown to users

## Troubleshooting

**"Supabase not configured" warning:**
- Check `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after adding env vars

**Google sign-in redirects but doesn't work:**
- Check redirect URLs in Supabase dashboard
- Verify Google OAuth credentials are correct
- Check browser console for errors

**OAuth redirect loop:**
- Verify callback URL matches exactly in Supabase settings
- Check that redirect URL is in Google OAuth authorized redirect URIs

## Next Steps

After setup:
1. Test Google sign-in flow
2. Handle OAuth callback in your app (create `/auth/callback` route if needed)
3. Store user session and integrate with your backend
4. Update user profile with Google account info




