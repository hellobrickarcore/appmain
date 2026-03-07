#!/bin/bash

# HelloBrick Complete Mobile Testing Setup
# Starts both backend and frontend, shows mobile access URL

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📱 Starting HelloBrick for Mobile Testing..."
echo "=============================================="
echo ""

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || ipconfig getifaddr en2 2>/dev/null || echo "")
else
    # Linux
    IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "")
fi

if [ -z "$IP" ]; then
    echo "⚠️  Could not detect IP address automatically"
    echo "   You can find it manually: ifconfig | grep 'inet '"
    echo "   Using localhost for now..."
    IP="localhost"
fi

echo "📋 Server Configuration:"
echo "   Frontend: http://$IP:5173"
echo "   Backend:  http://$IP:3001"
echo ""

# Check if servers are already running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Frontend server already running on port 5173"
    FRONTEND_RUNNING=true
else
    FRONTEND_RUNNING=false
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Backend server already running on port 3001"
    BACKEND_RUNNING=true
else
    echo "⚠️  Backend server not running - starting it now..."
    BACKEND_RUNNING=false
fi

echo ""

# Kill existing servers if needed (but only if not already running)
if [ "$FRONTEND_RUNNING" = false ] || [ "$BACKEND_RUNNING" = false ]; then
    echo "🧹 Ensuring clean state..."
    pkill -f "yolo-detection-server.py" 2>/dev/null || true
    sleep 1
fi

# Start backend if not running
if [ "$BACKEND_RUNNING" = false ]; then
    echo "📡 Starting backend detection server..."
    cd server
    python3 yolo-detection-server.py > /tmp/hellobrick-backend-mobile.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    sleep 3
    
    if ps -p $BACKEND_PID > /dev/null; then
        echo "✅ Backend server started (PID: $BACKEND_PID)"
    else
        echo "❌ Backend server failed to start"
        echo "   Check logs: tail -f /tmp/hellobrick-backend-mobile.log"
        exit 1
    fi
else
    BACKEND_PID=""
fi

# Start frontend if not running
if [ "$FRONTEND_RUNNING" = false ]; then
    echo "🎨 Starting frontend server..."
    npm run dev > /tmp/hellobrick-frontend-mobile.log 2>&1 &
    FRONTEND_PID=$!
    sleep 3
    
    if ps -p $FRONTEND_PID > /dev/null 2>/dev/null; then
        echo "✅ Frontend server started (PID: $FRONTEND_PID)"
    else
        echo "⚠️  Frontend server may have failed to start"
        echo "   Check logs: tail -f /tmp/hellobrick-frontend-mobile.log"
    fi
else
    FRONTEND_PID=""
fi

echo ""
echo "=============================================="
echo "✅ HelloBrick is ready for mobile testing!"
echo "=============================================="
echo ""
echo "📱 Mobile Device Access:"
echo ""
echo "   🌐 URL: http://$IP:5173"
echo ""
echo "📋 Steps to test on your mobile device:"
echo ""
echo "   1. Make sure your phone is on the SAME WiFi network"
echo "   2. Open Safari (iOS) or Chrome (Android) on your phone"
echo "   3. Type this URL in the address bar:"
echo "      http://$IP:5173"
echo "   4. Allow camera permissions when prompted"
echo "   5. Start testing the app!"
echo ""
echo "💡 Tips:"
echo "   - Bookmark the URL for easy access"
echo "   - If camera doesn't work, try Chrome/Firefox instead of Safari"
echo "   - Camera requires HTTPS on Safari (localhost works on Mac Safari)"
echo ""
echo "📊 Server Status:"
echo "   Frontend: http://localhost:5173 (or $IP:5173)"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📋 Logs:"
echo "   Frontend: tail -f /tmp/hellobrick-frontend-mobile.log"
echo "   Backend:  tail -f /tmp/hellobrick-backend-mobile.log"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""

# Wait for interrupt
if [ -n "$FRONTEND_PID" ] || [ -n "$BACKEND_PID" ]; then
    trap "echo ''; echo '🛑 Stopping servers...'; [ -n '$FRONTEND_PID' ] && kill $FRONTEND_PID 2>/dev/null; [ -n '$BACKEND_PID' ] && kill $BACKEND_PID 2>/dev/null; exit" INT TERM
    wait
fi




