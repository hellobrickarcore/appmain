#!/bin/bash

# Complete setup script - Installs Node.js if needed, then starts testing

set -e

cd "$(dirname "$0")"

echo "🚀 HelloBrick Complete Setup"
echo "==========================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo ""
    echo "Installing Node.js..."
    echo ""
    
    # Check for Homebrew
    if command -v brew &> /dev/null; then
        echo "📦 Found Homebrew - Installing Node.js via Homebrew..."
        brew install node
        echo "✅ Node.js installed"
    else
        echo "⚠️  Homebrew not found"
        echo ""
        echo "Please install Node.js manually:"
        echo ""
        echo "Option 1: Install Homebrew first, then Node.js"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo "  brew install node"
        echo ""
        echo "Option 2: Download from nodejs.org"
        echo "  Open: https://nodejs.org/"
        echo "  Download and install the LTS version"
        echo ""
        echo "After installing, restart terminal and run this script again."
        exit 1
    fi
else
    echo "✅ Node.js is installed: $(node --version)"
fi

# Verify npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found (should come with Node.js)"
    echo "Please reinstall Node.js"
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"
echo ""

# Get IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
else
    IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "")
fi

if [ -z "$IP" ]; then
    echo "⚠️  Could not auto-detect IP address"
    echo ""
    read -p "Enter your computer's IP address (or press Enter for localhost): " IP
    IP=${IP:-localhost}
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing project dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "=================================="
echo "📱 Ready to Test on iPhone!"
echo "=================================="
echo ""
echo "Your app will be available at:"
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

