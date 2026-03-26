# Stud Count & Dimension Inference

HelloBrick uses geometric analysis of the brick's top surface to infer dimensions, moving beyond simple class labels.

## Logic Flow

1. **Top Surface Segmentation**: Extract the top face of the brick candidate.
2. **Stud Detection**: Use blob detection to find circular studs.
3. **Grid Alignment**: Fit the detected studs into a grid.
4. **Dimension Calculation**:
    - Count rows of studs.
    - Count columns of studs.
    - Result: `Rows x Cols` (e.g., 2x4).

## Confidence Channels
- `dimensionsConfidence`: How well the detected studs fit a standard LEGO grid.
- `studPatternConfidence`: The clarity and regularity of the stud blobs.

## Fallback
If stud counting is ambiguous (e.g., extreme angle or blur), the system falls back to the YOLO class label with a reduced `dimensionsConfidence` score.
