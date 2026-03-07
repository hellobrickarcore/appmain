#!/bin/bash

# Diagnostic script to identify Xcode build issues

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "🔍 Diagnosing Build Issues..."
echo "============================="
echo ""

# Log file for diagnostics
LOG_FILE=".cursor/debug.log"
mkdir -p .cursor

# Clear previous logs
> "$LOG_FILE"

# Hypothesis A: dist folder missing or empty
echo "Hypothesis A: Checking dist folder..."
if [ ! -d "dist" ]; then
    echo "  ❌ dist folder MISSING"
    echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"dist folder missing","data":{"hypothesis":"A"},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
else
    FILE_COUNT=$(find dist -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$FILE_COUNT" -eq 0 ]; then
        echo "  ❌ dist folder EMPTY ($FILE_COUNT files)"
        echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"dist folder empty","data":{"hypothesis":"A","fileCount":0},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
    else
        echo "  ✅ dist folder exists with $FILE_COUNT files"
        echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"dist folder OK","data":{"hypothesis":"A","fileCount":'$FILE_COUNT'},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
    fi
fi
echo ""

# Hypothesis B: iOS platform not properly synced
echo "Hypothesis B: Checking iOS platform sync..."
if [ ! -d "ios" ]; then
    echo "  ❌ ios folder MISSING"
    echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"ios folder missing","data":{"hypothesis":"B"},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
else
    if [ ! -f "ios/App/App.xcodeproj/project.pbxproj" ]; then
        echo "  ❌ iOS project file MISSING"
        echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"iOS project.pbxproj missing","data":{"hypothesis":"B"},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
    else
        echo "  ✅ iOS project structure exists"
        echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"iOS project OK","data":{"hypothesis":"B"},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
    fi
fi
echo ""

# Hypothesis C: CocoaPods not installed or outdated
echo "Hypothesis C: Checking CocoaPods..."
if ! command -v pod > /dev/null 2>&1; then
    echo "  ❌ CocoaPods NOT INSTALLED"
    echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"CocoaPods not installed","data":{"hypothesis":"C"},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
else
    POD_VERSION=$(pod --version 2>/dev/null || echo "unknown")
    echo "  ✅ CocoaPods installed (version: $POD_VERSION)"
    echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"CocoaPods OK","data":{"hypothesis":"C","version":"'$POD_VERSION'"},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
    
    # Check if Pods are installed
    if [ ! -d "ios/Pods" ]; then
        echo "  ⚠️  Pods directory missing - need to run pod install"
        echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"Pods directory missing","data":{"hypothesis":"C"},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
    fi
fi
echo ""

# Hypothesis D: Capacitor sync issues
echo "Hypothesis D: Checking Capacitor sync status..."
if [ -f "ios/App/App/capacitor.config.json" ]; then
    echo "  ✅ Capacitor config synced to iOS"
    echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"Capacitor config synced","data":{"hypothesis":"D"},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
else
    echo "  ❌ Capacitor config NOT synced"
    echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"Capacitor config missing","data":{"hypothesis":"D"},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
fi
echo ""

# Hypothesis E: Missing dependencies
echo "Hypothesis E: Checking npm dependencies..."
if [ ! -d "node_modules" ]; then
    echo "  ❌ node_modules MISSING - run npm install"
    echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"node_modules missing","data":{"hypothesis":"E"},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
else
    if [ ! -f "node_modules/.bin/cap" ]; then
        echo "  ❌ Capacitor CLI missing from node_modules"
        echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"Capacitor CLI missing","data":{"hypothesis":"E"},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
    else
        echo "  ✅ Dependencies installed"
        echo '{"timestamp":'$(date +%s000)',"location":"diagnose-build.sh","message":"Dependencies OK","data":{"hypothesis":"E"},"sessionId":"debug-session","runId":"diagnosis"}' >> "$LOG_FILE"
    fi
fi
echo ""

echo "============================="
echo "📋 Summary written to: $LOG_FILE"
echo ""
echo "Next: Check Xcode for the ACTUAL error message"
echo "Common errors:"
echo "  - Signing: Select Team in Signing & Capabilities"
echo "  - Missing files: Run 'npm run build && npx cap sync ios'"
echo "  - CocoaPods: Run 'cd ios/App && pod install'"
echo ""




