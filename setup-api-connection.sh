#!/bin/bash

# Setup script to configure API connection for iOS native app
# This finds your Mac's IP and creates/updates .env file

cd "$(dirname "$0")"

echo "🔧 Setting up API connection for HelloBrick iOS app"
echo "=================================================="
echo ""

# Find Mac IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    MAC_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
else
    MAC_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "")
fi

if [ -z "$MAC_IP" ]; then
    echo "⚠️  Could not auto-detect Mac IP address"
    echo ""
    echo "Please find your Mac's IP address:"
    echo "  macOS: System Settings > Network > WiFi > Details"
    echo "  Or run: ifconfig | grep 'inet ' | grep -v 127.0.0.1"
    echo ""
    read -p "Enter your Mac's IP address: " MAC_IP
    if [ -z "$MAC_IP" ]; then
        echo "❌ No IP address provided. Exiting."
        exit 1
    fi
fi

echo "✅ Found Mac IP: $MAC_IP"
echo ""

# Create or update .env file
ENV_FILE=".env"
API_URL="http://${MAC_IP}:3003/api"

if [ -f "$ENV_FILE" ]; then
    # Update existing .env file
    if grep -q "VITE_DETECTION_API_URL" "$ENV_FILE"; then
        # Update existing line
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|VITE_DETECTION_API_URL=.*|VITE_DETECTION_API_URL=${API_URL}|" "$ENV_FILE"
        else
            sed -i "s|VITE_DETECTION_API_URL=.*|VITE_DETECTION_API_URL=${API_URL}|" "$ENV_FILE"
        fi
        echo "✅ Updated existing .env file"
    else
        # Append new line
        echo "VITE_DETECTION_API_URL=${API_URL}" >> "$ENV_FILE"
        echo "✅ Added to existing .env file"
    fi
else
    # Create new .env file
    echo "VITE_DETECTION_API_URL=${API_URL}" > "$ENV_FILE"
    echo "✅ Created new .env file"
fi

echo ""
echo "📝 Configuration:"
echo "   API URL: $API_URL"
echo ""
echo "📋 Next steps:"
echo "   1. Make sure backend server is running:"
echo "      cd server && python3 yolo-detection-server.py"
echo ""
echo "   2. Rebuild the app:"
echo "      npm run build"
echo ""
echo "   3. Sync Capacitor:"
echo "      npx cap sync ios"
echo ""
echo "   4. Rebuild in Xcode and test on iPhone"
echo ""
echo "✅ Setup complete!"

