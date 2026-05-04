#!/usr/bin/env python3
"""
XP Service for HelloBrick
Server-authoritative, event-driven XP system with immutable ledger
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import uuid
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from enum import Enum
import hashlib

app = Flask(__name__)
CORS(app)

# Database setup
DB_PATH = Path("models/xp_database.db")
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

# XP Rules Configuration (HIERARCHY: AI Training > Multiplayer > Building > Activity)
XP_CONFIG = {
    "training": {
        "approved": 500,  # 10x multiplier effect (compared to building/multiplayer)
        "minimum_minutes": 15
    },
    "battle": {
        "modes": {
            "target": {"win": 50, "loss": 20, "draw": 35},
            "category": {"win": 60, "loss": 25, "draw": 40},
            "mirror": {"win": 55, "loss": 22, "draw": 38}
        },
        "bonuses": {
            "close_match": {"xp": 10, "max_gap_pct": 0.10, "applies_to": "both"},
            "comeback": {"xp": 15},
            "clean_finish": {"xp": 10, "min_seconds_left": 15}
        },
        "caps": {
            "winner_max": 100,
            "loser_max": 50
        },
        "daily_soft_cap": {
            "tiers": [
                {"from": 1, "to": 5, "multiplier": 1.0},
                {"from": 6, "to": 15, "multiplier": 0.5},
                {"from": 16, "to": 999, "multiplier": 0.2}
            ]
        },
        "rematch_decay": {
            "window_minutes": 30,
            "tiers": [1.0, 0.70, 0.40, 0.10]
        },
        "min_activity": {
            "target": {"scan_attempts": 3},
            "category": {"unique_detections": 2},
            "mirror": {"valid_detections": 4}
        },
        "low_effort_xp": 5
    },
    "build": {
        "base": 25,
        "part_bonus": 0.2,
        "complexity_bonus": {
            "simple": 0,
            "medium": 10,
            "complex": 30
        }
    },
    "scan": {
        "per_detection": 5,
        "unique_bonus": 5,
        "session_bonus": {
            "thresholds": [
                {"count": 10, "bonus": 10},
                {"count": 50, "bonus": 50}
            ]
        }
    },
    "streak": {
        "base": [
            {"day": 1, "xp": 10},
            {"day": 2, "xp": 15},
            {"day": 3, "xp": 20},
            {"day": 4, "xp": 25},
            {"day": 5, "xp": 30},
            {"day": 6, "xp": 40},
            {"day": 7, "xp": 100}
        ],
        "milestones": [
            {"day": 30, "xp": 500},
            {"day": 100, "xp": 2000}
        ]
    },
    "level": {
        "xp_per_level": 500,
        "max_level": 1000
    },
    "annotation": {
        "per_item_xp": 8,
        "session_bonuses": [
            {"count": 5, "bonus_xp": 50},
            {"count": 20, "bonus_xp": 150}
        ],
        "diminishing": {
            "daily_counts": [
                {"from": 1, "to": 50, "multiplier": 1.0},
                {"from": 51, "to": 150, "multiplier": 0.7},
                {"from": 151, "to": 9999, "multiplier": 0.4}
            ]
        },
        "quality_multiplier": {
            "verified": 1.0,
            "partial": 0.5,
            "rejected": 0.0
        },
        "verification_bonus": 2
    }
}

class EventType(Enum):
    SCAN_SESSION_STARTED = "SCAN_SESSION_STARTED"
    SCAN_DETECTION_CONFIRMED = "SCAN_DETECTION_CONFIRMED"
    SORT_SESSION_COMPLETED = "SORT_SESSION_COMPLETED"
    BUILD_COMPLETED = "BUILD_COMPLETED"
    CHALLENGE_COMPLETED = "CHALLENGE_COMPLETED"
    ANNOTATION_SUBMITTED = "ANNOTATION_SUBMITTED"
    ANNOTATION_VERIFIED = "ANNOTATION_VERIFIED"
    BATTLE_COMPLETED = "BATTLE_COMPLETED"
    STREAK_QUALIFYING_EVENT = "STREAK_QUALIFYING_EVENT"
    AI_TRAINING_APPROVED = "AI_TRAINING_APPROVED"

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database schema"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            display_name TEXT,
            xp_total INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            streak_count INTEGER DEFAULT 0,
            streak_last_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # XP Ledger (immutable, append-only)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS xp_ledger (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            source TEXT NOT NULL,
            event_id TEXT UNIQUE NOT NULL,
            amount INTEGER NOT NULL,
            meta TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # User Daily Stats
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_daily_stats (
            user_id TEXT NOT NULL,
            date TEXT NOT NULL,
            battle_count INTEGER DEFAULT 0,
            battle_xp_awarded INTEGER DEFAULT 0,
            annotation_count INTEGER DEFAULT 0,
            annotation_xp_awarded INTEGER DEFAULT 0,
            scan_sessions INTEGER DEFAULT 0,
            sort_minutes INTEGER DEFAULT 0,
            streak_xp_awarded INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, date),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Battles
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS battles (
            id TEXT PRIMARY KEY,
            user_a_id TEXT NOT NULL,
            user_b_id TEXT,
            mode TEXT NOT NULL,
            started_at TEXT,
            ended_at TEXT,
            result TEXT,
            score_a INTEGER,
            score_b INTEGER,
            valid BOOLEAN DEFAULT 1,
            meta TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_a_id) REFERENCES users(id),
            FOREIGN KEY (user_b_id) REFERENCES users(id)
        )
    """)
    
    # Annotations
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS annotations (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            image_id TEXT,
            label_payload TEXT,
            submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
            quality_status TEXT DEFAULT 'pending',
            quality_score REAL DEFAULT 0.0,
            reviewed_at TEXT,
            xp_awarded_event_id TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (xp_awarded_event_id) REFERENCES xp_ledger(event_id)
        )
    """)
    
    # Indexes for performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_ledger_user ON xp_ledger(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_ledger_event ON xp_ledger(event_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_ledger_created ON xp_ledger(created_at)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_daily_stats ON user_daily_stats(user_id, date)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_battles_users ON battles(user_a_id, user_b_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_battles_ended ON battles(ended_at)")
    
    conn.commit()
    conn.close()
    print("✅ Database initialized")

def get_or_create_user(user_id: str) -> Dict:
    """Get user or create if doesn't exist"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    
    if not user:
        if user_id == "anonymous":
            return {
                "id": "anonymous",
                "display_name": "Guest Builder",
                "xp_total": 0,
                "level": 1,
                "streak_count": 0,
                "streak_last_date": None,
                "created_at": datetime.now().isoformat()
            }
        
        # Generate a default display name if not provided
        default_name = f"Builder-{user_id[-4:]}" if len(user_id) > 4 else f"Builder-{uuid.uuid4().hex[:4]}"
        cursor.execute("""
            INSERT INTO users (id, display_name, xp_total, level, streak_count, streak_last_date)
            VALUES (?, ?, 0, 1, 0, ?)
        """, (user_id, default_name, date.today().isoformat()))
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
    
    conn.close()
    return dict(user) if user else None

def get_daily_stats(user_id: str, target_date: date) -> Dict:
    """Get or create daily stats for user"""
    conn = get_db()
    cursor = conn.cursor()
    
    date_str = target_date.isoformat()
    cursor.execute("""
        SELECT * FROM user_daily_stats WHERE user_id = ? AND date = ?
    """, (user_id, date_str))
    
    stats = cursor.fetchone()
    
    if not stats:
        cursor.execute("""
            INSERT INTO user_daily_stats 
            (user_id, date, battle_count, battle_xp_awarded, annotation_count, 
             annotation_xp_awarded, scan_sessions, sort_minutes, streak_xp_awarded)
            VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0)
        """, (user_id, date_str))
        conn.commit()
        cursor.execute("""
            SELECT * FROM user_daily_stats WHERE user_id = ? AND date = ?
        """, (user_id, date_str))
        stats = cursor.fetchone()
    
    conn.close()
    return dict(stats) if stats else None

def calculate_level(xp_total: int) -> int:
    """Calculate level from XP total"""
    xp_per_level = XP_CONFIG["level"]["xp_per_level"]
    level = (xp_total // xp_per_level) + 1
    return min(level, XP_CONFIG["level"]["max_level"])

def award_xp(user_id: str, source: str, amount: int, event_id: str, meta: Dict = None) -> Dict:
    """Award XP and update user totals"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check idempotency
    cursor.execute("SELECT * FROM xp_ledger WHERE event_id = ?", (event_id,))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        return {
            "xp_awarded": existing["amount"],
            "new_xp_total": get_or_create_user(user_id)["xp_total"],
            "new_level": get_or_create_user(user_id)["level"],
            "from_cache": True
        }
    
    # Get user
    user = get_or_create_user(user_id)
    new_xp_total = user["xp_total"] + amount
    new_level = calculate_level(new_xp_total)
    
    # Write to ledger
    ledger_id = str(uuid.uuid4())
    meta_json = json.dumps(meta) if meta else None
    
    cursor.execute("""
        INSERT INTO xp_ledger (id, user_id, source, event_id, amount, meta)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (ledger_id, user_id, source, event_id, amount, meta_json))
    
    # Update user
    if user_id != "anonymous":
        cursor.execute("""
            UPDATE users SET xp_total = ?, level = ? WHERE id = ?
        """, (new_xp_total, new_level, user_id))
    
    conn.commit()
    conn.close()
    
    return {
        "xp_awarded": amount,
        "new_xp_total": new_xp_total,
        "new_level": new_level,
        "from_cache": False
    }

def process_streak(user_id: str, event_type: str) -> Optional[Dict]:
    """Process streak logic - returns XP award if streak updated"""
    today = date.today()
    user = get_or_create_user(user_id)
    
    last_date_str = user.get("streak_last_date")
    last_date = datetime.fromisoformat(last_date_str).date() if last_date_str else None
    
    # Check if already counted today
    if last_date == today:
        return None  # Already counted today
    
    # Calculate new streak
    if last_date is None:
        new_streak = 1
    elif last_date == today - timedelta(days=1):
        new_streak = user["streak_count"] + 1
    else:
        new_streak = 1  # Streak broken
    
    # Calculate streak XP
    streak_xp = 0
    
    # Base daily XP (loops every 7 days)
    day_in_cycle = ((new_streak - 1) % 7) + 1
    base_config = XP_CONFIG["streak"]["base"]
    if day_in_cycle <= len(base_config):
        streak_xp = base_config[day_in_cycle - 1]["xp"]
    
    # Milestone bonuses
    for milestone in XP_CONFIG["streak"]["milestones"]:
        if new_streak == milestone["day"]:
            streak_xp += milestone["xp"]
    
    if streak_xp == 0:
        return None
    
    if user_id != "anonymous":
        # Update user streak
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users SET streak_count = ?, streak_last_date = ? WHERE id = ?
        """, (new_streak, today.isoformat(), user_id))
        
        # Update daily stats
        daily_stats = get_daily_stats(user_id, today)
        cursor.execute("""
            UPDATE user_daily_stats SET streak_xp_awarded = ? 
            WHERE user_id = ? AND date = ?
        """, (streak_xp, user_id, today.isoformat()))
        
        conn.commit()
        conn.close()
    
    return {
        "streak_count": new_streak,
        "streak_xp": streak_xp
    }

def process_annotation_xp(user_id: str, event_id: str, payload: Dict) -> Dict:
    """Process annotation XP with diminishing returns"""
    today = date.today()
    daily_stats = get_daily_stats(user_id, today)
    
    annotation_count = daily_stats["annotation_count"] + 1
    
    # Calculate diminishing multiplier
    diminishing_config = XP_CONFIG["annotation"]["diminishing"]["daily_counts"]
    multiplier = 1.0
    for tier in diminishing_config:
        if tier["from"] <= annotation_count <= tier["to"]:
            multiplier = tier["multiplier"]
            break
    
    # Base XP per item
    per_item_xp = XP_CONFIG["annotation"]["per_item_xp"]
    item_count = payload.get("item_count", 1)
    base_xp = int(per_item_xp * item_count * multiplier)
    
    # Session bonuses
    session_bonus = 0
    for bonus_config in XP_CONFIG["annotation"]["session_bonuses"]:
        if annotation_count == bonus_config["count"]:
            session_bonus = bonus_config["bonus_xp"]
            break
    
    total_xp = base_xp + session_bonus
    
    # Award XP
    result = award_xp(user_id, "annotation", total_xp, event_id, {
        "item_count": item_count,
        "annotation_count": annotation_count,
        "multiplier": multiplier,
        "session_bonus": session_bonus
    })
    
    # Update daily stats
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE user_daily_stats 
        SET annotation_count = ?, annotation_xp_awarded = ?
        WHERE user_id = ? AND date = ?
    """, (annotation_count, daily_stats["annotation_xp_awarded"] + total_xp, 
          user_id, today.isoformat()))
    conn.commit()
    conn.close()
    
    return {
        **result,
        "breakdown": [
            {"source": "annotation", "amount": base_xp},
            {"source": "session_bonus", "amount": session_bonus} if session_bonus > 0 else None
        ]
    }

def process_battle_xp(user_id: str, event_id: str, payload: Dict) -> Dict:
    """Process battle XP with fairness logic"""
    today = date.today()
    daily_stats = get_daily_stats(user_id, today)
    battle_count = daily_stats["battle_count"] + 1
    
    mode = payload.get("mode", "target")
    result = payload.get("result", "loss")  # win, loss, draw
    score_a = payload.get("score_a", 0)
    score_b = payload.get("score_b", 0)
    
    # Validate minimum activity
    min_activity = XP_CONFIG["battle"]["min_activity"].get(mode, {})
    activity_met = True
    for key, required in min_activity.items():
        if payload.get(key, 0) < required:
            activity_met = False
            break
    
    if not activity_met:
        low_effort_xp = XP_CONFIG["battle"]["low_effort_xp"]
        return award_xp(user_id, "battle", low_effort_xp, event_id, {
            "mode": mode,
            "result": "low_effort",
            "valid": False
        })
    
    # Base XP from config
    base_xp = XP_CONFIG["battle"]["modes"][mode].get(result, 0)
    
    # Calculate bonuses
    bonus_xp = 0
    bonus_type = None
    
    # Close match bonus
    if score_a > 0 and score_b > 0:
        gap_pct = abs(score_a - score_b) / max(score_a, score_b)
        if gap_pct <= XP_CONFIG["battle"]["bonuses"]["close_match"]["max_gap_pct"]:
            bonus_xp = XP_CONFIG["battle"]["bonuses"]["close_match"]["xp"]
            bonus_type = "close_match"
    
    # Apply daily soft cap
    soft_cap_config = XP_CONFIG["battle"]["daily_soft_cap"]["tiers"]
    multiplier = 1.0
    for tier in soft_cap_config:
        if tier["from"] <= battle_count <= tier["to"]:
            multiplier = tier["multiplier"]
            break
    
    total_xp = int((base_xp + bonus_xp) * multiplier)
    
    # Apply hard caps
    if result == "win":
        total_xp = min(total_xp, XP_CONFIG["battle"]["caps"]["winner_max"])
    elif result == "loss":
        total_xp = min(total_xp, XP_CONFIG["battle"]["caps"]["loser_max"])
    
    # Award XP
    result_data = award_xp(user_id, "battle", total_xp, event_id, {
        "mode": mode,
        "result": result,
        "base_xp": base_xp,
        "bonus_xp": bonus_xp,
        "bonus_type": bonus_type,
        "multiplier": multiplier,
        "battle_count": battle_count,
        "valid": True
    })
    
    # Update daily stats
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE user_daily_stats 
        SET battle_count = ?, battle_xp_awarded = ?
        WHERE user_id = ? AND date = ?
    """, (battle_count, daily_stats["battle_xp_awarded"] + total_xp,
          user_id, today.isoformat()))
    conn.commit()
    conn.close()
    
    return {
        **result_data,
        "breakdown": [
            {"source": "battle", "amount": base_xp},
            {"source": "bonus", "amount": bonus_xp} if bonus_xp > 0 else None,
            {"source": "multiplier", "amount": -int((base_xp + bonus_xp) * (1 - multiplier))} if multiplier < 1.0 else None
        ],
        "caps": {"battle_multiplier": multiplier}
    }

@app.route('/api/xp/events', methods=['POST'])
def handle_event():
    """Main event endpoint - idempotent, server-authoritative"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        event_id = data.get('event_id')
        event_type = data.get('type')
        user_id = data.get('user_id')
        payload = data.get('payload', {})
        
        if not event_id or not event_type or not user_id:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Ensure user exists
        user = get_or_create_user(user_id)
        
        # Process event based on type
        breakdown = []
        total_xp = 0
        
        if event_type == EventType.ANNOTATION_SUBMITTED.value:
            result = process_annotation_xp(user_id, event_id, payload)
            total_xp = result["xp_awarded"]
            breakdown = result.get("breakdown", [])
        
        elif event_type == EventType.BATTLE_COMPLETED.value:
            result = process_battle_xp(user_id, event_id, payload)
            total_xp = result["xp_awarded"]
            breakdown = result.get("breakdown", [])
        
        elif event_type == EventType.SCAN_DETECTION_CONFIRMED.value:
            # Simple scan XP
            per_detection = XP_CONFIG["scan"]["per_detection"]
            detection_count = payload.get("detection_count", 1)
            unique_count = payload.get("unique_count", 0)
            
            base_xp = per_detection * detection_count
            unique_bonus = XP_CONFIG["scan"]["unique_bonus"] * unique_count
            total_xp = base_xp + unique_bonus
            
            result = award_xp(user_id, "scan", total_xp, event_id, payload)
            breakdown = [
                {"source": "scan", "amount": base_xp},
                {"source": "unique_bonus", "amount": unique_bonus} if unique_bonus > 0 else None
            ]
        
        elif event_type == EventType.AI_TRAINING_APPROVED.value:
            # High-reward training XP
            total_xp = XP_CONFIG["training"]["approved"]
            result = award_xp(user_id, "training", total_xp, event_id, payload)
            breakdown = [{"source": "ai_training", "amount": total_xp}]
        
        else:
            # Generic event - award base XP
            base_xp = payload.get("xp", 10)
            result = award_xp(user_id, event_type.lower(), base_xp, event_id, payload)
            total_xp = result["xp_awarded"]
            breakdown = [{"source": event_type.lower(), "amount": total_xp}]
        
        # Process streak (for qualifying events)
        qualifying_events = [
            EventType.SCAN_DETECTION_CONFIRMED.value,
            EventType.SORT_SESSION_COMPLETED.value,
            EventType.BUILD_COMPLETED.value,
            EventType.CHALLENGE_COMPLETED.value,
            EventType.ANNOTATION_SUBMITTED.value,
            EventType.BATTLE_COMPLETED.value,
            EventType.AI_TRAINING_APPROVED.value
        ]
        
        streak_result = None
        if event_type in qualifying_events:
            streak_result = process_streak(user_id, event_type)
            if streak_result:
                streak_event_id = f"{event_id}_streak"
                streak_xp = streak_result["streak_xp"]
                streak_award = award_xp(user_id, "streak", streak_xp, streak_event_id, {
                    "streak_count": streak_result["streak_count"]
                })
                total_xp += streak_xp
                breakdown.append({"source": "streak", "amount": streak_xp})
        
        # Get updated user
        user = get_or_create_user(user_id)
        
        return jsonify({
            'success': True,
            'xp_awarded': total_xp,
            'breakdown': [b for b in breakdown if b is not None],
            'new_xp_total': user["xp_total"],
            'new_level': user["level"],
            'streak_count': user["streak_count"],
            'caps': result.get("caps", {}) if 'result' in locals() else {}
        }), 200
        
    except Exception as e:
        print(f"❌ Error processing event: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/xp/me', methods=['GET'])
def get_user_xp():
    """Get user XP summary"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        user = get_or_create_user(user_id)
        
        return jsonify({
            'xp_total': user["xp_total"],
            'level': user["level"],
            'streak_count': user["streak_count"],
            'streak_last_date': user.get("streak_last_date")
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/xp/daily-stats', methods=['GET'])
def get_daily_stats_endpoint():
    """Get user daily stats"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        today = date.today()
        stats = get_daily_stats(user_id, today)
        
        return jsonify(dict(stats)), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/xp/ledger', methods=['GET'])
def get_ledger():
    """Get XP ledger entries for user"""
    try:
        user_id = request.args.get('user_id')
        limit = int(request.args.get('limit', 50))
        
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM xp_ledger 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        """, (user_id, limit))
        
        entries = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify({'entries': entries}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/xp/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get real-time leaderboard"""
    try:
        limit = int(request.args.get('limit', 10))
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id as user_id, xp_total, level, streak_count
            FROM users
            ORDER BY xp_total DESC
            LIMIT ?
        """, (limit,))
        
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        # Add ranks
        for i, row in enumerate(results):
            row['rank'] = i + 1
            # Mock display names for privacy if literal IDs are used
            if row['user_id'].startswith('user_'):
                row['name'] = f"Builder #{row['user_id'][-4:]}"
            else:
                row['name'] = row['user_id'][:8]
                
        return jsonify({
            'success': True,
            'leaderboard': results,
            'updated_at': datetime.now().isoformat(),
            'period': 'all_time'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/xp/battles', methods=['GET'])
def get_battles():
    """Get user's battle history"""
    try:
        user_id = request.args.get('userId', 'anonymous')
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Real query from battles table
        cursor.execute("""
            SELECT b.*, 
                   ua.display_name as name_a, 
                   ub.display_name as name_b
            FROM battles b
            LEFT JOIN users ua ON b.user_a_id = ua.id
            LEFT JOIN users ub ON b.user_b_id = ub.id
            WHERE b.user_a_id = ? OR b.user_b_id = ?
            ORDER BY b.created_at DESC
            LIMIT 20
        """, (user_id, user_id))
        
        rows = cursor.fetchall()
        conn.close()
        
        battles = []
        for row in rows:
            is_user_a = row['user_a_id'] == user_id
            opponent_id = row['user_b_id'] if is_user_a else row['user_a_id']
            opponent_name = row['name_b'] if is_user_a else row['name_a']
            
            # Determine result from row['result'] or scores
            result = row['result']
            if not result:
                if row['score_a'] > row['score_b']:
                    result = 'win' if is_user_a else 'loss'
                elif row['score_b'] > row['score_a']:
                    result = 'win' if not is_user_a else 'loss'
                else:
                    result = 'draw'

            # Meta XP or default
            meta = json.loads(row['meta']) if row['meta'] else {}
            xp = meta.get('xp_awarded', 25 if result == 'win' else 10)

            battles.append({
                'id': row['id'],
                'opponent': opponent_name or opponent_id[:8] or 'Unknown',
                'result': result,
                'xp': xp,
                'timestamp': row['created_at']
            })
        
        return jsonify({
            'success': True,
            'battles': battles
        }), 200
        
    except Exception as e:
        print(f"Error fetching battles: {e}")
        return jsonify({'error': str(e), 'battles': []}), 200

@app.route('/api/xp/search', methods=['GET'])
def search_user():
    """Search for a user by ID or Arena ID (display name)"""
    try:
        query = request.args.get('query', '').strip()
        if not query:
            return jsonify({'success': False, 'error': 'Query required'}), 400
            
        conn = get_db()
        cursor = conn.cursor()
        
        # Search by exact ID or case-insensitive display name
        cursor.execute("""
            SELECT id, display_name, level, xp_total
            FROM users 
            WHERE id = ? OR UPPER(display_name) = ?
            LIMIT 1
        """, (query, query.upper()))
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'display_name': user['display_name'],
                    'level': user['level']
                }
            }), 200
        else:
            return jsonify({'success': False, 'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting XP Service...")
    init_db()
    print(f"📁 Database: {DB_PATH.absolute()}")
    print("✅ XP Service ready")
    app.run(host='0.0.0.0', port=3005, debug=True)




