#!/bin/bash
# Stop all backend services

cd "$(dirname "$0")"

echo "🛑 Stopping all HelloBrick services..."

# Kill services by PID files
if [ -f "logs/auth-service.pid" ]; then
    kill $(cat logs/auth-service.pid) 2>/dev/null
    rm logs/auth-service.pid
    echo "✅ Auth service stopped"
fi

if [ -f "logs/xp-service.pid" ]; then
    kill $(cat logs/xp-service.pid) 2>/dev/null
    rm logs/xp-service.pid
    echo "✅ XP service stopped"
fi

if [ -f "logs/feed-service.pid" ]; then
    kill $(cat logs/feed-service.pid) 2>/dev/null
    rm logs/feed-service.pid
    echo "✅ Feed service stopped"
fi

if [ -f "logs/detection-server.pid" ]; then
    kill $(cat logs/detection-server.pid) 2>/dev/null
    rm logs/detection-server.pid
    echo "✅ Detection server stopped"
fi

# Also kill by process name (fallback)
pkill -f "auth-service.py" 2>/dev/null
pkill -f "xp-service.py" 2>/dev/null
pkill -f "feed-service.py" 2>/dev/null
pkill -f "yolo-detection-server.py" 2>/dev/null

echo ""
echo "✅ All services stopped"
