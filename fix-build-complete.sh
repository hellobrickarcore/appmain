#!/bin/bash

# Complete build fix - addresses all common issues

cd "$(dirname "${BASH_SOURCE[0]}")"

LOG_FILE=".cursor/debug.log"
mkdir -p .cursor
> "$LOG_FILE"

echo "🔧 Complete Build Fix"
echo "===================="
echo ""

# Step 1: Ensure dependencies
echo "1️⃣  Installing dependencies..."
npm install 2>&1 | tail -5
echo '{"timestamp":'$(date +%s000)',"location":"fix-build-complete.sh","message":"npx cap sync iosnpm install completed","data":{"step":1},"sessionId":"debug-session","runId":"fix"}' >> "$LOG_FILE"
echo ""

# Step 2: Build web app
echo "2️⃣  Building web app..."
npm run build 2>&1 | tail -10

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    echo '{"timestamp":'$(date +%s000)',"location":"fix-build-complete.sh","message":"npm build failed","data":{"step":2,"error":"build_failed"},"sessionId":"debug-session","runId":"fix"}' >> "$LOG_FILE"
    exit 1
fi

if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ dist folder is empty!"
    echo '{"timestamp":'$(date +%s000)',"location":"fix-build-complete.sh","message":"dist folder empty","data":{"step":2,"error":"dist_empty"},"sessionId":"debug-session","runId":"fix"}' >> "$LOG_FILE"
    exit 1
fi

FILE_COUNT=$(find dist -type f | wc -l | tr -d ' ')
echo "✅ Build complete ($FILE_COUNT files in dist/)"
echo '{"timestamp":'$(date +%s000)',"location":"fix-build-complete.sh","message":"build successful","data":{"step":2,"fileCount":'$FILE_COUNT'},"sessionId":"debug-session","runId":"fix"}' >> "$LOG_FILE"
echo ""

# Step 3: Sync Capacitor
echo "3️⃣  Syncing Capacitor..."
npx cap sync ios 2>&1 | tail -10

if [ $? -ne 0 ]; then
    echo "❌ Sync failed!"
    echo '{"timestamp":'$(date +%s000)',"location":"fix-build-complete.sh","message":"cap sync failed","data":{"step":3,"error":"sync_failed"},"sessionId":"debug-session","runId":"fix"}' >> "$LOG_FILE"
    exit 1
fi

echo "✅ Capacitor synced"
echo '{"timestamp":'$(date +%s000)',"location":"fix-build-complete.sh","message":"sync successful","data":{"step":3},"sessionId":"debug-session","runId":"fix"}' >> "$LOG_FILE"
echo ""

# Step 4: Install CocoaPods
echo "4️⃣  Installing CocoaPods dependencies..."
cd ios/App
pod install 2>&1 | tail -10
cd ../..

if [ $? -ne 0 ]; then
    echo "⚠️  Pod install had issues (may still work)"
    echo '{"timestamp":'$(date +%s000)',"location":"fix-build-complete.sh","message":"pod install warning","data":{"step":4},"sessionId":"debug-session","runId":"fix"}' >> "$LOG_FILE"
else
    echo "✅ CocoaPods installed"
    echo '{"timestamp":'$(date +%s000)',"location":"fix-build-complete.sh","message":"pod install successful","data":{"step":4},"sessionId":"debug-session","runId":"fix"}' >> "$LOG_FILE"
fi
echo ""

echo "===================="
echo "✅ Fix Complete!"
echo ""
echo "Next steps in Xcode:"
echo "  1. Product → Clean Build Folder (Cmd+Shift+K)"
echo "  2. Select your Team in Signing & Capabilities"
echo "  3. Try building again (Cmd+R)"
echo ""
echo "Diagnostics saved to: $LOG_FILE"
echo ""




