#!/bin/bash

# Alternative: Test without npm (if you have Python or another server)

cd "$(dirname "$0")"

echo "🌐 HelloBrick - Alternative Testing"
echo "==================================="
echo ""

# Check if we can build first
if [ ! -d "dist" ]; then
    echo "⚠️  App needs to be built first"
    echo ""
    echo "You need Node.js to build the app."
    echo "Please install Node.js first (see INSTALL_NODE.md)"
    echo ""
    exit 1
fi

# Get IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
else
    IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
fi

echo "📱 Your app is available at:"
echo ""
echo "   http://$IP:8000"
echo ""
echo "Starting simple HTTP server..."
echo "Press Ctrl+C to stop"
echo ""

# Try Python 3 first
if command -v python3 &> /dev/null; then
    cd dist
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    cd dist
    python -m SimpleHTTPServer 8000
else
    echo "❌ No HTTP server found"
    echo ""
    echo "Please install Node.js to use the dev server, or:"
    echo "  - Install Python 3"
    echo "  - Or use any other HTTP server"
    exit 1
fi

