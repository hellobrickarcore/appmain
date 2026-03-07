#!/usr/bin/env python3
"""
Convert YOLO11 LEGO model to CoreML format for native iOS inference.

Requirements:
  - Python 3.12 or 3.13 (NOT 3.14 — coremltools doesn't support it yet)
  - pip install ultralytics coremltools

Usage:
  python3 convert_to_coreml.py
"""

from ultralytics import YOLO
import os
import shutil

# Paths
MODEL_PT = os.path.join(os.path.dirname(__file__), 'server/models/yolo11_lego.pt')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'ios/App/App/Models')

def main():
    print(f'📦 Loading model: {MODEL_PT}')
    model = YOLO(MODEL_PT)
    
    print('🔄 Exporting to CoreML (this may take a minute)...')
    result = model.export(
        format='coreml',
        imgsz=320,
        nms=True,        # Include NMS in the model
        half=False,      # Keep FP32 for accuracy
    )
    
    print(f'✅ Exported: {result}')
    
    # Move to iOS project
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    mlpackage_name = os.path.basename(result)
    dest = os.path.join(OUTPUT_DIR, 'YOLOBrickDetector.mlpackage')
    
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.move(result, dest)
    
    print(f'📱 CoreML model saved to: {dest}')
    print('   → Add this to your Xcode project')
    print('   → Xcode will auto-compile it for the Neural Engine')

if __name__ == '__main__':
    main()
