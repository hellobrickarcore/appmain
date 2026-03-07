#!/bin/bash
# Extract and set up Roboflow LEGO model from ZIP

cd "$(dirname "$0")"

if [ -z "$1" ]; then
    echo "📦 Roboflow Model Extractor"
    echo "=========================="
    echo ""
    echo "Usage: ./extract-roboflow-model.sh /path/to/lego-model.zip"
    echo ""
    echo "Or if ZIP is in Downloads:"
    echo "  ./extract-roboflow-model.sh ~/Downloads/*lego*.zip"
    echo ""
    exit 1
fi

ZIP_FILE="$1"
MODELS_DIR="models"
TARGET="$MODELS_DIR/yolo11_lego.pt"

if [ ! -f "$ZIP_FILE" ]; then
    echo "❌ ZIP file not found: $ZIP_FILE"
    exit 1
fi

echo "📦 Extracting Roboflow model..."
echo "   ZIP: $ZIP_FILE"
echo ""

# Create temp extraction directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Extract ZIP
unzip -q "$ZIP_FILE" -d "$TEMP_DIR" || {
    echo "❌ Failed to extract ZIP file"
    exit 1
}

echo "✅ Extracted successfully"
echo ""

# Find .pt file
echo "🔍 Looking for model file (.pt)..."
PT_FILES=$(find "$TEMP_DIR" -name "*.pt" -type f)

if [ -z "$PT_FILES" ]; then
    echo "⚠️  No .pt file found in ZIP"
    echo ""
    echo "📂 Contents of ZIP:"
    find "$TEMP_DIR" -type f | head -20
    echo ""
    echo "💡 Please check the ZIP structure and locate the .pt file manually"
    exit 1
fi

# Use the first .pt file found (usually best.pt)
MODEL_FILE=$(echo "$PT_FILES" | head -1)
echo "✅ Found model: $MODEL_FILE"

# Copy to target location
mkdir -p "$MODELS_DIR"
cp "$MODEL_FILE" "$TARGET"

echo ""
echo "✅ Model set up successfully!"
echo "   Location: $TARGET"
echo "   Size: $(du -h "$TARGET" | cut -f1)"
echo ""
echo "🔄 Verifying model..."
python3 -c "from ultralytics import YOLO; model = YOLO('$TARGET'); print('✅ Model loads successfully!')" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Ready to use! Start server with:"
    echo "   python3 yolo-detection-server.py"
else
    echo ""
    echo "⚠️  Model verification failed, but file is in place"
    echo "   You can still try starting the server"
fi

