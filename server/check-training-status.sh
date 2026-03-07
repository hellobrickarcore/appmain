#!/bin/bash
# Quick check of training status

cd "$(dirname "$0")"

echo "🔍 Checking training status..."
echo ""

# Check for completed training runs
if [ -f "runs/detect/roboflow_lego_fresh/weights/best.pt" ]; then
    echo "✅ Training completed: roboflow_lego_fresh"
    ls -lh runs/detect/roboflow_lego_fresh/weights/best.pt
    echo ""
fi

if [ -f "runs/detect/roboflow_lego_optimized/weights/best.pt" ]; then
    echo "✅ Training completed: roboflow_lego_optimized"
    ls -lh runs/detect/roboflow_lego_optimized/weights/best.pt
    echo ""
fi

if [ -f "models/yolo8_lego.pt" ]; then
    echo "✅ Model ready: models/yolo8_lego.pt"
    ls -lh models/yolo8_lego.pt
else
    echo "⚠️  models/yolo8_lego.pt not found"
    echo "   Run: python3 copy-trained-model.py"
fi
