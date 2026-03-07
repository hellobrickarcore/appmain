# RevenueCat Setup Guide for HelloBrick

## Overview

RevenueCat handles subscription management for iOS and Android. This guide walks you through setting it up.

## Why RevenueCat vs Superwall?

**RevenueCat** = Subscription backend (handles payments, receipts, webhooks)
**Superwall** = Paywall UI templates (A/B testing, beautiful templates)

You can use both together, but RevenueCat alone is sufficient for most apps.

## Step 1: Create RevenueCat Account

1. Go to https://www.revenuecat.com
2. Sign up for a free account
3. Create a new project called "HelloBrick"

**Cost**: Free up to $10k/month revenue, then 1% of revenue

---

## Step 2: Set Up App Store Connect Products

**Prerequisites**: You need your Apple Developer account approved first.

### 2a. Create Subscription Group

1. Go to https://appstoreconnect.apple.com
2. Navigate to your app → **Features** → **In-App Purchases**
3. Click **+** → **Create Subscription Group**
4. Name it: "HelloBrick Pro"
5. Click **Create**

### 2b. Create Subscription Products

Create two subscriptions in your group:

#### Annual Subscription
- **Reference Name**: HelloBrick Pro Annual
- **Product ID**: `com.hellobrick.pro.annual`
- **Subscription Duration**: 1 Year
- **Price**: $29.99/year (or your chosen price)
- **Free Trial**: 14 days
- **Localizations**: Add description and display name

#### Monthly Subscription (Optional)
- **Reference Name**: HelloBrick Pro Monthly
- **Product ID**: `com.hellobrick.pro.monthly`
- **Subscription Duration**: 1 Month
- **Price**: $4.99/month (or your chosen price)
- **Free Trial**: 14 days
- **Localizations**: Add description and display name

### 2c. Submit for Review

- Submit your subscription products for review (can take 24-48 hours)
- You can test with sandbox accounts while waiting

---

## Step 3: Configure RevenueCat Dashboard

### 3a. Add iOS App

1. In RevenueCat dashboard, go to **Projects** → **HelloBrick**
2. Click **Add App**
3. Select **iOS**
4. Enter:
   - **App Name**: HelloBrick
   - **Bundle ID**: `com.hellobrick.app` (must match your Xcode project)
   - **App Store Connect API Key**: (optional, for automatic sync)

### 3b. Get Your API Key

1. In RevenueCat dashboard, go to **Projects** → **HelloBrick** → **Settings**
2. Find **API Keys** section
3. Copy your **Public SDK Key** (starts with `appl_`)

### 3c. Create Entitlement

1. Go to **Entitlements** tab
2. Click **+ New Entitlement**
3. Name it: `pro`
4. This is what your app checks to see if user has active subscription

### 3d. Create Offering

1. Go to **Offerings** tab
2. Click **+ New Offering**
3. Name it: `default`
4. Set as **Current Offering** (check the box)
5. Add your subscription products:
   - Click **+ Add Package**
   - Select your annual subscription
   - Package identifier: `$rc_annual` (or custom name)
   - Repeat for monthly if you have it

---

## Step 4: Add API Key to Your App

1. Open `src/services/subscriptionService.ts`
2. Find the `REVENUECAT_API_KEY` constant
3. Replace `YOUR_IOS_API_KEY_HERE` with your actual API key from Step 3b

```typescript
const REVENUECAT_API_KEY = {
  ios: 'appl_YOUR_ACTUAL_KEY_HERE', // Replace this!
};
```

---

## Step 5: Sync Capacitor Native Code

After installing the RevenueCat plugin, sync it to iOS:

```bash
npm run build
npx cap sync ios
```

This adds the RevenueCat native SDK to your iOS project.

---

## Step 6: Test in Xcode

### 6a. Create Sandbox Test Account

1. In App Store Connect, go to **Users and Access** → **Sandbox** → **Testers**
2. Click **+** to create a test account
3. Use a test email (doesn't need to be real)

### 6b. Test Purchase Flow

1. Open your app in Xcode: `npm run mobile:ios`
2. Run on simulator or device
3. Navigate to subscription screen
4. Tap "Try for $0.00"
5. Sign in with sandbox test account when prompted
6. Complete purchase (it's free in sandbox)
7. Verify subscription status updates

### 6c. Test Restore Purchases

1. Delete and reinstall app (or use different device)
2. Tap "Restore Purchase"
3. Verify subscription is restored

---

## Step 7: Verify Integration

### Check Subscription Status

The app automatically checks subscription status on launch. You can verify:

1. Open app
2. Check console logs for RevenueCat messages
3. Navigate to a Pro feature (like Head-to-Head)
4. Should show Pro status correctly

### Test Scenarios

- ✅ New user → No subscription → Shows paywall
- ✅ Purchase → Subscription active → Pro features unlocked
- ✅ Restore → Subscription restored → Pro features unlocked
- ✅ Expired subscription → Pro features locked → Shows paywall

---

## Troubleshooting

### "RevenueCat API key not configured"

**Solution**: Add your API key to `src/services/subscriptionService.ts`

### "No subscription packages available"

**Solution**: 
1. Check that products are created in App Store Connect
2. Verify products are added to RevenueCat offering
3. Make sure offering is set as "Current Offering"

### "Purchase failed" errors

**Solution**:
- Make sure you're testing with sandbox account
- Verify products are approved in App Store Connect
- Check RevenueCat dashboard for error logs

### Products not showing

**Solution**:
- Wait 24-48 hours after creating products in App Store Connect
- Verify products are in the same subscription group
- Check that offering is configured correctly in RevenueCat

---

## Next Steps After Setup

1. **Set up webhooks** (optional but recommended)
   - Go to RevenueCat → Settings → Webhooks
   - Add your backend URL to receive subscription events
   - Useful for server-side verification

2. **Add analytics** (optional)
   - RevenueCat provides basic analytics
   - Can integrate with your analytics platform

3. **Test thoroughly** before App Store submission
   - Test all purchase flows
   - Test restore purchases
   - Test subscription expiration
   - Test on real device (not just simulator)

---

## Production Checklist

Before submitting to App Store:

- [ ] API key added to code
- [ ] Products created and approved in App Store Connect
- [ ] RevenueCat offering configured
- [ ] Tested purchase flow with sandbox account
- [ ] Tested restore purchases
- [ ] Tested subscription expiration handling
- [ ] Webhooks configured (if using server-side verification)
- [ ] Privacy policy includes subscription terms

---

## Support

- RevenueCat Docs: https://docs.revenuecat.com
- RevenueCat Support: support@revenuecat.com
- Capacitor Plugin: https://github.com/RevenueCat/purchases-capacitor

---

## Summary

**What RevenueCat Does:**
- ✅ Handles StoreKit integration
- ✅ Manages subscription state
- ✅ Validates receipts
- ✅ Provides webhooks
- ✅ Cross-platform (iOS + Android)

**What You Still Need:**
- ❌ Paywall UI (you already have this!)
- ❌ A/B testing (can add Superwall later if needed)
- ❌ Advanced analytics (RevenueCat has basic analytics)

**Cost**: Free until $10k/month revenue, then 1% of revenue.

---

**Status**: Ready to configure once Apple Developer account is approved! 🚀




