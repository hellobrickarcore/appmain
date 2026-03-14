#!/bin/bash

# Fix missing Capacitor CLI

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "🔧 Installing Capacitor CLI..."
echo "=============================="
echo ""

# Install Capacitor CLI
npm install @capacitor/cli --save-dev

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Capacitor CLI"
    exit 1
fi

echo ""
echo "✅ Capacitor CLI installed!"
echo ""

# Verify it works
echo "🔍 Verifying installation..."
npx cap --version

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Capacitor CLI is working!"
    echo ""
    echo "Now you can run:"
    echo "  npx cap add ios"
    echo "  npx cap sync ios"
    echo "  npx cap open ios"
else
    echo "❌ Capacitor CLI still not working"
    exit 1
fi




