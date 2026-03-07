#!/bin/bash

# One-command iPhone testing setup
# Does everything automatically

set -e

cd "$(dirname "$0")"

echo "🚀 HelloBrick iPhone Testing Setup"
echo "=================================="
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed or not in PATH"
    echo ""
    echo "Please install Node.js first:"
    echo ""
    echo "Option 1: Install via Homebrew (recommended)"
    echo "  brew install node"
    echo ""
    echo "Option 2: Download from nodejs.org"
    echo "  https://nodejs.org/"
    echo ""
    echo "Option 3: Use nvm (Node Version Manager)"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  nvm install --lts"
    echo ""
    exit 1
fi

# Step 1: Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (first time only)..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Step 2: Get IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
else
    IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "")
fi

if [ -z "$IP" ]; then
    echo "⚠️  Could not auto-detect IP address"
    echo ""
    echo "Please find your computer's IP address:"
    echo "  macOS: System Settings > Network > WiFi > Details"
    echo "  Or run: ipconfig getifaddr en0"
    echo ""
    read -p "Enter your IP address (or press Enter for localhost): " IP
    IP=${IP:-localhost}
fi

echo ""
echo "📱 Your app will be available at:"
echo ""
echo "   👉 http://$IP:5173"
echo ""
echo "📋 On your iPhone:"
echo "   1. Make sure iPhone is on the SAME WiFi network"
echo "   2. Open Safari"
echo "   3. Go to: http://$IP:5173"
echo "   4. Allow camera permission when prompted"
echo ""
echo "💡 Tip: Bookmark this URL for easy access!"
echo ""
echo "Starting dev server..."
echo "Press Ctrl+C to stop"
echo ""

# Start dev server
npm run dev

