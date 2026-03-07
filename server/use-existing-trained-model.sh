#!/bin/bash
# Copy existing trained model to yolo8_lego.pt location

cd "$(dirname "$0")"

echo "🔍 Looking for existing trained models..."
echo ""

# Check for best trained models
BEST_MODELS=(
    "runs/detect/roboflow_lego_fresh/weights/best.pt"
    "runs/detect/roboflow_lego_optimized/weights/best.pt"
    "runs/detect/lego_kaggle2/weights/best.pt"
    "models/yolo11_lego.pt"
)

FOUND_MODEL=""
LARGEST_SIZE=0

for model in "${BEST_MODELS[@]}"; do
    if [ -f "$model" ]; then
        size=$(stat -f%z "$model" 2>/dev/null || stat -c%s "$model" 2>/dev/null)
        size_mb=$((size / 1024 / 1024))
        echo "✅ Found: $model (${size_mb} MB)"
        if [ $size -gt $LARGEST_SIZE ]; then
            LARGEST_SIZE=$size
            FOUND_MODEL=$model
        fi
    fi
done

if [ -z "$FOUND_MODEL" ]; then
    echo ""
    echo "❌ No trained models found!"
    echo "   Please train a model first: python3 train-yolov8-lego.py"
    exit 1
fi

echo ""
echo "📦 Using best model: $FOUND_MODEL"
echo "   Size: $((LARGEST_SIZE / 1024 / 1024)) MB"
echo ""

# Copy to models/yolo8_lego.pt
TARGET="models/yolo8_lego.pt"
mkdir -p models
cp "$FOUND_MODEL" "$TARGET"

if [ -f "$TARGET" ]; then
    echo "✅ Copied to: $TARGET"
    echo ""
    echo "🚀 Model is ready! Start the server:"
    echo "   python3 yolo-detection-server.py"
else
    echo "❌ Failed to copy model"
    exit 1
fi




