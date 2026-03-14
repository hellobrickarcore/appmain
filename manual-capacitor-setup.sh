#!/bin/bash

# Manual Capacitor setup - step by step with error checking

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "🔧 Manual Capacitor Setup"
echo "========================"
echo ""

# Step 1: Install dependencies
echo "1️⃣  Installing npm dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 2: Verify Capacitor CLI
echo "2️⃣  Verifying Capacitor CLI..."
if [ -f "node_modules/.bin/cap" ]; then
    echo "✅ Capacitor CLI found at: node_modules/.bin/cap"
    ./node_modules/.bin/cap --version
else
    echo "❌ Capacitor CLI not found in node_modules"
    echo "   Trying direct install..."
    npm install @capacitor/cli --save-dev --force
    if [ ! -f "node_modules/.bin/cap" ]; then
        echo "❌ Still not found. Check npm/node installation"
        exit 1
    fi
fi
echo ""

# Step 3: Build app
echo "3️⃣  Building app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ dist folder is empty"
    exit 1
fi
echo "✅ Build complete"
echo ""

# Step 4: Add iOS platform using direct path
echo "4️⃣  Adding iOS platform..."
./node_modules/.bin/cap add ios

if [ $? -ne 0 ]; then
    echo "❌ Failed to add iOS platform"
    echo "   Error details above"
    exit 1
fi
echo "✅ iOS platform added"
echo ""

# Step 5: Sync
echo "5️⃣  Syncing Capacitor..."
./node_modules/.bin/cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ Sync failed"
    exit 1
fi
echo "✅ Sync complete"
echo ""

# Step 6: Open Xcode
echo "6️⃣  Opening Xcode..."
./node_modules/.bin/cap open ios

echo ""
echo "✅ Setup complete! Xcode should be opening..."
echo ""




