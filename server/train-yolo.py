#!/usr/bin/env python3
"""Train YOLO v11 model on LEGO dataset"""
from ultralytics import YOLO
from pathlib import Path
import sys

data_yaml = Path("models/lego-yolo-subset/data.yaml")
checkpoint = Path("runs/detect/lego_kaggle2/weights/last.pt")

if not data_yaml.exists():
    print("❌ Dataset not found!")
    sys.exit(1)

if checkpoint.exists():
    print(f"📦 Resuming from checkpoint: {checkpoint}")
    model = YOLO(str(checkpoint))
    resume = True
else:
    print("🆕 Starting fresh training")
    model = YOLO('yolo11n.pt')
    resume = False

print(f"🚀 Training for 50 epochs (resume={resume})...")
print("   This will take 15-30 minutes...")
print("   Progress will be saved to runs/detect/lego_kaggle2/")

try:
    # OPTIMIZED FOR SPEED - Can resume with new settings
    results = model.train(
        data=str(data_yaml),
        epochs=50,
        imgsz=416,  # Reduced from 640 for 2.4x faster processing
        batch=24,   # Increased batch size for better utilization
        name='lego_kaggle2',
        resume=resume,
        patience=25,
        save=True,
        plots=False,  # Disable plots to save time
        verbose=True,
        device='cpu',  # Explicit CPU
        workers=1,     # Reduced workers to avoid CPU contention with other training
        amp=False,      # Disable mixed precision on CPU
        cache=False,   # Disable caching to save memory
        close_mosaic=10  # Early mosaic disable for speed
    )
    
    best_model = Path("runs/detect/lego_kaggle2/weights/best.pt")
    if best_model.exists():
        models_dir = Path("models")
        models_dir.mkdir(exist_ok=True)
        import shutil
        shutil.copy(best_model, models_dir / "yolo11_lego.pt")
        print(f"\n✅✅✅ TRAINING COMPLETE! ✅✅✅")
        print(f"✅ Trained model saved: models/yolo11_lego.pt")
    else:
        print("\n⚠️  Training completed but best model not found")
except Exception as e:
    print(f"\n❌ Training error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

