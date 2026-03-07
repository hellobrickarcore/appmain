#!/usr/bin/env python3
"""
Check what YOLO version the trained models actually are
"""

from ultralytics import YOLO
from pathlib import Path
import torch

def check_model(model_path):
    """Check model version and info"""
    path = Path(model_path)
    if not path.exists():
        return None
    
    try:
        # Load checkpoint to check metadata
        ckpt = torch.load(str(path), map_location='cpu')
        
        info = {
            'path': str(path),
            'size_mb': path.stat().st_size / 1024 / 1024,
            'keys': list(ckpt.keys()),
        }
        
        # Check for version info in metadata
        if 'metadata' in ckpt:
            info['metadata'] = ckpt['metadata']
        
        # Try to load as YOLO model
        model = YOLO(str(path))
        info['loaded'] = True
        info['num_classes'] = len(model.names) if hasattr(model, 'names') else None
        
        # Check model architecture
        if hasattr(model, 'model'):
            model_str = str(model.model)
            # Check for version indicators in architecture string
            if 'v8' in model_str.lower() or 'yolov8' in model_str.lower():
                info['likely_version'] = 'YOLOv8'
            elif 'v11' in model_str.lower() or 'yolov11' in model_str.lower():
                info['likely_version'] = 'YOLOv11'
            elif 'v5' in model_str.lower() or 'yolov5' in model_str.lower():
                info['likely_version'] = 'YOLOv5'
            else:
                info['likely_version'] = 'Unknown'
        
        return info
    except Exception as e:
        return {'path': str(path), 'error': str(e)}

# Check all existing models
models = [
    'models/yolo11_lego.pt',
    'runs/detect/roboflow_lego_fresh/weights/best.pt',
    'runs/detect/roboflow_lego_optimized/weights/best.pt',
    'runs/detect/lego_kaggle2/weights/best.pt',
]

print("Checking trained models for version information...\n")
for model_path in models:
    result = check_model(model_path)
    if result:
        print(f"📦 {model_path}")
        if 'error' in result:
            print(f"   ❌ Error: {result['error']}\n")
        else:
            print(f"   Size: {result['size_mb']:.1f} MB")
            if 'likely_version' in result:
                print(f"   Likely version: {result['likely_version']}")
            if 'num_classes' in result and result['num_classes']:
                print(f"   Classes: {result['num_classes']}")
            print()




