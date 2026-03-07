#!/bin/bash
# Prepare app for mobile testing

cd "$(dirname "$0")"

echo "📱 Preparing HelloBrick for Mobile Testing"
echo "=========================================="
echo ""

# Step 1: Get Mac IP
echo "1️⃣  Finding Mac IP address..."
MAC_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$MAC_IP" ]; then
    echo "⚠️  Could not auto-detect Mac IP"
    read -p "Enter your Mac's IP address: " MAC_IP
fi

if [ -z "$MAC_IP" ]; then
    echo "❌ No IP address provided"
    exit 1
fi

echo "✅ Mac IP: $MAC_IP"
echo ""

# Step 2: Update .env file
echo "2️⃣  Updating .env file..."
API_URL="http://${MAC_IP}:3003/api"

if [ -f ".env" ]; then
    if grep -q "VITE_DETECTION_API_URL" ".env"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|VITE_DETECTION_API_URL=.*|VITE_DETECTION_API_URL=${API_URL}|" ".env"
        else
            sed -i "s|VITE_DETECTION_API_URL=.*|VITE_DETECTION_API_URL=${API_URL}|" ".env"
        fi
    else
        echo "VITE_DETECTION_API_URL=${API_URL}" >> ".env"
    fi
else
    echo "VITE_DETECTION_API_URL=${API_URL}" > ".env"
fi

echo "✅ .env updated: VITE_DETECTION_API_URL=${API_URL}"
echo ""

# Step 3: Build the app
echo "3️⃣  Building the app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build complete"
echo ""

# Step 4: Sync Capacitor
echo "4️⃣  Syncing Capacitor..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

echo "✅ Capacitor sync complete"
echo ""

# Step 5: Instructions
echo "✅✅✅ Ready for Mobile Testing! ✅✅✅"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Make sure backend server is running:"
echo "   cd server && python3 yolo-detection-server.py"
echo ""
echo "2. Open Xcode:"
echo "   npx cap open ios"
echo ""
echo "3. In Xcode:"
echo "   - Select your iPhone as the target device"
echo "   - Click Run (▶️) or press Cmd+R"
echo ""
echo "4. On your iPhone:"
echo "   - Trust the developer certificate if prompted"
echo "   - Allow camera permissions"
echo ""
echo "📡 Backend URL: http://${MAC_IP}:3003"
echo ""




