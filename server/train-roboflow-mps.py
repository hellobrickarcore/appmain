#!/usr/bin/env python3
"""
M3 Pro Optimized Training Script for Roboflow LEGO Dataset
Leverages Metal Performance Shaders (MPS) GPU acceleration
Optimized for MacBook Pro M3 Pro with 18GB memory
"""
import os
import sys
from pathlib import Path
import yaml

# Ensure the script runs from its directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("🚀 M3 Pro Optimized Training - Roboflow LEGO Dataset")
print("=" * 60)

# Check MPS availability
try:
    import torch
    if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        device = 'mps'
        print("✅ MPS GPU acceleration available - using Metal Performance Shaders")
    else:
        device = 'cpu'
        print("⚠️  MPS not available - falling back to CPU")
except ImportError:
    device = 'cpu'
    print("⚠️  PyTorch not found - using CPU")
except Exception as e:
    device = 'cpu'
    print(f"⚠️  Error checking MPS: {e} - using CPU")

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

# Load YOLOv11 base model
print("📦 Loading YOLOv11 base model (yolo11n.pt)...")
from ultralytics import YOLO
model = YOLO('yolo11n.pt')

# Determine optimal batch size based on device
if device == 'mps':
    # M3 Pro with 18GB can handle larger batches
    batch_size = 48  # Start conservative, can increase to 64 if memory allows
    workers = 8      # M3 Pro has many cores
    amp = True       # Mixed precision for GPU
    cache = 'ram'    # Cache in RAM (18GB is plenty)
else:
    # CPU fallback - more conservative
    batch_size = 16
    workers = 4
    amp = False
    cache = False

print("\n⚡ M3 PRO OPTIMIZED SETTINGS:")
print(f"   Device: {device.upper()}")
print(f"   Image size: 320px (4x faster than 640px)")
print(f"   Batch size: {batch_size} (optimized for {device})")
print(f"   Workers: {workers} (parallel data loading)")
print(f"   Cache: {cache} (images cached in RAM)")
print(f"   AMP: {amp} (mixed precision training)")
print(f"   Epochs: 15")
print(f"   Patience: 3 (early stopping)")
print(f"   Val period: 2 (validate every 2 epochs)")
if device == 'mps':
    print(f"\n   Expected time: ~20-30 minutes (8-12x faster than CPU)")
else:
    print(f"\n   Expected time: ~3-4 hours (CPU mode)")
print("")

print("🔄 Starting optimized training...")

try:
    results = model.train(
        data=str(DATA_YAML_PATH),
        epochs=15,
        imgsz=320,           # 320px = 4x faster than 640px
        batch=batch_size,    # Optimized for M3 Pro
        name='roboflow_lego_mps',
        resume=False,
        patience=3,          # Early stopping (reduced from 5)
        save=True,
        plots=False,         # Disable plots to save time
        verbose=True,
        device=device,       # MPS or CPU
        workers=workers,     # Parallel data loading
        amp=amp,             # Mixed precision for GPU
        cache=cache,         # RAM caching for M3 Pro
        close_mosaic=10,     # Early mosaic disable
        val_period=2,        # Validate every 2 epochs (faster)
        lr0=0.01,            # Optimized learning rate
        lrf=0.1,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3,
        warmup_momentum=0.8,
        warmup_bias_lr=0.1
    )

    # Copy best model
    best_model = Path("runs/detect/roboflow_lego_mps/weights/best.pt")
    if best_model.exists():
        models_dir = Path("models")
        models_dir.mkdir(exist_ok=True)
        import shutil
        shutil.copy(best_model, models_dir / "yolo11_lego.pt")
        print(f"\n✅✅✅ M3 PRO TRAINING COMPLETE! ✅✅✅")
        print(f"✅ Model saved: {models_dir / 'yolo11_lego.pt'}")
        print(f"   Size: {(models_dir / 'yolo11_lego.pt').stat().st_size / 1024 / 1024:.1f} MB")
        print(f"   Device used: {device.upper()}")
    else:
        print("\n⚠️  Training completed but best model not found")
        print(f"   Check: runs/detect/roboflow_lego_mps/weights/")

except Exception as e:
    print(f"\n❌ Training error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n🚀 Start detection server: python3 yolo-detection-server.py")




