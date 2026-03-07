#!/usr/bin/env python3
"""
Check MPS (Metal Performance Shaders) availability on Apple Silicon
"""
import sys

try:
    import torch
    print("🔍 Checking MPS availability...")
    print(f"   PyTorch version: {torch.__version__}")
    
    if hasattr(torch.backends, 'mps'):
        mps_available = torch.backends.mps.is_available()
        mps_built = torch.backends.mps.is_built()
        
        print(f"   MPS built: {mps_built}")
        print(f"   MPS available: {mps_available}")
        
        if mps_available:
            print("\n✅ MPS is available! GPU acceleration will be used.")
            print("   Expected speedup: 5-10x faster than CPU")
            sys.exit(0)
        else:
            print("\n⚠️  MPS is built but not available.")
            print("   Possible reasons:")
            print("   - macOS version too old (need macOS 12.3+)")
            print("   - PyTorch version too old (need 1.12+)")
            print("   - Running on non-Apple Silicon Mac")
            print("\n   Will fallback to CPU training.")
            sys.exit(1)
    else:
        print("\n❌ MPS backend not found in PyTorch.")
        print("   PyTorch version may be too old or not built with MPS support.")
        print("   Install PyTorch with MPS support:")
        print("   pip install torch torchvision")
        sys.exit(1)
        
except ImportError:
    print("❌ PyTorch not installed!")
    print("   Install with: pip install torch torchvision")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error checking MPS: {e}")
    sys.exit(1)




