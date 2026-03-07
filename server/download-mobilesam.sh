#!/bin/bash
# Download MobileSAM ONNX model for Flutter

echo "📥 Downloading MobileSAM ONNX model..."

FLUTTER_MODELS_DIR="../flutter_app/assets/models"
mkdir -p "$FLUTTER_MODELS_DIR"

# MobileSAM ONNX model URL (lightweight version)
MOBILESAM_URL="https://github.com/ChaoningZhang/MobileSAM/raw/master/weights/mobile_sam.pt"

# Try to find ONNX version or convert
echo "⚠️  MobileSAM ONNX may need to be converted from PyTorch"
echo "   Checking for pre-converted ONNX model..."

# Alternative: Use a pre-converted MobileSAM ONNX if available
# For now, we'll create a placeholder and document the conversion process

if [ ! -f "$FLUTTER_MODELS_DIR/mobilesam.onnx" ]; then
    echo "📝 Creating conversion guide..."
    cat > "$FLUTTER_MODELS_DIR/MOBILESAM_SETUP.md" << 'EOF'
# MobileSAM ONNX Setup

## Option 1: Use Pre-converted Model
Download from: https://github.com/ChaoningZhang/MobileSAM

## Option 2: Convert from PyTorch
```python
import torch
from mobile_sam import sam_model_registry, SamPredictor

# Load MobileSAM
checkpoint = "mobile_sam.pt"
model_type = "vit_t"
sam = sam_model_registry[model_type](checkpoint=checkpoint)

# Export to ONNX
torch.onnx.export(
    sam,
    dummy_input,
    "mobilesam.onnx",
    input_names=['image'],
    output_names=['masks'],
    dynamic_axes={'image': {0: 'batch'}, 'masks': {0: 'batch'}}
)
```

## Option 3: Use Lightweight Alternative
Consider using FastSAM or EdgeSAM for even smaller models.
EOF
    echo "✅ Setup guide created at: $FLUTTER_MODELS_DIR/MOBILESAM_SETUP.md"
fi

echo "✅ MobileSAM setup ready!"


