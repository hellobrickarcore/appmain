#!/usr/bin/env python3
"""
OPTIMIZED Quick train YOLOv11 on Roboflow LEGO dataset
Speed optimizations: smaller image size, optimized batch, fewer workers
"""

import os
from ultralytics import YOLO
from pathlib import Path
import yaml
import sys

# Ensure the script runs from its directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("🚀 OPTIMIZED Quick Training YOLOv11 on Roboflow LEGO Dataset")
print("=" * 60)

ROBOFLOW_DATASET_PATH = Path("models/roboflow-lego-dataset")
DATA_YAML_PATH = ROBOFLOW_DATASET_PATH / "data.yaml"

if not DATA_YAML_PATH.exists():
    print(f"❌ Dataset config (data.yaml) not found at {DATA_YAML_PATH}")
    sys.exit(1)

# Fix data.yaml paths to be absolute
print("🔧 Fixing data.yaml with absolute paths...")
with open(DATA_YAML_PATH, 'r') as f:
    data_config = yaml.safe_load(f)

base_path = ROBOFLOW_DATASET_PATH.resolve()
data_config['train'] = str(base_path / data_config['train'])
data_config['val'] = str(base_path / data_config['val'])
if 'test' in data_config:
    data_config['test'] = str(base_path / data_config['test'])

with open(DATA_YAML_PATH, 'w') as f:
    yaml.safe_dump(data_config, f)
print(f"✅ Fixed data.yaml paths")

# Always start fresh training (previous training completed)
print("📦 Loading YOLOv11 base model (yolo11n.pt) for fresh training...")
model = YOLO('yolo11n.pt')
resume = False

print("\n⚡ OPTIMIZED SETTINGS:")
print("   Image size: 320px (4x faster than 640px)")
print("   Batch size: 16 (balanced for CPU)")
print("   Workers: 1 (reduces CPU contention)")
print("   Epochs: 15")
print("   Estimated time: ~3-4 hours (vs ~10-11 hours)")
print("")

# Auto-detect best device (MPS for Apple Silicon, CPU fallback)
try:
    import torch
    if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        device = 'mps'
        batch_size = 48  # M3 Pro can handle larger batches
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

print("🔄 Starting optimized training...")

try:
    results = model.train(
        data=str(DATA_YAML_PATH),
        epochs=15,
        imgsz=320,      # 320px = 4x faster than 640px (area reduction)
        batch=batch_size,
        name='roboflow_lego_fresh',
        resume=resume,
        patience=5,
        save=True,
        plots=False,    # Disable plots to save time
        verbose=True,
        device=device,
        workers=workers,
        amp=amp,
        cache=cache,
        close_mosaic=10, # Early mosaic disable
        lr0=0.01,       # Slightly higher learning rate for faster convergence
        lrf=0.1,        # Learning rate final
        momentum=0.937,  # Optimized momentum
        weight_decay=0.0005,
        warmup_epochs=3, # Fewer warmup epochs
        warmup_momentum=0.8,
        warmup_bias_lr=0.1
    )

    # Copy best model
    best_model = Path("runs/detect/roboflow_lego_optimized/weights/best.pt")
    if best_model.exists():
        models_dir = Path("models")
        models_dir.mkdir(exist_ok=True)
        import shutil
        shutil.copy(best_model, models_dir / "yolo11_lego.pt")
        print(f"\n✅✅✅ OPTIMIZED TRAINING COMPLETE! ✅✅✅")
        print(f"✅ Model saved: {models_dir / 'yolo11_lego.pt'}")
        print(f"   Size: {(models_dir / 'yolo11_lego.pt').stat().st_size / 1024 / 1024:.1f} MB")
    else:
        print("\n⚠️  Training completed but best model not found")

except Exception as e:
    print(f"\n❌ Training error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n🚀 Start detection server: python3 yolo-detection-server.py")

