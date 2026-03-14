#!/bin/bash

echo "🔍 Checking Xcode Setup Status..."
echo "================================="
echo ""

# Check if Capacitor CLI is installed
if npx cap --version > /dev/null 2>&1; then
    echo "✅ Capacitor CLI installed: $(npx cap --version)"
else
    echo "❌ Capacitor CLI not found"
    echo "   Run: npm install"
    exit 1
fi
echo ""

# Check if dist exists
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo "✅ Build folder exists (dist/)"
else
    echo "❌ Build folder missing or empty"
    echo "   Run: npm run build"
fi
echo ""

# Check if iOS platform exists
if [ -d "ios" ]; then
    echo "✅ iOS platform folder exists"
    if [ -f "ios/App.xcworkspace" ] || [ -f "ios/App/App.xcodeproj" ]; then
        echo "✅ iOS project files found"
    else
        echo "⚠️  iOS folder exists but project files missing"
    fi
else
    echo "❌ iOS platform not added yet"
    echo "   Run: npx cap add ios"
fi
echo ""

echo "================================="
echo "📱 Next Steps in Xcode:"
echo ""
echo "1. Wait for Xcode to finish loading"
echo ""
echo "2. Select 'App' target (left sidebar)"
echo ""
echo "3. Go to 'Signing & Capabilities' tab"
echo ""
echo "4. Enable 'Automatically manage signing'"
echo ""
echo "5. Select your Team (Apple ID)"
echo ""
echo "6. Connect iPhone via USB"
echo ""
echo "7. Select iPhone from device dropdown"
echo ""
echo "8. Click Play button (▶️) to build and run"
echo ""




