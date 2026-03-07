#!/bin/bash

echo "🔍 Checking HelloBrick Server Status"
echo "===================================="
echo ""

# Check backend
echo "📡 Backend Server (port 3001):"
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "  ✅ Running and healthy"
    curl -s http://localhost:3001/api/health | python3 -m json.tool 2>/dev/null || echo "  Response received"
else
    echo "  ❌ Not responding"
    echo "  Check if server is running: ps aux | grep yolo-detection-server"
fi
echo ""

# Check frontend
echo "🎨 Frontend Server (port 5173):"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "  ✅ Running"
    echo "  Visit: http://localhost:5173"
else
    echo "  ❌ Not responding"
    echo "  Check if server is running: ps aux | grep vite"
fi
echo ""

# Show running processes
echo "🔄 Running Processes:"
ps aux | grep -E "(yolo-detection-server|vite)" | grep -v grep | awk '{print "  PID", $2, "-", $11, $12, $13, $14, $15}'
echo ""

