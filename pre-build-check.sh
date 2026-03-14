#!/bin/bash

# Pre-build check and logging

cd "$(dirname "${BASH_SOURCE[0]}")"

LOG_FILE=".cursor/debug.log"
mkdir -p .cursor

echo "🔍 Pre-Build Check..."
echo "===================="
echo ""

# Log start
echo '{"timestamp":'$(date +%s000)',"location":"pre-build-check.sh","message":"Pre-build check started","data":{"sessionId":"debug-session","runId":"build-attempt"},"sessionId":"debug-session","runId":"build-attempt"}' >> "$LOG_FILE"

# Check dist folder
if [ -d "dist" ] && [ -n "$(ls -A dist)" ]; then
    FILE_COUNT=$(find dist -type f | wc -l | tr -d ' ')
    echo "✅ dist folder exists ($FILE_COUNT files)"
    echo '{"timestamp":'$(date +%s000)',"location":"pre-build-check.sh","message":"dist folder OK","data":{"fileCount":'$FILE_COUNT'},"sessionId":"debug-session","runId":"build-attempt"}' >> "$LOG_FILE"
else
    echo "⚠️  dist folder missing or empty - rebuilding..."
    echo '{"timestamp":'$(date +%s000)',"location":"pre-build-check.sh","message":"dist folder missing, rebuilding","data":{},"sessionId":"debug-session","runId":"build-attempt"}' >> "$LOG_FILE"
    npm run build 2>&1 | tail -5
    echo '{"timestamp":'$(date +%s000)',"location":"pre-build-check.sh","message":"build completed","data":{},"sessionId":"debug-session","runId":"build-attempt"}' >> "$LOG_FILE"
fi

# Check iOS folder
if [ -d "ios" ]; then
    echo "✅ iOS platform exists"
    echo '{"timestamp":'$(date +%s000)',"location":"pre-build-check.sh","message":"iOS platform exists","data":{},"sessionId":"debug-session","runId":"build-attempt"}' >> "$LOG_FILE"
else
    echo "❌ iOS platform missing"
    echo '{"timestamp":'$(date +%s000)',"location":"pre-build-check.sh","message":"iOS platform missing","data":{},"sessionId":"debug-session","runId":"build-attempt"}' >> "$LOG_FILE"
fi

# Sync if needed
echo ""
echo "🔄 Syncing Capacitor..."
npx cap sync ios 2>&1 | tail -5
echo '{"timestamp":'$(date +%s000)',"location":"pre-build-check.sh","message":"Capacitor sync completed","data":{},"sessionId":"debug-session","runId":"build-attempt"}' >> "$LOG_FILE"

echo ""
echo "✅ Ready for Xcode build!"
echo ""
echo "Next: Build in Xcode (Cmd+R)"
echo ""




