#!/usr/bin/env python3
"""
Train YOLOv8 model on LEGO brick dataset
Uses Roboflow LEGO dataset for best results
"""

import os
from ultralytics import YOLO
from pathlib import Path
import yaml
import sys
import shutil

# Ensure the script runs from its directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("🚀 Training YOLOv8 on LEGO Brick Dataset")
print("=" * 60)

ROBOFLOW_DATASET_PATH = Path("models/roboflow-lego-dataset")
DATA_YAML_PATH = ROBOFLOW_DATASET_PATH / "data.yaml"

# Fallback to lego-yolo-subset if roboflow dataset doesn't exist
if not DATA_YAML_PATH.exists():
    FALLBACK_DATASET = Path("models/lego-yolo-subset/data.yaml")
    if FALLBACK_DATASET.exists():
        DATA_YAML_PATH = FALLBACK_DATASET
        ROBOFLOW_DATASET_PATH = FALLBACK_DATASET.parent
        print(f"⚠️  Using fallback dataset: {DATA_YAML_PATH}")
    else:
        print(f"❌ Dataset config (data.yaml) not found!")
        print(f"   Expected: {DATA_YAML_PATH}")
        print(f"   Or: {FALLBACK_DATASET}")
        sys.exit(1)

# Fix data.yaml paths to be absolute
print(f"🔧 Loading dataset config: {DATA_YAML_PATH}")
with open(DATA_YAML_PATH, 'r') as f:
    data_config = yaml.safe_load(f)

base_path = ROBOFLOW_DATASET_PATH.resolve()
if isinstance(data_config.get('train'), str) and not os.path.isabs(data_config['train']):
    data_config['train'] = str(base_path / data_config['train'])
if isinstance(data_config.get('val'), str) and not os.path.isabs(data_config['val']):
    data_config['val'] = str(base_path / data_config['val'])
if 'test' in data_config and isinstance(data_config['test'], str) and not os.path.isabs(data_config['test']):
    data_config['test'] = str(base_path / data_config['test'])

with open(DATA_YAML_PATH, 'w') as f:
    yaml.safe_dump(data_config, f)
print(f"✅ Fixed data.yaml paths")

# Check for existing checkpoint
checkpoint = Path("runs/detect/yolov8_lego/weights/last.pt")
if checkpoint.exists():
    print(f"📦 Found existing checkpoint: {checkpoint}")
    print("   Starting from checkpoint...")
    model = YOLO(str(checkpoint))
    resume = True
else:
    print("📦 Loading YOLOv8 base model (yolov8n.pt)...")
    model = YOLO('yolov8n.pt')  # This will auto-download if needed
    resume = False

print("\n⚙️  TRAINING CONFIGURATION:")
print(f"   Dataset: {DATA_YAML_PATH}")
print(f"   Image size: 640px (optimal balance)")
print(f"   Batch size: 16 (balanced for CPU)")
print(f"   Epochs: 100 (will stop early if no improvement)")
print(f"   Patience: 50 (early stopping)")
print(f"   Resume: {resume}")
print(f"   Output: runs/detect/yolov8_lego/")
print("")

print("🔄 Starting training...")
print("   This will take several hours depending on your hardware")
print("   Progress will be saved automatically")
print("")

try:
    results = model.train(
        data=str(DATA_YAML_PATH),
        epochs=100,
        imgsz=640,           # Standard YOLO size for best accuracy
        batch=16,            # Balanced for CPU/memory
        name='yolov8_lego',  # Training run name
        resume=resume,
        patience=50,         # Early stopping patience
        save=True,
        plots=True,          # Generate training plots
        verbose=True,
        device='cpu',        # Use CPU (change to 'cuda' if GPU available)
        workers=4,           # Data loading workers
        amp=False,           # Disable mixed precision on CPU
        cache=False,         # Disable caching to save memory
        close_mosaic=10,     # Early mosaic disable for faster training
        # Learning rate settings
        lr0=0.01,
        lrf=0.1,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3,
        warmup_momentum=0.8,
        warmup_bias_lr=0.1
    )

    # Copy best model to models directory
    best_model = Path("runs/detect/yolov8_lego/weights/best.pt")
    if best_model.exists():
        models_dir = Path("models")
        models_dir.mkdir(exist_ok=True)
        
        target_path = models_dir / "yolo8_lego.pt"
        shutil.copy(best_model, target_path)
        
        size_mb = target_path.stat().st_size / 1024 / 1024
        print(f"\n✅✅✅ TRAINING COMPLETE! ✅✅✅")
        print(f"✅ Best model saved: {target_path}")
        print(f"   Size: {size_mb:.1f} MB")
        print(f"   mAP50: {results.results_dict.get('metrics/mAP50(B)', 'N/A')}")
        print(f"   mAP50-95: {results.results_dict.get('metrics/mAP50-95(B)', 'N/A')}")
        print("\n🚀 Start detection server: python3 yolo-detection-server.py")
    else:
        print("\n⚠️  Training completed but best model not found")
        print(f"   Check: runs/detect/yolov8_lego/weights/")

except Exception as e:
    print(f"\n❌ Training error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)




