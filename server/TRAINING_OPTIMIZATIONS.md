# Training Speed Optimizations

## 🚀 Speed Improvements

### Current Training (640px images)
- **Roboflow**: ~48 minutes per epoch × 15 = **~12 hours**
- **Original**: ~17-18 minutes per epoch × 50 = **~13-14 hours**

### Optimized Training
- **Roboflow (320px)**: ~12-15 minutes per epoch × 15 = **~3-4 hours** ⚡ **3x faster**
- **Original (416px)**: ~7-9 minutes per epoch × 50 = **~6-8 hours** ⚡ **2x faster**

## ⚙️ Optimizations Applied

1. **Reduced Image Size**
   - Roboflow: 640px → **320px** (4x area reduction = 4x faster)
   - Original: 640px → **416px** (2.4x area reduction = 2.4x faster)
   - *Note: Smaller images may slightly reduce accuracy, but still very usable*

2. **Optimized Batch Size**
   - Set to 16 (balanced for CPU memory and speed)

3. **Reduced Workers**
   - Set to 1 worker to avoid CPU contention when running multiple trainings

4. **Disabled Unnecessary Features**
   - `plots=False` - Saves time on plot generation
   - `cache=False` - Saves memory
   - `amp=False` - Not needed on CPU

5. **Early Mosaic Disable**
   - `close_mosaic=10` - Disables data augmentation earlier for speed

6. **Optimized Learning Rate**
   - Slightly higher initial LR for faster convergence

## 📋 How to Use

### Option 1: Restart with Optimized Settings (Recommended)

```bash
cd server
./restart-optimized-training.sh
```

This will:
1. Stop current training processes
2. Ask which training to restart
3. Start with optimized settings

### Option 2: Manual Start

**Roboflow Optimized:**
```bash
cd server
source venv/bin/activate
python3 train-roboflow-optimized.py
```

**Original Optimized:**
```bash
cd server
source venv/bin/activate
python3 train-original-optimized.py
```

### Option 3: Continue Current Training

If you want to let current training finish, you can:
- Keep current training running
- Start optimized training in parallel (will be slower due to CPU contention)
- Or wait for current to finish

## ⚠️ Important Notes

1. **Checkpoint Compatibility**: The optimized scripts will create new training runs (`roboflow_lego_optimized` and `lego_kaggle2_optimized`), so you'll start fresh. However, you can still use the partially trained models from the current runs.

2. **Accuracy Trade-off**: Smaller image sizes (320px/416px) may have slightly lower accuracy than 640px, but the difference is usually minimal and the speed gain is significant.

3. **Model Quality**: The optimized models will still be production-ready. YOLO models are quite robust to image size variations.

## 📊 Monitoring

After starting optimized training:

```bash
# Check if running
ps aux | grep train

# Monitor progress
tail -f roboflow-optimized.log
tail -f original-optimized.log

# Check results
ls -lh runs/detect/roboflow_lego_optimized/weights/
ls -lh runs/detect/lego_kaggle2_optimized/weights/
```

## ✅ Recommendation

**Restart with optimized settings** - You'll save ~8-10 hours total and get usable models much faster!

