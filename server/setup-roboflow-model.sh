#!/bin/bash
# Setup script for Roboflow LEGO model

cd "$(dirname "$0")"

echo "📥 Roboflow LEGO Model Setup"
echo "============================"
echo ""

MODEL_DIR="models"
TARGET_FILE="$MODEL_DIR/yolo11_lego.pt"

# Check if model already exists
if [ -f "$TARGET_FILE" ]; then
    echo "✅ Model file already exists: $TARGET_FILE"
    echo "   Size: $(du -h "$TARGET_FILE" | cut -f1)"
    echo ""
    echo "🔄 To use this model, run:"
    echo "   python3 yolo-detection-server.py"
    exit 0
fi

echo "📋 Manual Download Required"
echo ""
echo "The Roboflow model requires manual download:"
echo ""
echo "1. Visit: https://universe.roboflow.com/hexhewwie/hex-lego"
echo ""
echo "2. Look for one of these options:"
echo "   - 'Download' button"
echo "   - 'Export' or 'Get Dataset' button"
echo "   - 'Download Model' link"
echo ""
echo "3. Select format: 'YOLOv7 PyTorch' or 'YOLOv7'"
echo ""
echo "4. Download the .pt file (usually named 'best.pt' or 'weights/best.pt')"
echo ""
echo "5. Place it here: $TARGET_FILE"
echo ""
echo "   Or run:"
echo "   ./load-trained-model.sh /path/to/downloaded/model.pt"
echo ""
echo "6. Once downloaded, verify with:"
echo "   python3 -c \"from ultralytics import YOLO; YOLO('$TARGET_FILE')\""
echo ""
echo "💡 Alternative: If you have Roboflow API key:"
echo "   export ROBOFLOW_API_KEY='your-key-here'"
echo "   python3 download-roboflow-lego.py"

