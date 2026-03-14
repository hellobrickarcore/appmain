#!/bin/bash
# Complete clean rebuild to fix cached build issues

cd "$(dirname "$0")"

echo "🧹 Cleaning all build artifacts..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf ios/App/Pods
rm -rf ios/App/.build
rm -rf ios/App/DerivedData

echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "🔄 Syncing Capacitor..."
npx cap sync ios

echo "✅ Clean rebuild complete!"
echo ""
echo "Next steps:"
echo "1. Open Xcode: npx cap open ios"
echo "2. In Xcode: Product > Clean Build Folder (Shift+Cmd+K)"
echo "3. Rebuild and run on iPhone"




