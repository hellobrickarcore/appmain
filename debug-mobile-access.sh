#!/bin/bash

echo "🔍 Debugging Mobile Access Issues"
echo "=================================="
echo ""

# Check if frontend is running
echo "1. Checking if frontend server is running..."
if lsof -i :5173 | grep LISTEN > /dev/null 2>&1; then
    echo "   ✅ Frontend is running on port 5173"
    PID=$(lsof -ti :5173 | head -1)
    echo "   PID: $PID"
else
    echo "   ❌ Frontend is NOT running on port 5173"
    echo "   Start it with: npm run dev"
fi
echo ""

# Check if backend is running
echo "2. Checking if backend server is running..."
if lsof -i :3001 | grep LISTEN > /dev/null 2>&1; then
    echo "   ✅ Backend is running on port 3001"
    PID=$(lsof -ti :3001 | head -1)
    echo "   PID: $PID"
else
    echo "   ⚠️  Backend is NOT running (frontend can still load without it)"
fi
echo ""

# Test localhost access
echo "3. Testing localhost access..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend accessible on localhost:5173"
else
    echo "   ❌ Frontend NOT accessible on localhost:5173"
    echo "   Server may not be running correctly"
fi
echo ""

# Get IP addresses
echo "4. Your network IP addresses:"
ifconfig | grep "inet " | grep -v 127.0.0.1 | while read line; do
    IP=$(echo $line | awk '{print $2}')
    INTERFACE=$(echo $line | awk '{print $NF}' | tr -d ':')
    echo "   - $IP (interface: $INTERFACE)"
done
echo ""

# Check firewall
echo "5. Checking firewall status..."
if command -v /usr/libexec/ApplicationFirewall/socketfilterfw > /dev/null 2>&1; then
    FIREWALL_STATUS=$(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null | grep -i "enabled" || echo "unknown")
    echo "   Firewall state: $FIREWALL_STATUS"
    if echo "$FIREWALL_STATUS" | grep -i "enabled" > /dev/null; then
        echo "   ⚠️  Firewall is enabled - may block port 5173"
        echo "   Solution: System Settings → Network → Firewall → Options → Allow incoming connections for Node"
    fi
else
    echo "   Could not check firewall status"
fi
echo ""

# Check vite config
echo "6. Checking Vite configuration..."
if grep -q "host: '0.0.0.0'" vite.config.ts 2>/dev/null; then
    echo "   ✅ Vite configured to listen on all interfaces (0.0.0.0)"
else
    echo "   ⚠️  Vite may not be configured to accept external connections"
fi
echo ""

# Network connectivity test
echo "7. Testing network connectivity..."
YOUR_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -n "$YOUR_IP" ]; then
    echo "   Your IP: $YOUR_IP"
    echo "   Try: http://$YOUR_IP:5173"
    if ping -c 1 $YOUR_IP > /dev/null 2>&1; then
        echo "   ✅ IP is reachable"
    fi
else
    echo "   ⚠️  Could not determine your IP address"
fi
echo ""

echo "=================================="
echo "🔧 Troubleshooting Steps:"
echo ""
echo "1. Make sure frontend is running:"
echo "   npm run dev"
echo ""
echo "2. Verify it works on your computer:"
echo "   Open: http://localhost:5173"
echo ""
echo "3. Check firewall:"
echo "   System Settings → Network → Firewall"
echo "   Allow Node.js or disable firewall temporarily"
echo ""
echo "4. Verify phone and computer are on same WiFi:"
echo "   - Same network name (SSID)"
echo "   - Not on guest network"
echo ""
echo "5. Try different browser on phone:"
echo "   - Chrome"
echo "   - Firefox"
echo "   - Safari"
echo ""




