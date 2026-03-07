#!/usr/bin/env python3
"""
Feed Service for HelloBrick
Handles feed posts with admin approval system
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Database setup
DB_PATH = Path("models/feed_database.db")
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database schema"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Posts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            user_avatar TEXT,
            image TEXT NOT NULL,
            caption TEXT NOT NULL,
            likes INTEGER DEFAULT 0,
            comments INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            approved_at TEXT,
            rejected_at TEXT
        )
    """)
    
    # Comments table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            user_avatar TEXT,
            text TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts(id)
        )
    """)
    
    # Likes table (to track who liked what)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS likes (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(post_id, user_id),
            FOREIGN KEY (post_id) REFERENCES posts(id)
        )
    """)
    
    conn.commit()
    conn.close()
    print("✅ Feed database initialized")

@app.route('/api/feed/posts', methods=['GET'])
def get_posts():
    """Get approved posts only"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                p.*,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
                (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count
            FROM posts p
            WHERE p.status = 'approved'
            ORDER BY p.created_at DESC
            LIMIT 50
        """)
        
        posts = []
        for row in cursor.fetchall():
            # Get comments for this post
            cursor.execute("""
                SELECT * FROM comments
                WHERE post_id = ?
                ORDER BY created_at ASC
            """, (row['id'],))
            
            comments = []
            for comment_row in cursor.fetchall():
                comments.append({
                    'id': comment_row['id'],
                    'userId': comment_row['user_id'],
                    'userName': comment_row['user_name'],
                    'userAvatar': comment_row['user_avatar'],
                    'text': comment_row['text'],
                    'timestamp': int(datetime.fromisoformat(comment_row['created_at']).timestamp() * 1000)
                })
            
            posts.append({
                'id': row['id'],
                'userId': row['user_id'],
                'userName': row['user_name'],
                'userAvatar': row['user_avatar'],
                'image': row['image'],
                'caption': row['caption'],
                'likes': row['like_count'],
                'comments': row['comment_count'],
                'timestamp': int(datetime.fromisoformat(row['created_at']).timestamp() * 1000),
                'liked': False,  # TODO: Check if current user liked
                'status': row['status'],
                'commentList': comments
            })
        
        conn.close()
        return jsonify({'posts': posts}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feed/posts', methods=['POST'])
def create_post():
    """Create a new post (status: pending)"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        post_id = data.get('id') or f"post_{int(datetime.now().timestamp() * 1000)}"
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO posts (id, user_id, user_name, user_avatar, image, caption, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        """, (
            post_id,
            data.get('userId', 'anonymous'),
            data.get('userName', 'Anonymous'),
            data.get('userAvatar', ''),
            data.get('image', ''),
            data.get('caption', '')
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'id': post_id,
            'message': 'Post submitted for approval'
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feed/posts/<post_id>/approve', methods=['POST'])
def approve_post(post_id):
    """Admin endpoint to approve a post"""
    try:
        # TODO: Add admin authentication
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE posts
            SET status = 'approved', approved_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (post_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Post not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Post approved'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feed/posts/<post_id>/reject', methods=['POST'])
def reject_post(post_id):
    """Admin endpoint to reject a post"""
    try:
        # TODO: Add admin authentication
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE posts
            SET status = 'rejected', rejected_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (post_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Post not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Post rejected'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feed/posts/pending', methods=['GET'])
def get_pending_posts():
    """Admin endpoint to get pending posts"""
    try:
        # TODO: Add admin authentication
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM posts
            WHERE status = 'pending'
            ORDER BY created_at DESC
        """)
        
        posts = []
        for row in cursor.fetchall():
            posts.append({
                'id': row['id'],
                'userId': row['user_id'],
                'userName': row['user_name'],
                'userAvatar': row['user_avatar'],
                'image': row['image'],
                'caption': row['caption'],
                'created_at': row['created_at'],
                'status': row['status']
            })
        
        conn.close()
        return jsonify({'posts': posts}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    print("🚀 Starting Feed Service on port 3006...")
    app.run(host='0.0.0.0', port=3006, debug=True)
