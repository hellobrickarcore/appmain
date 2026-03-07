#!/bin/bash

# HelloBrick Local Development Startup Script
# Checks for available ports and starts both servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting HelloBrick locally..."
echo "================================"
echo ""
echo "📌 Port Configuration:"
echo "   Frontend: 5173 (LOCKED - will fail if in use)"
echo "   Backend:  3001"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  Port $port is already in use"
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}


# Kill existing servers first
echo ""
echo "🧹 Cleaning up existing servers..."
pkill -f "yolo-detection-server.py" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Check backend port (3001) - after cleanup
BACKEND_PORT=3001
if ! check_port $BACKEND_PORT; then
    echo "❌ Port $BACKEND_PORT is already in use by another process. Please free it up."
    echo "   Find the process: lsof -i :$BACKEND_PORT"
    exit 1
fi

# Check frontend port (5173) - LOCKED, no alternatives, after cleanup
FRONTEND_PORT=5173
if ! check_port $FRONTEND_PORT; then
    echo "❌ Port $FRONTEND_PORT is already in use by another process. Please free it up."
    echo "   Find the process: lsof -i :$FRONTEND_PORT"
    exit 1
fi

# Start backend server
echo ""
echo "📡 Starting detection server on port $BACKEND_PORT..."
cd server
python3 yolo-detection-server.py > /tmp/hellobrick-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        echo "✅ Backend server is responding"
    else
        echo "⚠️  Backend server started but not responding yet"
    fi
else
    echo "❌ Backend server failed to start"
    echo "Check logs: tail -f /tmp/hellobrick-backend.log"
    exit 1
fi

# Start frontend server
echo ""
echo "🎨 Starting frontend server on port $FRONTEND_PORT..."
npm run dev > /tmp/hellobrick-frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 3

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend server failed to start"
    echo "Check logs: tail -f /tmp/hellobrick-frontend.log"
    exit 1
fi

echo ""
echo "================================"
echo "✅ HelloBrick is running!"
echo ""
echo "📡 Backend:  http://localhost:$BACKEND_PORT"
echo "🎨 Frontend: http://localhost:$FRONTEND_PORT"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f /tmp/hellobrick-backend.log"
echo "   Frontend: tail -f /tmp/hellobrick-frontend.log"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait

