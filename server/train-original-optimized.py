#!/usr/bin/env python3
"""
OPTIMIZED Train YOLO v11 model on original LEGO dataset
Speed optimizations: smaller image size, optimized batch, fewer workers
"""

import os
from ultralytics import YOLO
from pathlib import Path
import sys

# Ensure the script runs from its directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("🚀 OPTIMIZED Training YOLO v11 on Original LEGO Dataset")
print("=" * 60)

data_yaml = Path("models/lego-yolo-subset/data.yaml")
checkpoint = Path("runs/detect/lego_kaggle2_optimized/weights/last.pt")

if not data_yaml.exists():
    print("❌ Dataset config (data.yaml) not found!")
    sys.exit(1)

if checkpoint.exists():
    print(f"📦 Resuming from checkpoint: {checkpoint}")
    model = YOLO(str(checkpoint))
    resume = True
else:
    print("🆕 Starting fresh training")
    model = YOLO('yolo11n.pt')
    resume = False

print("\n⚡ OPTIMIZED SETTINGS:")
print("   Image size: 416px (2.4x faster than 640px)")
print("   Batch size: 16 (balanced for CPU)")
print("   Workers: 1 (reduces CPU contention)")
print("   Epochs: 50")
print("   Estimated time: ~6-8 hours (vs ~13-14 hours)")
print("")

# Auto-detect best device (MPS for Apple Silicon, CPU fallback)
try:
    import torch
    if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        device = 'mps'
        batch_size = 48
        workers = 8
        amp = True
        cache = 'ram'
        print("✅ MPS GPU detected - using optimized settings")
    else:
        device = 'cpu'
        batch_size = 16
        workers = 1
        amp = False
        cache = False
        print("⚠️  MPS not available - using CPU settings")
except:
    device = 'cpu'
    batch_size = 16
    workers = 1
    amp = False
    cache = False

print(f"🔄 Starting optimized training (resume={resume})...")

try:
    results = model.train(
        data=str(data_yaml),
        epochs=50,
        imgsz=416,      # 416px = 2.4x faster than 640px
        batch=batch_size,
        name='lego_kaggle2_optimized',
        resume=resume,
        patience=25,
        save=True,
        plots=False,    # Disable plots to save time
        verbose=True,
        device=device,
        workers=workers,
        amp=amp,
        cache=cache,
        close_mosaic=10, # Early mosaic disable
        lr0=0.01,       # Slightly higher learning rate
        lrf=0.1,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3
    )

    best_model = Path("runs/detect/lego_kaggle2_optimized/weights/best.pt")
    if best_model.exists():
        models_dir = Path("models")
        models_dir.mkdir(exist_ok=True)
        import shutil
        shutil.copy(best_model, models_dir / "yolo11_lego.pt")
        print(f"\n✅✅✅ OPTIMIZED TRAINING COMPLETE! ✅✅✅")
        print(f"✅ Model saved: models/yolo11_lego.pt")
    else:
        print("\n⚠️  Training completed but best model not found")

except Exception as e:
    print(f"\n❌ Training error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n🚀 Start detection server: python3 yolo-detection-server.py")

