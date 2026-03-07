#!/bin/bash

# HelloBrick Mobile Web Testing Script
# Starts dev server accessible from iPhone

echo "🚀 Starting HelloBrick for Mobile Testing..."
echo ""

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "localhost")
else
    # Linux
    IP=$(hostname -I | awk '{print $1}' || echo "localhost")
fi

if [ "$IP" == "localhost" ] || [ -z "$IP" ]; then
    echo "⚠️  Could not detect IP address. Using localhost."
    echo "   Make sure your iPhone is on the same WiFi network."
    IP="localhost"
fi

echo "📱 Your app will be available at:"
echo ""
echo "   http://$IP:5173"
echo ""
echo "📋 Steps to test on iPhone:"
echo "   1. Make sure iPhone is on the SAME WiFi network"
echo "   2. Open Safari on iPhone"
echo "   3. Go to: http://$IP:5173"
echo "   4. Allow camera permissions when prompted"
echo ""
echo "💡 Tip: Bookmark the URL for easy access!"
echo ""
echo "Starting dev server..."
echo ""

# Start Vite dev server
npm run dev

