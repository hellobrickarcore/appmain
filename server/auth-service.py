#!/usr/bin/env python3
"""
Authentication and User Management Service for HelloBrick
Handles user signup, login, password reset, account deletion, and settings
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import uuid
import hashlib
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Optional
import os

app = Flask(__name__)
CORS(app)

# Database setup
DB_PATH = Path("models/auth_database.db")
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

# Email configuration (set via environment variables)
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
FROM_EMAIL = os.getenv('FROM_EMAIL', 'noreply@hellobrick.app')

def init_db():
    """Initialize the authentication database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_active BOOLEAN DEFAULT 1,
            settings TEXT DEFAULT '{}'
        )
    ''')
    
    # Password reset tokens table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # Notification tokens table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notification_tokens (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token TEXT NOT NULL,
            platform TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, platform)
        )
    ''')
    
    # Notification settings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notification_settings (
            user_id TEXT PRIMARY KEY,
            enabled BOOLEAN DEFAULT 1,
            quest_reminders BOOLEAN DEFAULT 1,
            battle_invites BOOLEAN DEFAULT 1,
            feed_updates BOOLEAN DEFAULT 1,
            training_reminders BOOLEAN DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Auth database initialized")

def hash_password(password: str) -> str:
    """Hash a password using SHA-256 (in production, use bcrypt or argon2)"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(password) == password_hash

def generate_token() -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)

def send_reset_email(email: str, token: str) -> bool:
    """Send password reset email"""
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"⚠️ SMTP not configured. Reset token for {email}: {token}")
        return False
    
    try:
        reset_url = f"https://hellobrick.app/reset-password?token={token}"
        
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = email
        msg['Subject'] = "HelloBrick - Password Reset"
        
        body = f"""
        Hello,
        
        You requested to reset your password for HelloBrick.
        
        Click the link below to reset your password:
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        The HelloBrick Team
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Create a new user account"""
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or '@' not in email:
            return jsonify({'error': 'Invalid email address'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user
        user_id = str(uuid.uuid4())
        password_hash = hash_password(password)
        
        cursor.execute('''
            INSERT INTO users (id, email, password_hash)
            VALUES (?, ?, ?)
        ''', (user_id, email, password_hash))
        
        # Create default notification settings
        cursor.execute('''
            INSERT INTO notification_settings (user_id, enabled)
            VALUES (?, 1)
        ''', (user_id,))
        
        conn.commit()
        conn.close()
        
        # Generate token (in production, use JWT)
        token = generate_token()
        
        return jsonify({
            'userId': user_id,
            'token': token,
            'email': email,
            'message': 'Account created successfully'
        }), 201
        
    except Exception as e:
        print(f"❌ Signup error: {e}")
        return jsonify({'error': 'Failed to create account'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user and return token"""
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Find user
        cursor.execute('''
            SELECT id, email, password_hash, is_active
            FROM users
            WHERE email = ?
        ''', (email,))
        
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({'error': 'Invalid email or password'}), 401
        
        user_id, user_email, password_hash, is_active = user
        
        if not is_active:
            conn.close()
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Verify password
        if not verify_password(password, password_hash):
            conn.close()
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Update last login
        cursor.execute('''
            UPDATE users
            SET last_login = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (user_id,))
        
        conn.commit()
        conn.close()
        
        # Generate token (in production, use JWT)
        token = generate_token()
        
        return jsonify({
            'userId': user_id,
            'token': token,
            'email': user_email,
            'message': 'Login successful'
        }), 200
        
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({'error': 'Failed to login'}), 500

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Send password reset email"""
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        
        if not email or '@' not in email:
            return jsonify({'error': 'Invalid email address'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Find user
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if not user:
            # Don't reveal if email exists (security best practice)
            conn.close()
            return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200
        
        user_id = user[0]
        
        # Generate reset token
        token = generate_token()
        expires_at = datetime.now() + timedelta(hours=1)
        
        # Store token
        cursor.execute('''
            INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (str(uuid.uuid4()), user_id, token, expires_at))
        
        conn.commit()
        conn.close()
        
        # Send email
        send_reset_email(email, token)
        
        return jsonify({
            'message': 'If the email exists, a reset link has been sent'
        }), 200
        
    except Exception as e:
        print(f"❌ Reset password error: {e}")
        return jsonify({'error': 'Failed to send reset email'}), 500

@app.route('/api/auth/verify-reset-token', methods=['POST'])
def verify_reset_token():
    """Verify a password reset token"""
    try:
        data = request.json
        token = data.get('token', '')
        
        if not token:
            return jsonify({'error': 'Token required'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT user_id, expires_at, used
            FROM password_reset_tokens
            WHERE token = ?
        ''', (token,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return jsonify({'valid': False, 'error': 'Invalid token'}), 400
        
        user_id, expires_at, used = result
        
        if used:
            return jsonify({'valid': False, 'error': 'Token already used'}), 400
        
        if datetime.fromisoformat(expires_at) < datetime.now():
            return jsonify({'valid': False, 'error': 'Token expired'}), 400
        
        return jsonify({'valid': True, 'userId': user_id}), 200
        
    except Exception as e:
        print(f"❌ Verify token error: {e}")
        return jsonify({'error': 'Failed to verify token'}), 500

@app.route('/api/auth/update-password', methods=['POST'])
def update_password():
    """Update password using reset token"""
    try:
        data = request.json
        token = data.get('token', '')
        new_password = data.get('password', '')
        
        if not token or not new_password:
            return jsonify({'error': 'Token and password required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Verify token
        cursor.execute('''
            SELECT user_id, expires_at, used
            FROM password_reset_tokens
            WHERE token = ?
        ''', (token,))
        
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            return jsonify({'error': 'Invalid token'}), 400
        
        user_id, expires_at, used = result
        
        if used:
            conn.close()
            return jsonify({'error': 'Token already used'}), 400
        
        if datetime.fromisoformat(expires_at) < datetime.now():
            conn.close()
            return jsonify({'error': 'Token expired'}), 400
        
        # Update password
        password_hash = hash_password(new_password)
        cursor.execute('''
            UPDATE users
            SET password_hash = ?
            WHERE id = ?
        ''', (password_hash, user_id))
        
        # Mark token as used
        cursor.execute('''
            UPDATE password_reset_tokens
            SET used = 1
            WHERE token = ?
        ''', (token,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Password updated successfully'}), 200
        
    except Exception as e:
        print(f"❌ Update password error: {e}")
        return jsonify({'error': 'Failed to update password'}), 500

@app.route('/api/user/delete', methods=['DELETE'])
def delete_user():
    """Delete user account and all associated data"""
    try:
        data = request.json
        user_id = data.get('userId', '')
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Verify user exists
        cursor.execute('SELECT id FROM users WHERE id = ?', (user_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Delete all user data
        # Note: In production, you might want to soft-delete or archive data
        
        # Delete notification tokens
        cursor.execute('DELETE FROM notification_tokens WHERE user_id = ?', (user_id,))
        
        # Delete notification settings
        cursor.execute('DELETE FROM notification_settings WHERE user_id = ?', (user_id,))
        
        # Delete password reset tokens
        cursor.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', (user_id,))
        
        # Delete user
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        
        conn.commit()
        conn.close()
        
        # TODO: Also delete from XP database, collection database, etc.
        # This would require connecting to other databases
        
        return jsonify({'message': 'Account deleted successfully'}), 200
        
    except Exception as e:
        print(f"❌ Delete user error: {e}")
        return jsonify({'error': 'Failed to delete account'}), 500

@app.route('/api/user/settings', methods=['GET', 'POST'])
def user_settings():
    """Get or update user settings"""
    try:
        user_id = request.args.get('userId') or request.json.get('userId')
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        if request.method == 'GET':
            # Get settings
            cursor.execute('SELECT settings FROM users WHERE id = ?', (user_id,))
            result = cursor.fetchone()
            
            if not result:
                conn.close()
                return jsonify({'error': 'User not found'}), 404
            
            settings = json.loads(result[0] or '{}')
            conn.close()
            
            return jsonify({'settings': settings}), 200
        
        else:  # POST
            # Update settings
            data = request.json
            settings = data.get('settings', {})
            
            cursor.execute('''
                UPDATE users
                SET settings = ?
                WHERE id = ?
            ''', (json.dumps(settings), user_id))
            
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Settings saved successfully'}), 200
        
    except Exception as e:
        print(f"❌ Settings error: {e}")
        return jsonify({'error': 'Failed to process settings'}), 500

@app.route('/api/notifications/register', methods=['POST'])
def register_notification_token():
    """Register FCM token for push notifications"""
    try:
        data = request.json
        user_id = data.get('userId', '')
        token = data.get('token', '')
        platform = data.get('platform', 'unknown')
        
        if not user_id or not token:
            return jsonify({'error': 'User ID and token required'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Verify user exists
        cursor.execute('SELECT id FROM users WHERE id = ?', (user_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Insert or update token
        cursor.execute('''
            INSERT INTO notification_tokens (id, user_id, token, platform)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, platform) DO UPDATE SET
                token = excluded.token,
                created_at = CURRENT_TIMESTAMP
        ''', (str(uuid.uuid4()), user_id, token, platform))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Token registered successfully'}), 200
        
    except Exception as e:
        print(f"❌ Register token error: {e}")
        return jsonify({'error': 'Failed to register token'}), 500

@app.route('/api/notifications/settings', methods=['GET', 'POST'])
def notification_settings():
    """Get or update notification settings"""
    try:
        user_id = request.args.get('userId') or request.json.get('userId')
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        if request.method == 'GET':
            # Get settings
            cursor.execute('''
                SELECT enabled, quest_reminders, battle_invites, feed_updates, training_reminders
                FROM notification_settings
                WHERE user_id = ?
            ''', (user_id,))
            
            result = cursor.fetchone()
            
            if not result:
                # Create default settings
                cursor.execute('''
                    INSERT INTO notification_settings (user_id, enabled)
                    VALUES (?, 1)
                ''', (user_id,))
                conn.commit()
                
                settings = {
                    'enabled': True,
                    'questReminders': True,
                    'battleInvites': True,
                    'feedUpdates': True,
                    'trainingReminders': True
                }
            else:
                settings = {
                    'enabled': bool(result[0]),
                    'questReminders': bool(result[1]),
                    'battleInvites': bool(result[2]),
                    'feedUpdates': bool(result[3]),
                    'trainingReminders': bool(result[4])
                }
            
            conn.close()
            return jsonify({'settings': settings}), 200
        
        else:  # POST
            # Update settings
            data = request.json
            settings = data.get('settings', {})
            
            cursor.execute('''
                INSERT INTO notification_settings (
                    user_id, enabled, quest_reminders, battle_invites,
                    feed_updates, training_reminders, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id) DO UPDATE SET
                    enabled = excluded.enabled,
                    quest_reminders = excluded.quest_reminders,
                    battle_invites = excluded.battle_invites,
                    feed_updates = excluded.feed_updates,
                    training_reminders = excluded.training_reminders,
                    updated_at = CURRENT_TIMESTAMP
            ''', (
                user_id,
                settings.get('enabled', True),
                settings.get('questReminders', True),
                settings.get('battleInvites', True),
                settings.get('feedUpdates', True),
                settings.get('trainingReminders', True)
            ))
            
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Notification settings updated'}), 200
        
    except Exception as e:
        print(f"❌ Notification settings error: {e}")
        return jsonify({'error': 'Failed to process notification settings'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'auth-service'}), 200

if __name__ == '__main__':
    print("🚀 Starting Auth Service...")
    init_db()
    print("📊 Auth service running on http://localhost:3007")
    print("📝 Endpoints:")
    print("   POST /api/auth/signup")
    print("   POST /api/auth/login")
    print("   POST /api/auth/reset-password")
    print("   POST /api/auth/verify-reset-token")
    print("   POST /api/auth/update-password")
    print("   DELETE /api/user/delete")
    print("   GET/POST /api/user/settings")
    print("   POST /api/notifications/register")
    print("   GET/POST /api/notifications/settings")
    app.run(host='0.0.0.0', port=3007, debug=True)
