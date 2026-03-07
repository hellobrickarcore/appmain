#!/usr/bin/env python3
"""
Quick train YOLOv7 on Roboflow LEGO dataset
10-20 epochs for fast testing
"""

from ultralytics import YOLO
from pathlib import Path
import sys

data_yaml = Path("models/roboflow-lego-dataset/data.yaml")

if not data_yaml.exists():
    print("❌ Dataset not found!")
    sys.exit(1)

print("🚀 Quick Training YOLOv7 on Roboflow LEGO Dataset")
print("=" * 60)
print(f"Dataset: {data_yaml}")
print("Epochs: 15 (quick training)")
print("Time: ~30-60 minutes")
print("")

# Load YOLOv11 base model (compatible with YOLOv7 datasets)
print("📦 Loading YOLOv11 base model...")
from pathlib import Path
models_dir = Path("models")
if (models_dir / "yolo11n.pt").exists():
    base_model = str(models_dir / "yolo11n.pt")
else:
    base_model = "yolo11n.pt"  # Will auto-download
model = YOLO(base_model)

print("✅ Model loaded")
print("")
print("🔄 Starting training...")
print("   This will take ~30-60 minutes")
print("   Progress will be shown below")
print("")

try:
    # Train with 15 epochs (quick) - OPTIMIZED FOR SPEED
    results = model.train(
        data=str(data_yaml),
        epochs=15,
        imgsz=416,  # Reduced from 640 for 2.4x faster processing
        batch=32,   # Increased batch size for better GPU/CPU utilization
        name='roboflow_lego_quick',
        patience=5,
        save=True,
        plots=False,  # Disable plots to save time
        verbose=True,
        device='cpu',  # Explicit CPU
        workers=2,     # Reduced workers to avoid CPU contention
        amp=False,      # Disable mixed precision on CPU
        cache=False,   # Disable caching to save memory
        close_mosaic=10  # Early mosaic disable for speed
    )
    
    # Copy best model to target location
    best_model = Path("runs/detect/roboflow_lego_quick/weights/best.pt")
    if best_model.exists():
        models_dir = Path("models")
        models_dir.mkdir(exist_ok=True)
        import shutil
        target = models_dir / "yolo11_lego.pt"
        shutil.copy(best_model, target)
        print(f"\n✅✅✅ TRAINING COMPLETE! ✅✅✅")
        print(f"✅ Model saved to: {target}")
        print(f"   Size: {target.stat().st_size / 1024 / 1024:.1f} MB")
        print(f"\n🚀 Ready to use! Start server:")
        print(f"   python3 yolo-detection-server.py")
    else:
        print("\n⚠️  Training completed but best model not found")
        print(f"   Check: runs/detect/roboflow_lego_quick/weights/")
        
except Exception as e:
    print(f"\n❌ Training error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

