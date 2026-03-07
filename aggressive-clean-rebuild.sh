#!/bin/bash
echo "🧹 Aggressively cleaning project to fix caching issues..."

# 1. Clean Vite/Capacitor build
echo "📦 Rebuilding web assets..."
rm -rf dist
npm run build

# 2. Sync to iOS
echo "🔄 Syncing to iOS..."
npx cap sync ios

# 3. Clean Xcode Derived Data (This is the cache that breaks things!)
echo "🗑️ Cleaning Xcode DerivedData cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 4. Clean iOS build folders
echo "🗑️ Cleaning iOS project build folders..."
cd ios/App
rm -rf build
rm -rf Pods/Local\ Podspecs
rm -rf Podfile.lock
pod install
cd ../..

echo "✅ Clean rebuild complete!"
echo "➡️ Please go back to Xcode and press Run (Product -> Run)."
