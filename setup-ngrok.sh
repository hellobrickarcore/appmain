#!/bin/bash
# Quick ngrok setup for mobile testing

echo "🚀 Setting up ngrok for mobile testing"
echo "======================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok not found!"
    echo ""
    echo "INSTALL NGROK:"
    echo "--------------"
    echo "Option 1 - Homebrew:"
    echo "  brew install ngrok"
    echo ""
    echo "Option 2 - Direct download:"
    echo "  1. Visit: https://ngrok.com/download"
    echo "  2. Download for Mac"
    echo "  3. Unzip and move to /usr/local/bin/"
    echo "  4. Or add to PATH"
    echo ""
    echo "Then run this script again!"
    exit 1
fi

echo "✅ ngrok found!"
echo ""
echo "Starting ngrok tunnel..."
echo "Frontend server should be running on port 5173"
echo ""
echo "After ngrok starts, you'll see a URL like:"
echo "  Forwarding: https://abc123.ngrok.io -> http://localhost:5173"
echo ""
echo "Use that ngrok URL on your phone!"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo ""

ngrok http 5173

