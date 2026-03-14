#!/bin/bash

# Quick fix for Capacitor sync - handles all common issues

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "🔧 Quick Fix for Capacitor Sync"
echo "==============================="
echo ""

# Step 1: Build
echo "1️⃣  Building app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed - fix build errors first"
    exit 1
fi

# Check dist exists
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ dist folder is empty or missing"
    exit 1
fi

echo "✅ Build complete"
echo ""

# Step 2: Remove iOS if corrupted
if [ -d "ios" ]; then
    echo "2️⃣  Removing existing iOS platform..."
    rm -rf ios
fi

# Step 3: Add iOS platform
echo "3️⃣  Adding iOS platform..."
npx cap add ios

if [ $? -ne 0 ]; then
    echo "❌ Failed to add iOS platform"
    exit 1
fi

echo "✅ iOS platform added"
echo ""

# Step 4: Sync
echo "4️⃣  Syncing..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Sync still failed. Error details above."
    echo ""
    echo "Try manually:"
    echo "  npx cap sync ios"
    exit 1
fi

echo ""
echo "✅ SUCCESS! Opening Xcode..."
echo ""

npx cap open ios




