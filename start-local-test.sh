#!/bin/bash

# Simple local testing script - no IP detection needed!
# Just runs on localhost for testing on the same computer

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "🚀 Starting HelloBrick for Local Testing..."
echo "==========================================="
echo ""
echo "📋 This will run on:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""

# Kill existing servers
echo "🧹 Cleaning up..."
pkill -f "yolo-detection-server.py" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

# Start backend
echo "📡 Starting backend server..."
cd server
python3 yolo-detection-server.py > /tmp/hellobrick-backend-local.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend started (PID: $BACKEND_PID)"
else
    echo "❌ Backend failed to start"
    echo "   Check: tail -f /tmp/hellobrick-backend-local.log"
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend server..."
npm run dev > /tmp/hellobrick-frontend-local.log 2>&1 &
FRONTEND_PID=$!
sleep 3

if ps -p $FRONTEND_PID > /dev/null 2>/dev/null; then
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
else
    echo "⚠️  Check if frontend started: tail -f /tmp/hellobrick-frontend-local.log"
fi

echo ""
echo "==========================================="
echo "✅ Ready to test!"
echo "==========================================="
echo ""
echo "🌐 Open in your browser:"
echo "   http://localhost:5173"
echo ""
echo "💡 Tips:"
echo "   - Camera will work if you allow permissions"
echo "   - Test all features: Scan, Quests, Inventory"
echo "   - Check browser console (F12) for any errors"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""

trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait




