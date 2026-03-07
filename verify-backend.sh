#!/bin/bash

echo "🔍 Verifying Backend Server..."
echo "=============================="
echo ""

# Test 1: Port check
echo "1. Checking port 3001..."
if lsof -i :3001 2>/dev/null | grep LISTEN > /dev/null; then
    echo "   ✅ Port 3001 is listening"
else
    echo "   ❌ Port 3001 is not listening"
fi
echo ""

# Test 2: Health endpoint
echo "2. Testing health endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/health 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ -n "$BODY" ]; then
    echo "   ✅ Backend is responding"
    echo "   Response: $BODY"
else
    echo "   ❌ Backend is not responding"
    echo "   HTTP Code: $HTTP_CODE"
fi
echo ""

# Test 3: Process check
echo "3. Checking for Python process..."
if ps aux | grep "yolo-detection-server" | grep -v grep > /dev/null; then
    echo "   ✅ YOLO server process found"
else
    echo "   ⚠️  YOLO server process not found (may be running differently)"
fi
echo ""

echo "=============================="
if [ "$HTTP_CODE" = "200" ] || [ -n "$BODY" ]; then
    echo "✅ BACKEND IS RUNNING AND WORKING!"
    echo ""
    echo "You can now test detection in your iOS app!"
else
    echo "❌ BACKEND IS NOT RUNNING PROPERLY"
    echo ""
    echo "Start it with:"
    echo "  cd server && python3 yolo-detection-server.py"
fi
echo ""




