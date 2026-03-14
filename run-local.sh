#!/bin/bash

# Simple script to run HelloBrick locally on your computer
# No mobile setup needed - just test in your browser!

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "🚀 Starting HelloBrick Locally..."
echo "================================="
echo ""

# Kill existing servers
echo "🧹 Cleaning up..."
pkill -f "yolo-detection-server.py" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

# Start backend
echo "📡 Starting backend server..."
cd server
python3 yolo-detection-server.py > /tmp/hellobrick-backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "❌ Backend failed to start"
    echo "   Check: tail -f /tmp/hellobrick-backend.log"
    exit 1
fi

echo "✅ Backend running on port 3001"

# Start frontend
echo "🎨 Starting frontend server..."
npm run dev > /tmp/hellobrick-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

echo "✅ Frontend running on port 5173"
echo ""
echo "================================="
echo "✅ Ready!"
echo "================================="
echo ""
echo "🌐 Open in your browser:"
echo "   http://localhost:5173"
echo ""
echo "💡 The app will open automatically..."
echo ""

# Try to open browser
sleep 1
open http://localhost:5173 2>/dev/null || xdg-open http://localhost:5173 2>/dev/null || echo "Open http://localhost:5173 in your browser"

echo "Press Ctrl+C to stop servers"
echo ""

trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait




