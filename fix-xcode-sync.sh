#!/bin/bash

# Fix Capacitor sync issues for Xcode

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "🔧 Fixing Capacitor Sync for Xcode..."
echo "====================================="
echo ""

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "📦 Building app first..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed! Fix build errors first."
        exit 1
    fi
else
    echo "✅ dist/ folder exists"
fi
echo ""

# Check if Capacitor is initialized
if [ ! -f "capacitor.config.ts" ]; then
    echo "⚠️  Capacitor not initialized. Initializing..."
    npx cap init "HelloBrick" "com.hellobrick.app" --web-dir=dist
fi
echo ""

# Check if iOS platform exists
if [ ! -d "ios" ]; then
    echo "📱 Adding iOS platform..."
    npx cap add ios
    if [ $? -ne 0 ]; then
        echo "❌ Failed to add iOS platform"
        exit 1
    fi
else
    echo "✅ iOS platform exists"
fi
echo ""

# Try sync with verbose output
echo "🔄 Syncing Capacitor (showing full output)..."
echo ""
npx cap sync ios 2>&1

SYNC_RESULT=$?

if [ $SYNC_RESULT -ne 0 ]; then
    echo ""
    echo "❌ Sync failed. Common fixes:"
    echo ""
    echo "1. Make sure dist/ folder exists and has built files:"
    echo "   npm run build"
    echo ""
    echo "2. Check capacitor.config.ts points to correct webDir:"
    echo "   webDir: 'dist'"
    echo ""
    echo "3. Try removing and re-adding iOS platform:"
    echo "   rm -rf ios"
    echo "   npx cap add ios"
    echo "   npx cap sync ios"
    echo ""
    exit 1
else
    echo ""
    echo "✅ Sync successful!"
    echo ""
    echo "Opening in Xcode..."
    npx cap open ios
fi




