#!/bin/bash

# Fix common Xcode build errors

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "🔧 Fixing Build Errors..."
echo "========================="
echo ""

# Step 1: Rebuild the web app
echo "1️⃣  Rebuilding web app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed - fix errors above"
    exit 1
fi

if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ dist folder is empty"
    exit 1
fi

echo "✅ Web app built successfully"
echo ""

# Step 2: Sync Capacitor
echo "2️⃣  Syncing with Capacitor..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ Sync failed"
    exit 1
fi

echo "✅ Capacitor synced"
echo ""

# Step 3: Clean Xcode build
echo "3️⃣  Instructions for Xcode:"
echo ""
echo "In Xcode:"
echo "  1. Product → Clean Build Folder (Cmd+Shift+K)"
echo "  2. Close Xcode"
echo "  3. Delete DerivedData:"
echo "     rm -rf ~/Library/Developer/Xcode/DerivedData"
echo "  4. Reopen Xcode:"
echo "     npx cap open ios"
echo "  5. Try building again"
echo ""

echo "========================="
echo "✅ Sync complete!"
echo ""
echo "Now:"
echo "  1. Clean build in Xcode (Cmd+Shift+K)"
echo "  2. Try building again (Cmd+R)"
echo ""




