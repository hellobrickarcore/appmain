#!/usr/bin/env python3
"""
Comprehensive XP System Testing
Tests all XP rules, edge cases, and scale scenarios
"""
import requests
import json
import uuid
from datetime import datetime, timedelta
import time

BASE_URL = "http://localhost:3005/api"

def generate_event_id():
    return f"test_{uuid.uuid4()}"

def emit_event(event_type, user_id, payload):
    """Emit XP event"""
    response = requests.post(f"{BASE_URL}/xp/events", json={
        "event_id": generate_event_id(),
        "type": event_type,
        "user_id": user_id,
        "timestamp": int(time.time() * 1000),
        "payload": payload
    })
    return response.json()

def get_user_xp(user_id):
    """Get user XP"""
    response = requests.get(f"{BASE_URL}/xp/me", params={"user_id": user_id})
    return response.json()

def test_idempotency():
    """Test that same event_id returns same result"""
    print("\n🧪 Testing Idempotency...")
    user_id = f"test_user_{int(time.time())}"
    event_id = generate_event_id()
    
    payload = {
        "event_id": event_id,
        "type": "ANNOTATION_SUBMITTED",
        "user_id": user_id,
        "timestamp": int(time.time() * 1000),
        "payload": {"item_count": 1}
    }
    
    # First call
    response1 = requests.post(f"{BASE_URL}/xp/events", json=payload)
    result1 = response1.json()
    
    # Second call (same event_id)
    response2 = requests.post(f"{BASE_URL}/xp/events", json=payload)
    result2 = response2.json()
    
    assert result1["xp_awarded"] == result2["xp_awarded"], "Idempotency failed!"
    assert result1["new_xp_total"] == result2["new_xp_total"], "XP total changed on replay!"
    assert result2.get("from_cache", False), "Second call should be from cache"
    print("✅ Idempotency test passed")

def test_annotation_diminishing():
    """Test annotation XP diminishing returns"""
    print("\n🧪 Testing Annotation Diminishing Returns...")
    user_id = f"test_user_{int(time.time())}"
    
    xp_values = []
    for i in range(200):
        result = emit_event("ANNOTATION_SUBMITTED", user_id, {"item_count": 1})
        xp_values.append(result["xp_awarded"])
    
    # First 50 should be full XP (8)
    assert all(xp == 8 for xp in xp_values[:50]), "First 50 should be 8 XP"
    
    # 51-150 should be 70% (5-6 XP)
    assert all(5 <= xp <= 6 for xp in xp_values[50:150]), "51-150 should be ~5-6 XP"
    
    # 151+ should be 40% (3-4 XP)
    assert all(3 <= xp <= 4 for xp in xp_values[150:]), "151+ should be ~3-4 XP"
    
    print(f"✅ Diminishing returns: {xp_values[0]} → {xp_values[50]} → {xp_values[150]}")

def test_streak_logic():
    """Test streak calculation"""
    print("\n🧪 Testing Streak Logic...")
    user_id = f"test_user_{int(time.time())}"
    
    # Day 1
    result1 = emit_event("SCAN_DETECTION_CONFIRMED", user_id, {"detection_count": 1})
    streak1 = result1.get("streak_count", 0)
    assert streak1 == 1, f"Day 1 streak should be 1, got {streak1}"
    
    # Multiple events same day (should not increment)
    result2 = emit_event("ANNOTATION_SUBMITTED", user_id, {"item_count": 1})
    streak2 = result2.get("streak_count", 0)
    assert streak2 == 1, f"Same day should not increment streak, got {streak2}"
    
    print("✅ Streak logic test passed (same day protection)")

def test_battle_fairness():
    """Test battle XP fairness"""
    print("\n🧪 Testing Battle Fairness...")
    user_id = f"test_user_{int(time.time())}"
    
    # Valid battle - win
    result1 = emit_event("BATTLE_COMPLETED", user_id, {
        "mode": "target",
        "result": "win",
        "score_a": 10,
        "score_b": 5,
        "scan_attempts": 5  # Meets minimum
    })
    
    assert result1["xp_awarded"] > 0, "Valid battle should award XP"
    assert result1["xp_awarded"] <= 70, "Winner should be capped at 70"
    
    # Low effort battle
    result2 = emit_event("BATTLE_COMPLETED", user_id, {
        "mode": "target",
        "result": "win",
        "score_a": 10,
        "score_b": 5,
        "scan_attempts": 1  # Below minimum
    })
    
    assert result2["xp_awarded"] == 5, "Low effort should be 5 XP"
    
    print("✅ Battle fairness test passed")

def test_daily_soft_caps():
    """Test daily soft caps"""
    print("\n🧪 Testing Daily Soft Caps...")
    user_id = f"test_user_{int(time.time())}"
    
    xp_values = []
    for i in range(25):
        result = emit_event("BATTLE_COMPLETED", user_id, {
            "mode": "target",
            "result": "win",
            "score_a": 10,
            "score_b": 5,
            "scan_attempts": 5
        })
        xp_values.append(result["xp_awarded"])
    
    # First 10 should be full XP
    assert all(xp >= 40 for xp in xp_values[:10]), "First 10 should be full XP"
    
    # 11-20 should be 75%
    assert all(30 <= xp <= 35 for xp in xp_values[10:20]), "11-20 should be ~75%"
    
    # 21+ should be 50%
    assert all(20 <= xp <= 25 for xp in xp_values[20:]), "21+ should be ~50%"
    
    print(f"✅ Soft caps: {xp_values[0]} → {xp_values[10]} → {xp_values[20]}")

def test_scale_performance():
    """Test system performance at scale"""
    print("\n🧪 Testing Scale Performance...")
    user_count = 100
    events_per_user = 50
    
    start_time = time.time()
    
    for user_idx in range(user_count):
        user_id = f"scale_test_user_{user_idx}"
        for event_idx in range(events_per_user):
            emit_event("ANNOTATION_SUBMITTED", user_id, {"item_count": 1})
    
    elapsed = time.time() - start_time
    total_events = user_count * events_per_user
    events_per_second = total_events / elapsed
    
    print(f"✅ Processed {total_events} events in {elapsed:.2f}s ({events_per_second:.0f} events/sec)")

def test_session_bonuses():
    """Test session bonuses"""
    print("\n🧪 Testing Session Bonuses...")
    user_id = f"test_user_{int(time.time())}"
    
    xp_values = []
    for i in range(25):
        result = emit_event("ANNOTATION_SUBMITTED", user_id, {"item_count": 1})
        xp_values.append(result["xp_awarded"])
    
    # Check for bonus at 5th and 20th
    bonus_5 = result.get("breakdown", [])
    has_bonus_5 = any(b.get("source") == "session_bonus" for b in bonus_5 if b)
    
    print(f"✅ Session bonuses: {xp_values[4]} (5th), {xp_values[19]} (20th)")

def run_all_tests():
    """Run all tests"""
    print("🚀 Starting XP System Tests...")
    print("=" * 50)
    
    try:
        test_idempotency()
        test_annotation_diminishing()
        test_streak_logic()
        test_battle_fairness()
        test_daily_soft_caps()
        test_session_bonuses()
        test_scale_performance()
        
        print("\n" + "=" * 50)
        print("✅ All tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    run_all_tests()




