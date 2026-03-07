#!/bin/bash
# Monitor YOLO training and auto-export to ONNX when complete

echo "👀 Monitoring YOLO training..."
echo "   Will auto-export to ONNX when training completes"
echo ""

TRAINING_LOG="/tmp/yolo-training.log"
LAST_EPOCH=0

while true; do
    # Check if training is still running
    if ! pgrep -f "train-roboflow-optimized.py" > /dev/null; then
        echo "✅ Training process completed!"
        
        # Check if model exists
        if [ -f "runs/detect/roboflow_lego_fresh/weights/best.pt" ]; then
            echo "📦 Found trained model, exporting to ONNX..."
            python3 export-to-onnx.py
            echo "✅ Export complete!"
        else
            echo "⚠️  Training finished but model not found"
        fi
        
        break
    fi
    
    # Check current epoch
    if [ -f "$TRAINING_LOG" ]; then
        CURRENT_EPOCH=$(tail -100 "$TRAINING_LOG" | grep -oP "Epoch\s+\K\d+" | tail -1)
        if [ ! -z "$CURRENT_EPOCH" ] && [ "$CURRENT_EPOCH" != "$LAST_EPOCH" ]; then
            echo "📊 Epoch $CURRENT_EPOCH/15"
            LAST_EPOCH=$CURRENT_EPOCH
        fi
    fi
    
    sleep 30
done


