# Authentication Service

Complete authentication and user management backend for HelloBrick.

## Features

- ✅ User signup with email/password
- ✅ User login with authentication
- ✅ Password reset via email
- ✅ Account deletion
- ✅ User settings management
- ✅ Push notification token registration
- ✅ Notification preferences

## Setup

### 1. Install Dependencies

```bash
pip install flask flask-cors
```

### 2. Configure Email (Optional)

For password reset emails, set environment variables:

```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=your-email@gmail.com
export SMTP_PASSWORD=your-app-password
export FROM_EMAIL=noreply@hellobrick.app
```

**Note**: If email is not configured, reset tokens will be printed to console for testing.

### 3. Start the Service

```bash
python3 auth-service.py
```

Or use the startup script:

```bash
./start-auth-service.sh
```

The service runs on `http://localhost:3005`

## API Endpoints

### Authentication

#### `POST /api/auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "userId": "uuid",
  "token": "auth-token",
  "email": "user@example.com",
  "message": "Account created successfully"
}
```

#### `POST /api/auth/login`
Authenticate user and get token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "userId": "uuid",
  "token": "auth-token",
  "email": "user@example.com",
  "message": "Login successful"
}
```

#### `POST /api/auth/reset-password`
Send password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

#### `POST /api/auth/verify-reset-token`
Verify reset token is valid.

**Request:**
```json
{
  "token": "reset-token"
}
```

**Response:**
```json
{
  "valid": true,
  "userId": "uuid"
}
```

#### `POST /api/auth/update-password`
Update password using reset token.

**Request:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password updated successfully"
}
```

### User Management

#### `DELETE /api/user/delete`
Delete user account and all data.

**Request:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "message": "Account deleted successfully"
}
```

#### `GET /api/user/settings?userId=uuid`
Get user settings.

**Response:**
```json
{
  "settings": {
    "isPrivate": false,
    "notificationsEnabled": true
  }
}
```

#### `POST /api/user/settings`
Update user settings.

**Request:**
```json
{
  "userId": "uuid",
  "settings": {
    "isPrivate": true,
    "notificationsEnabled": false
  }
}
```

**Response:**
```json
{
  "message": "Settings saved successfully"
}
```

### Notifications

#### `POST /api/notifications/register`
Register FCM token for push notifications.

**Request:**
```json
{
  "userId": "uuid",
  "token": "fcm-token",
  "platform": "ios"
}
```

**Response:**
```json
{
  "message": "Token registered successfully"
}
```

#### `GET /api/notifications/settings?userId=uuid`
Get notification preferences.

**Response:**
```json
{
  "settings": {
    "enabled": true,
    "questReminders": true,
    "battleInvites": true,
    "feedUpdates": true,
    "trainingReminders": true
  }
}
```

#### `POST /api/notifications/settings`
Update notification preferences.

**Request:**
```json
{
  "userId": "uuid",
  "settings": {
    "enabled": true,
    "questReminders": false,
    "battleInvites": true,
    "feedUpdates": true,
    "trainingReminders": false
  }
}
```

**Response:**
```json
{
  "message": "Notification settings updated"
}
```

## Database Schema

### `users`
- `id` (TEXT PRIMARY KEY)
- `email` (TEXT UNIQUE)
- `password_hash` (TEXT)
- `created_at` (TIMESTAMP)
- `last_login` (TIMESTAMP)
- `is_active` (BOOLEAN)
- `settings` (TEXT JSON)

### `password_reset_tokens`
- `id` (TEXT PRIMARY KEY)
- `user_id` (TEXT)
- `token` (TEXT UNIQUE)
- `expires_at` (TIMESTAMP)
- `used` (BOOLEAN)

### `notification_tokens`
- `id` (TEXT PRIMARY KEY)
- `user_id` (TEXT)
- `token` (TEXT)
- `platform` (TEXT)
- `created_at` (TIMESTAMP)

### `notification_settings`
- `user_id` (TEXT PRIMARY KEY)
- `enabled` (BOOLEAN)
- `quest_reminders` (BOOLEAN)
- `battle_invites` (BOOLEAN)
- `feed_updates` (BOOLEAN)
- `training_reminders` (BOOLEAN)
- `updated_at` (TIMESTAMP)

## Security Notes

⚠️ **Important**: This is a basic implementation. For production:

1. **Use bcrypt or argon2** for password hashing (not SHA-256)
2. **Use JWT tokens** instead of simple random tokens
3. **Add rate limiting** to prevent brute force attacks
4. **Add email verification** before allowing login
5. **Use HTTPS** for all requests
6. **Add CSRF protection**
7. **Sanitize all inputs**
8. **Add logging and monitoring**

## Testing

Test the service with curl:

```bash
# Signup
curl -X POST http://localhost:3005/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Reset password
curl -X POST http://localhost:3005/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Integration with Other Services

The auth service is separate from other services. To integrate:

1. **XP Service**: When user is deleted, also delete from XP database
2. **Collection Service**: When user is deleted, also delete collections
3. **Feed Service**: When user is deleted, also delete posts

You can extend the `delete_user` function to call other services or databases.
