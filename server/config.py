# 🔒 HELLOBRICK STABILITY LOCK
# These parameters are 'Golden' and should not be changed without a manual verification pass.

STABILITY_CONFIG = {
    "model_path": "models/yolo11_lego.pt",  # Relative to server/ directory
    "imgsz": 960,                           # Increased for high-density recall
    "conf_floor": 0.15,                     # Lowered to match frontend rendering threshold
    "iou_threshold": 0.35,  
    "color_sampling_erosion_kernel": 5,
    "center_weight_factor": 0.4
}
