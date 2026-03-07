#!/usr/bin/env python3
"""
Download LEGO detection model from Roboflow Universe
"""

import requests
import os
from pathlib import Path

def download_roboflow_model():
    """Download the Hex LEGO detection model from Roboflow"""
    
    # Roboflow model info
    model_url = "https://universe.roboflow.com/hexhewwie/hex-lego"
    
    print("📥 Downloading Roboflow LEGO Model")
    print("=" * 60)
    print(f"Model: Hex LEGO Object Detection (YOLOv7)")
    print(f"URL: {model_url}")
    print("")
    
    print("💡 To download from Roboflow:")
    print("   1. Visit: https://universe.roboflow.com/hexhewwie/hex-lego")
    print("   2. Click 'Download' or 'Get Model'")
    print("   3. Select format: YOLOv7 PyTorch (.pt)")
    print("   4. Download the model file")
    print("   5. Place it in: server/models/yolo11_lego.pt")
    print("")
    print("   Or use Roboflow API if you have credentials")
    
    # Note: Roboflow requires API key for programmatic access
    # For now, manual download is recommended
    
    return False

if __name__ == '__main__':
    download_roboflow_model()

