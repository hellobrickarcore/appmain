#!/usr/bin/env python3
"""
Download LEGO detection model from Roboflow Universe
"""

import os
import sys
from pathlib import Path

try:
    from roboflow import Roboflow
except ImportError:
    print("📦 Installing Roboflow SDK...")
    os.system("python3 -m pip install roboflow --quiet")
    from roboflow import Roboflow

def download_roboflow_model():
    """Download the Hex LEGO detection model from Roboflow"""
    
    print("📥 Downloading Roboflow LEGO Model")
    print("=" * 60)
    print("Model: Hex LEGO Object Detection (YOLOv7)")
    print("URL: https://universe.roboflow.com/hexhewwie/hex-lego")
    print("")
    
    # Roboflow workspace and project
    workspace = "hexhewwie"
    project = "hex-lego"
    
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    try:
        # Try with public access (no API key needed for public models)
        print("🔄 Attempting to download...")
        
        # Initialize Roboflow (public models don't need API key)
        rf = Roboflow()
        
        # Get the project
        project_obj = rf.workspace(workspace).project(project)
        
        # Get the latest model version
        model = project_obj.version(1).model
        
        print(f"✅ Found model: {model}")
        print("")
        print("💡 Roboflow models are typically downloaded via:")
        print("   1. Roboflow SDK (requires API key for some models)")
        print("   2. Manual download from website")
        print("")
        print("📋 Manual Download Instructions:")
        print("   1. Visit: https://universe.roboflow.com/hexhewwie/hex-lego")
        print("   2. Click 'Download' or 'Get Dataset'")
        print("   3. Select format: 'YOLOv7 PyTorch'")
        print("   4. Download the .pt model file")
        print("   5. Place it in: server/models/yolo11_lego.pt")
        print("")
        print("   Or if you have Roboflow API key:")
        print("   - Set ROBOFLOW_API_KEY environment variable")
        print("   - Then run this script again")
        
        return False
        
    except Exception as e:
        print(f"⚠️  SDK download issue: {e}")
        print("")
        print("📋 Alternative: Manual Download")
        print("   1. Visit: https://universe.roboflow.com/hexhewwie/hex-lego")
        print("   2. Look for 'Download' or 'Export' button")
        print("   3. Select 'YOLOv7 PyTorch' format")
        print("   4. Download the .pt file")
        print("   5. Save to: server/models/yolo11_lego.pt")
        print("")
        print("   Once downloaded, I can verify and set it up!")
        
        return False

if __name__ == '__main__':
    download_roboflow_model()
