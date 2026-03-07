#!/bin/bash
# Restart training with optimized settings

set -e

cd "$(dirname "$0")"

echo "⚡ Restarting Training with Optimized Settings"
echo "=============================================="
echo ""

# Check if training is running
if pgrep -f "train-roboflow" > /dev/null || pgrep -f "train-yolo" > /dev/null; then
    echo "⚠️  Training processes detected. Stopping them..."
    pkill -f "train-roboflow" || true
    pkill -f "train-yolo" || true
    sleep 2
    echo "✅ Stopped existing training"
    echo ""
fi

echo "Choose which training to restart:"
echo "1. Roboflow Quick (15 epochs, ~3-4 hours with optimizations)"
echo "2. Original Dataset (50 epochs, ~6-8 hours with optimizations)"
echo "3. Both (run sequentially)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "🚀 Starting optimized Roboflow training..."
        source venv/bin/activate 2>/dev/null || true
        nohup python3 train-roboflow-optimized.py > roboflow-optimized.log 2>&1 &
        echo "✅ Started! Monitor with: tail -f roboflow-optimized.log"
        ;;
    2)
        echo "🚀 Starting optimized original training..."
        source venv/bin/activate 2>/dev/null || true
        nohup python3 train-original-optimized.py > original-optimized.log 2>&1 &
        echo "✅ Started! Monitor with: tail -f original-optimized.log"
        ;;
    3)
        echo "🚀 Starting both trainings sequentially..."
        echo "   (Roboflow first, then original)"
        source venv/bin/activate 2>/dev/null || true
        nohup python3 train-roboflow-optimized.py > roboflow-optimized.log 2>&1 &
        echo "✅ Started Roboflow training! Monitor with: tail -f roboflow-optimized.log"
        echo ""
        echo "⚠️  Note: Original training will start after Roboflow completes"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📊 Check training status:"
echo "   ps aux | grep train"
echo ""
echo "📈 Monitor progress:"
echo "   tail -f roboflow-optimized.log  # or original-optimized.log"
