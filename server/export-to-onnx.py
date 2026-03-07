#!/usr/bin/env python3
"""
Export trained YOLOv8 model to ONNX for Flutter/mobile
Run this after training completes
"""

from ultralytics import YOLO
from pathlib import Path
import shutil

print("📦 Exporting YOLOv8 to ONNX for Flutter")
print("=" * 60)

# Find best model from training (YOLOv8)
model_paths = [
    "models/yolo8_lego.pt",              # Primary trained model
    "models/yolov8_lego.pt",             # Alternative naming
    "runs/detect/yolov8_lego/weights/best.pt",  # Latest training run
]

model_path = None
for path in model_paths:
    if Path(path).exists():
        model_path = path
        break

if not model_path:
    print("❌ No trained YOLOv8 model found!")
    print("   Train the model first: python3 train-yolov8-lego.py")
    exit(1)

print(f"📦 Loading model: {model_path}")
model = YOLO(model_path)

print("🔄 Exporting to ONNX...")
model.export(
    format='onnx',
    imgsz=640,      # Match training size
    optimize=True,  # Optimize for mobile
    simplify=True,  # Simplify model
    dynamic=False,  # Fixed input size for better mobile performance
)

# Find exported ONNX model
onnx_path = model_path.replace('.pt', '.onnx')
if not Path(onnx_path).exists():
    # Try alternative location
    onnx_path = str(Path(model_path).parent / Path(model_path).stem) + '.onnx'

if Path(onnx_path).exists():
    # Copy to models directory
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    target_path = models_dir / "yolo8_lego.onnx"
    shutil.copy(onnx_path, target_path)
    
    size_mb = Path(target_path).stat().st_size / 1024 / 1024
    print(f"✅ Model exported successfully!")
    print(f"   Size: {size_mb:.1f} MB")
    print(f"   Location: {target_path}")
    
    # Also copy to Flutter assets if directory exists
    flutter_models_dir = Path("../flutter_app/assets/models")
    if flutter_models_dir.exists() or Path("../flutter_app").exists():
        flutter_models_dir.mkdir(parents=True, exist_ok=True)
        flutter_target = flutter_models_dir / "yolo8_lego.onnx"
        shutil.copy(onnx_path, flutter_target)
        print(f"   Flutter location: {flutter_target}")
    
    print(f"\n🚀 Ready for mobile integration!")
else:
    print(f"⚠️  ONNX model not found at expected location: {onnx_path}")

