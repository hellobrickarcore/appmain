#!/bin/bash
# Quick start script for mobile testing

echo "🚀 Starting HelloBrick for Mobile Testing"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Start the dev server
echo "📱 Starting frontend server..."
echo "   Access on mobile: https://192.168.1.217:5173"
echo "   (Make sure phone and Mac are on same Wi-Fi)"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev

