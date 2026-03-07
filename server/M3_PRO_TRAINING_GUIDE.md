# M3 Pro Training Optimization Guide

## ✅ MPS Status
**MPS is available on your system!** GPU acceleration will be used automatically.

## 🚀 Quick Start

### Option 1: Use the New M3 Pro Optimized Script (Recommended)
```bash
cd server
python3 train-roboflow-mps.py
```

**Expected time:** ~20-30 minutes for 15 epochs (8-12x faster than CPU)

### Option 2: Use Updated Existing Scripts
The existing scripts now auto-detect MPS:
```bash
cd server
python3 train-roboflow-optimized.py
```

## ⚡ Optimizations Applied

### For M3 Pro (when MPS detected):
- **Device:** MPS (Metal Performance Shaders GPU)
- **Batch size:** 48 (optimized for 18GB memory)
- **Workers:** 8 (parallel data loading)
- **Cache:** RAM (entire dataset cached)
- **AMP:** Enabled (mixed precision training)
- **Val period:** 2 (validate every 2 epochs)
- **Patience:** 3 (early stopping)

### CPU Fallback (if MPS unavailable):
- **Device:** CPU
- **Batch size:** 16
- **Workers:** 1-4
- **Cache:** Disabled
- **AMP:** Disabled

## 📊 Expected Performance

### Before (CPU only):
- 320px images, 15 epochs: **~3-4 hours**
- 416px images, 50 epochs: **~6-8 hours**

### After (MPS + optimizations):
- 320px images, 15 epochs: **~20-30 minutes** (8-12x faster)
- 416px images, 50 epochs: **~45-90 minutes** (4-8x faster)

## 🔍 Check MPS Status

```bash
cd server
python3 check-mps.py
```

## 📝 Training Scripts

1. **`train-roboflow-mps.py`** - M3 Pro optimized (recommended)
   - Full MPS optimizations
   - Batch size: 48
   - Workers: 8
   - Cache: RAM
   - AMP: Enabled

2. **`train-roboflow-optimized.py`** - Auto-detects MPS
   - Falls back to CPU if MPS unavailable
   - Adaptive batch size and workers

3. **`train-original-optimized.py`** - Auto-detects MPS
   - Same auto-detection as above
   - For original dataset

## 💡 Tips

- **Monitor memory:** `watch -n 1 vm_stat` during training
- **If OOM errors:** Reduce batch size from 48 to 32
- **If too slow:** Increase batch size from 48 to 64 (if memory allows)
- **Check progress:** `tail -f runs/detect/roboflow_lego_mps/train.log`

## 🎯 Best Practice

Use `train-roboflow-mps.py` for maximum speed on your M3 Pro!




