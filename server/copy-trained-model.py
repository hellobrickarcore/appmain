#!/usr/bin/env python3
"""
Copy existing trained model to yolo8_lego.pt location
"""
from pathlib import Path
import shutil
import sys

print("🔍 Looking for existing trained models...\n")

# Check for best trained models (in priority order)
best_models = [
    "runs/detect/roboflow_lego_fresh/weights/best.pt",
    "runs/detect/roboflow_lego_optimized/weights/best.pt",
    "runs/detect/lego_kaggle2/weights/best.pt",
    "models/yolo11_lego.pt",
]

found_models = []
for model_path in best_models:
    path = Path(model_path)
    if path.exists():
        size_mb = path.stat().st_size / 1024 / 1024
        found_models.append((model_path, size_mb))
        print(f"✅ Found: {model_path} ({size_mb:.1f} MB)")

if not found_models:
    print("❌ No trained models found!")
    print("   Please train a model first: python3 train-yolov8-lego.py")
    sys.exit(1)

# Use the largest one
found_models.sort(key=lambda x: x[1], reverse=True)
best_model_path, best_size = found_models[0]

print(f"\n📦 Using best model: {best_model_path}")
print(f"   Size: {best_size:.1f} MB\n")

# Copy to models/yolo8_lego.pt
target = Path("models/yolo8_lego.pt")
target.parent.mkdir(exist_ok=True)
shutil.copy(best_model_path, target)

print(f"✅ Copied to: {target}")
print(f"\n🚀 Model is ready! Start the server:")
print(f"   python3 yolo-detection-server.py")




