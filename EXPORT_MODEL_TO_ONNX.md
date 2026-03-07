# Export YOLOv11 Model to ONNX

## After Training Completes

Once YOLO training finishes, export the model to ONNX for Flutter:

```python
from ultralytics import YOLO

# Load trained model
model = YOLO('runs/detect/roboflow_lego_fresh/weights/best.pt')

# Export to ONNX
model.export(
    format='onnx',
    imgsz=320,  # Match training size
    optimize=True,  # Optimize for mobile
    simplify=True,  # Simplify model
)

# Model will be saved as: runs/detect/roboflow_lego_fresh/weights/best.onnx
# Copy to: flutter_app/assets/models/yolo11_lego.onnx
```

## MobileSAM Download

Download MobileSAM ONNX model:
- Source: https://github.com/ChaoningZhang/MobileSAM
- Place in: `flutter_app/assets/models/mobilesam.onnx`


