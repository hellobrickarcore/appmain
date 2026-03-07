#!/bin/bash

echo "🔍 Checking Backend Server Status..."
echo "===================================="
echo ""

# Check if port 3001 is listening
if lsof -i :3001 2>/dev/null | grep LISTEN > /dev/null; then
    echo "✅ Port 3001 is LISTENING"
    PID=$(lsof -ti :3001 | head -1)
    echo "   Process ID: $PID"
else
    echo "❌ Port 3001 is NOT listening"
    echo "   Backend server is not running"
fi
echo ""

# Check if process is running
if ps aux | grep "yolo-detection-server" | grep -v grep > /dev/null; then
    echo "✅ YOLO detection server process found"
    ps aux | grep "yolo-detection-server" | grep -v grep | awk '{print "   PID:", $2, "-", $11, $12, $13}'
else
    echo "❌ YOLO detection server process NOT found"
fi
echo ""

# Test health endpoint
echo "🏥 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health 2>&1)

if [ $? -eq 0 ] && [ -n "$HEALTH_RESPONSE" ]; then
    echo "✅ Backend is RESPONDING"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Backend is NOT responding"
    echo "   Health check failed"
fi
echo ""

echo "===================================="
if lsof -i :3001 2>/dev/null | grep LISTEN > /dev/null && [ -n "$HEALTH_RESPONSE" ]; then
    echo "✅ BACKEND IS RUNNING AND WORKING!"
else
    echo "❌ BACKEND IS NOT RUNNING"
    echo ""
    echo "To start it:"
    echo "  cd server"
    echo "  python3 yolo-detection-server.py"
    echo ""
    echo "Or use:"
    echo "  bash start-backend.sh"
fi
echo ""




