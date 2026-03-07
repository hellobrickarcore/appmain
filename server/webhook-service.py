#!/usr/bin/env python3
"""
RevenueCat Webhook Service for HelloBrick
Receives subscription lifecycle events from RevenueCat and syncs to Supabase.

Endpoint: POST /api/webhooks/revenuecat

Setup:
  1. pip install flask flask-cors supabase
  2. Set environment variables:
     - REVENUECAT_WEBHOOK_SECRET: Bearer token for webhook auth
     - SUPABASE_URL: Supabase project URL
     - SUPABASE_SERVICE_KEY: Supabase service role key (NOT the anon key)
  3. In RevenueCat dashboard → Settings → Webhooks:
     - URL: https://your-server.com/api/webhooks/revenuecat
     - Authorization: Bearer <your_secret>
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment
WEBHOOK_SECRET = os.getenv('REVENUECAT_WEBHOOK_SECRET', '')
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

# Lazy-init Supabase client
_supabase_client = None

def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            logger.warning('Supabase credentials not configured — webhook will log but not persist')
            return None
        try:
            from supabase import create_client
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        except ImportError:
            logger.error('supabase-py not installed. Run: pip install supabase')
            return None
    return _supabase_client


def verify_webhook_auth():
    """Verify RevenueCat webhook authorization header."""
    if not WEBHOOK_SECRET:
        logger.warning('REVENUECAT_WEBHOOK_SECRET not set — allowing all requests (dev mode)')
        return True

    auth_header = request.headers.get('Authorization', '')
    expected = f'Bearer {WEBHOOK_SECRET}'
    return auth_header == expected


# ─── Event Handlers ─────────────────────────────────────────────

def handle_initial_purchase(event_data: dict):
    """Handle INITIAL_PURCHASE — user just subscribed."""
    return upsert_subscription(event_data, is_active=True)


def handle_renewal(event_data: dict):
    """Handle RENEWAL — subscription renewed."""
    return upsert_subscription(event_data, is_active=True)


def handle_cancellation(event_data: dict):
    """Handle CANCELLATION — user cancelled (still active until period end)."""
    return upsert_subscription(event_data, is_active=True)


def handle_expiration(event_data: dict):
    """Handle EXPIRATION — subscription expired, no longer active."""
    return upsert_subscription(event_data, is_active=False)


def handle_billing_issue(event_data: dict):
    """Handle BILLING_ISSUE — payment failed."""
    return upsert_subscription(event_data, is_active=True)  # Still active during grace period


def upsert_subscription(event_data: dict, is_active: bool):
    """Write subscription state to Supabase."""
    app_user_id = event_data.get('app_user_id', '')
    product_id = event_data.get('product_id', '')
    expiration_at = event_data.get('expiration_at_ms')
    entitlement_ids = event_data.get('entitlement_ids', [])

    is_pro = 'pro' in entitlement_ids and is_active

    expiration_date = None
    if expiration_at:
        try:
            expiration_date = datetime.fromtimestamp(expiration_at / 1000).isoformat()
        except (ValueError, TypeError):
            pass

    record = {
        'user_id': app_user_id,
        'is_pro': is_pro,
        'is_active': is_active,
        'product_id': product_id,
        'expiration_date': expiration_date,
        'revenuecat_user_id': app_user_id,
        'updated_at': datetime.utcnow().isoformat(),
    }

    logger.info(f'Upserting subscription for user {app_user_id}: pro={is_pro}, active={is_active}')

    supabase = get_supabase()
    if supabase:
        try:
            supabase.table('subscriptions').upsert(record, on_conflict='user_id').execute()
            logger.info(f'✅ Subscription synced to Supabase for {app_user_id}')
        except Exception as e:
            logger.error(f'Failed to upsert to Supabase: {e}')
            return False
    else:
        logger.info(f'Supabase not configured — subscription record logged but not persisted: {record}')

    return True


# ─── Route ───────────────────────────────────────────────────────

EVENT_HANDLERS = {
    'INITIAL_PURCHASE': handle_initial_purchase,
    'RENEWAL': handle_renewal,
    'CANCELLATION': handle_cancellation,
    'EXPIRATION': handle_expiration,
    'BILLING_ISSUE': handle_billing_issue,
    'NON_RENEWING_PURCHASE': handle_initial_purchase,
    'SUBSCRIPTION_PAUSED': handle_cancellation,
    'UNCANCELLATION': handle_renewal,
}


@app.route('/api/webhooks/revenuecat', methods=['POST'])
def revenuecat_webhook():
    """Receive RevenueCat webhook events."""
    # Verify authorization
    if not verify_webhook_auth():
        logger.warning('Unauthorized webhook request')
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        payload = request.get_json(force=True)
    except Exception:
        return jsonify({'error': 'Invalid JSON'}), 400

    if not payload:
        return jsonify({'error': 'Empty payload'}), 400

    event = payload.get('event', {})
    event_type = event.get('type', 'UNKNOWN')

    logger.info(f'📩 Received RevenueCat webhook: {event_type}')

    handler = EVENT_HANDLERS.get(event_type)
    if handler:
        success = handler(event)
        if not success:
            return jsonify({'error': 'Failed to process event'}), 500
    else:
        logger.info(f'Unhandled event type: {event_type}')

    return jsonify({'status': 'ok'}), 200


@app.route('/api/webhooks/health', methods=['GET'])
def health():
    """Health check."""
    return jsonify({
        'status': 'healthy',
        'service': 'webhook-service',
        'supabase_configured': bool(SUPABASE_URL and SUPABASE_SERVICE_KEY),
        'webhook_auth_configured': bool(WEBHOOK_SECRET),
    })


if __name__ == '__main__':
    print('🚀 Starting Webhook Service...')
    print('📝 Endpoints:')
    print('   POST /api/webhooks/revenuecat')
    print('   GET  /api/webhooks/health')
    print(f'   Supabase: {"✅ configured" if SUPABASE_URL else "❌ not configured"}')
    print(f'   Webhook auth: {"✅ configured" if WEBHOOK_SECRET else "⚠️ not configured (dev mode)"}')
    app.run(host='0.0.0.0', port=3010, debug=True)
