#!/bin/bash

# Prepare HelloBrick React app for Xcode iOS testing

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "🚀 Preparing HelloBrick for Xcode..."
echo "===================================="
echo ""

# Step 1: Build the web app
echo "📦 Step 1: Building web app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build complete"
echo ""

# Step 2: Ensure iOS platform exists
echo "📱 Step 2: Checking Capacitor iOS platform..."
if [ ! -d "ios" ]; then
    echo "   Adding iOS platform..."
    npx cap add ios
else
    echo "   iOS platform already exists"
fi

echo ""

# Step 3: Sync Capacitor
echo "🔄 Step 3: Syncing with Capacitor..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ Sync failed!"
    exit 1
fi

echo "✅ Sync complete"
echo ""

# Step 4: Open in Xcode
echo "🎯 Step 4: Opening in Xcode..."
echo ""
echo "===================================="
echo "✅ Ready for Xcode!"
echo "===================================="
echo ""
echo "📱 Next steps in Xcode:"
echo ""
echo "1. Wait for Xcode to open (may take a moment)"
echo ""
echo "2. In Xcode, select the 'App' target (left sidebar)"
echo ""
echo "3. Go to 'Signing & Capabilities' tab"
echo ""
echo "4. Check 'Automatically manage signing'"
echo ""
echo "5. Select your Team (your Apple ID - free account works!)"
echo ""
echo "6. Connect your iPhone via USB"
echo ""
echo "7. Select your iPhone from the device dropdown (top toolbar)"
echo ""
echo "8. Click the Play button (▶️) to build and run"
echo ""
echo "💡 First build takes 5-10 minutes, then it's faster!"
echo ""

# Open Xcode
npx cap open ios




