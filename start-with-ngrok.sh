#!/bin/bash

# Start with ngrok - easiest way to test on mobile!
# Works from anywhere, no firewall issues, no network config needed

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "🚀 Starting HelloBrick with ngrok..."
echo "===================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok > /dev/null 2>&1; then
    echo "⚠️  ngrok not found. Installing..."
    if command -v brew > /dev/null 2>&1; then
        brew install ngrok
    else
        echo "❌ Please install ngrok:"
        echo "   brew install ngrok"
        echo "   Or download from: https://ngrok.com/download"
        exit 1
    fi
fi

# Kill existing servers
echo "🧹 Cleaning up..."
pkill -f "yolo-detection-server.py" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f ngrok 2>/dev/null || true
sleep 1

# Start backend
echo "📡 Starting backend server..."
cd server
python3 yolo-detection-server.py > /tmp/hellobrick-backend-ngrok.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 2

echo "🎨 Starting frontend server..."
VITE_DETECTION_API=/api npm run dev > /tmp/hellobrick-frontend-ngrok.log 2>&1 &
FRONTEND_PID=$!
sleep 3

# Start ngrok
echo "🌐 Starting ngrok tunnel..."
ngrok http 5173 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
sleep 3

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "⏳ Waiting for ngrok to start..."
    sleep 2
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | head -1 | cut -d'"' -f4)
fi

echo ""
echo "===================================="
echo "✅ Everything is running!"
echo "===================================="
echo ""
echo "📱 Use this URL on your phone (works from anywhere!):"
if [ -n "$NGROK_URL" ]; then
    echo "   $NGROK_URL"
else
    echo "   Check: http://localhost:4040 (ngrok web interface)"
fi
echo ""
echo "💡 Or visit ngrok dashboard:"
echo "   http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID $NGROK_PID 2>/dev/null; exit" INT TERM
wait




