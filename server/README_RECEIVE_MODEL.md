# Receiving Trained Model Dataset

## How to Send the Dataset

You can send the trained model in any of these ways:

### Option 1: Upload via Terminal
If you have the file path, run:
```bash
cd /Users/akeemojuko/Downloads/hellobrick/server
./load-trained-model.sh /path/to/your/model.pt
```

### Option 2: Place in Models Directory
Simply place your trained model file here:
```
/Users/akeemojuko/Downloads/hellobrick/server/models/yolo11_lego.pt
```

Or any of these names:
- `models/yolo11_lego.pt` (preferred)
- `models/trained-model.pt`
- `models/lego-model.pt`

### Option 3: Drag & Drop
If you're using a file manager, drag the `.pt` file to:
```
/Users/akeemojuko/Downloads/hellobrick/server/models/
```

## After Receiving the Model

1. **Test the model:**
   ```bash
   python3 yolo-detection-server.py
   ```

2. **Or reload without restart:**
   Send POST request to `/api/reload-model` with:
   ```json
   {
     "model_path": "models/yolo11_lego.pt"
   }
   ```

## Model Requirements

- Format: `.pt` (PyTorch YOLO model)
- Compatible with: YOLO v11 (ultralytics)
- The server will automatically detect and load it

## Current Status

- ✅ Detection server ready
- ✅ Model loading system ready
- ⏳ Waiting for trained model file

