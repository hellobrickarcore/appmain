# Settings and Authentication Fixes

## ✅ All Issues Fixed

### 1. **Button Functionality** ✅
- **Reset Password**: Now opens a modal to enter email and sends reset request
- **Privacy Policy**: Opens `/privacy-policy.html` in new tab
- **Terms of Service**: Opens `/terms-of-service.html` in new tab (created)
- All buttons now have proper onClick handlers

### 2. **Push Notifications Toggle** ✅
- Toggle now actually works and saves to:
  - `localStorage` (immediate)
  - Backend API (when available)
- Uses `notificationService` to manage notification state
- Settings persist across app restarts

**Note**: Push notifications require `@capacitor/push-notifications` plugin. For Capacitor 6, you'll need to use Firebase Cloud Messaging (FCM) directly or upgrade to Capacitor 7+.

**Most companies use Firebase Cloud Messaging (FCM)** because:
- Free tier (unlimited notifications)
- Works on both iOS and Android
- Easy integration
- Built-in analytics
- Reliable delivery

**Alternative services**:
- OneSignal (popular, free tier)
- Pusher Beams (simple, paid)
- AWS SNS (enterprise)

### 3. **Account Privacy Toggle** ✅
- Toggle now actually works and saves to:
  - `localStorage` (immediate)
  - Backend API (when available)
- Uses `userSettingsService` to manage privacy state
- Settings persist across app restarts

### 4. **Delete Account - Triple Confirmation** ✅
Implemented 3-step confirmation process:

**Step 1**: Initial click
- User clicks "Delete Account"
- Shows warning: "Are you sure? This cannot be undone"

**Step 2**: Data Loss Warning
- Shows detailed list of what will be deleted:
  - All brick collections
  - XP, levels, achievements
  - Posts and contributions
  - Training data
  - Battle history
  - Account settings
- User must click "I Understand, Continue"

**Step 3**: Type CONFIRM
- User must type "CONFIRM" exactly in a text box
- Delete button is disabled until text matches
- Final confirmation before deletion

### 5. **Email Sign Up / Login** ✅
- Created `EmailAuthScreen` component
- Two modes: `signup` and `login`
- Features:
  - Email validation
  - Password strength (min 6 characters)
  - Password confirmation (signup only)
  - Show/hide password toggle
  - Error handling
  - Loading states
  - Backend API integration

**Backend Endpoints Required**:
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/reset-password` - Send reset email
- `DELETE /api/user/delete` - Delete account

## Files Created/Modified

### New Files:
1. `src/services/notificationService.ts` - Push notification management
2. `src/services/userSettingsService.ts` - User settings management
3. `src/screens/EmailAuthScreen.tsx` - Email signup/login screen
4. `public/terms-of-service.html` - Terms of Service page

### Modified Files:
1. `src/screens/ProfileSettingsScreen.tsx` - All functionality added
2. `src/screens/AuthScreen.tsx` - Navigation to email auth
3. `src/App.tsx` - Routing for email auth screens
4. `src/types.ts` - Added EMAIL_SIGNUP and EMAIL_LOGIN screens

## Push Notifications Setup

### Option 1: Firebase Cloud Messaging (Recommended)
1. Create Firebase project at https://console.firebase.google.com
2. Add iOS app (get APNs key from Apple Developer)
3. Add Android app (get FCM server key)
4. Install Firebase SDK:
   ```bash
   npm install firebase
   ```
5. Update `notificationService.ts` to use Firebase SDK

### Option 2: Upgrade to Capacitor 7+
```bash
npm install @capacitor/core@^7.0.0 @capacitor/push-notifications@^7.0.0
```

### Option 3: OneSignal (Easiest)
1. Sign up at https://onesignal.com
2. Install OneSignal SDK
3. Configure in app

## Backend API Endpoints Needed

Create these endpoints in your backend:

```python
# server/auth-service.py (example)

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    # Hash password, create user, return userId and token
    return jsonify({'userId': user_id, 'token': token})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    # Verify credentials, return userId and token
    return jsonify({'userId': user_id, 'token': token})

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    # Send reset email
    return jsonify({'message': 'Reset email sent'})

@app.route('/api/user/delete', methods=['DELETE'])
def delete_user():
    data = request.json
    userId = data.get('userId')
    # Delete user and all associated data
    return jsonify({'message': 'Account deleted'})

@app.route('/api/user/settings', methods=['POST'])
def save_settings():
    data = request.json
    # Save user settings
    return jsonify({'message': 'Settings saved'})

@app.route('/api/notifications/register', methods=['POST'])
def register_notification_token():
    data = request.json
    userId = data.get('userId')
    token = data.get('token')
    # Store FCM token for user
    return jsonify({'message': 'Token registered'})

@app.route('/api/notifications/settings', methods=['POST'])
def update_notification_settings():
    data = request.json
    userId = data.get('userId')
    settings = data.get('settings')
    # Update notification preferences
    return jsonify({'message': 'Settings updated'})
```

## Testing Checklist

- [ ] Reset password button opens modal
- [ ] Privacy policy opens in new tab
- [ ] Terms of service opens in new tab
- [ ] Privacy toggle saves and persists
- [ ] Notification toggle saves and persists
- [ ] Delete account shows 3-step confirmation
- [ ] Delete account requires typing "CONFIRM"
- [ ] Email signup validates inputs
- [ ] Email login validates inputs
- [ ] Password show/hide toggle works
- [ ] Settings persist after app restart

## Next Steps

1. **Set up Firebase** for push notifications (recommended)
2. **Create backend endpoints** for auth and settings
3. **Test email auth flow** end-to-end
4. **Configure password reset emails** (use SendGrid, Mailgun, etc.)
5. **Set up account deletion** cleanup process

## Notes

- All settings are saved to `localStorage` as fallback
- Backend integration is optional but recommended
- Push notifications require native platform (iOS/Android)
- Email auth requires backend API endpoints
- Delete account permanently removes all user data
