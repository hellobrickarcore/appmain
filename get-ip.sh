#!/bin/bash

# Simple script to get your computer's IP address for mobile testing

echo "🔍 Finding your IP address..."
echo ""

# Try different methods
IP=""

# Method 1: en0 (usually WiFi on Mac)
if [ -z "$IP" ]; then
    IP=$(ifconfig en0 2>/dev/null | grep "inet " | awk '{print $2}' | head -1)
fi

# Method 2: en1 (alternative interface)
if [ -z "$IP" ]; then
    IP=$(ifconfig en1 2>/dev/null | grep "inet " | awk '{print $2}' | head -1)
fi

# Method 3: Any active interface
if [ -z "$IP" ]; then
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
fi

# Method 4: Using network command
if [ -z "$IP" ]; then
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi

if [ -z "$IP" ]; then
    echo "❌ Could not detect IP address automatically"
    echo ""
    echo "Manual steps:"
    echo "1. System Settings → Network → Wi-Fi"
    echo "2. Click 'Advanced' → 'TCP/IP' tab"
    echo "3. Look for 'IPv4 Address'"
    echo ""
    echo "Or run: ifconfig | grep 'inet '"
    exit 1
fi

echo "✅ Your IP address is: $IP"
echo ""
echo "📱 Use this URL on your mobile device:"
echo "   http://$IP:5173"
echo ""
echo "⚠️  Important:"
echo "   - Phone and computer must be on the SAME WiFi network"
echo "   - Make sure servers are running (bash start-local-test.sh)"
echo ""




