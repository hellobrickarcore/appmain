#!/bin/bash
# Script to load a new trained model into the detection server

cd "$(dirname "$0")"

echo "📦 Loading Trained Model"
echo "========================"
echo ""

# Check if model file is provided
if [ -z "$1" ]; then
    echo "Usage: ./load-trained-model.sh <path-to-model.pt>"
    echo ""
    echo "Or place the model file in one of these locations:"
    echo "  - models/yolo11_lego.pt (preferred)"
    echo "  - models/trained-model.pt"
    echo ""
    exit 1
fi

MODEL_FILE="$1"
TARGET_PATH="models/yolo11_lego.pt"

# Check if file exists
if [ ! -f "$MODEL_FILE" ]; then
    echo "❌ Model file not found: $MODEL_FILE"
    exit 1
fi

# Copy to models directory
echo "📋 Copying model to: $TARGET_PATH"
cp "$MODEL_FILE" "$TARGET_PATH"

# Verify
if [ -f "$TARGET_PATH" ]; then
    echo "✅ Model loaded successfully!"
    echo "   Location: $TARGET_PATH"
    echo "   Size: $(du -h "$TARGET_PATH" | cut -f1)"
    echo ""
    echo "🔄 To use this model:"
    echo "   1. Restart the detection server: python3 yolo-detection-server.py"
    echo "   2. Or use the reload endpoint: POST /api/reload-model"
else
    echo "❌ Failed to copy model"
    exit 1
fi

