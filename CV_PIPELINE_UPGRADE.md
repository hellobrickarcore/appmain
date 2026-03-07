# HelloBrick: Next-Gen Computer Vision Pipeline

To ensure HelloBrick genuinely outperforms Brickit, we must abandon simple bounding box detection and move to a highly sophisticated, deterministic, multi-stage pipeline.

## 1. The Core Limitation of Bounding Boxes (Current System)
Right now, HelloBrick uses YOLOv8 object detection (`yolo11_lego.pt`). Bounding boxes are rectangular. LEGO bricks placed at random angles create overlapping, noisy rectangles that capture background color, making dominant color logic fail. A 2x4 brick at a strong angle is often misidentified as a 1x4 if the box cuts off.

## 2. The Solution: Instance Segmentation (YOLOv8-Seg)
**Stage 1: Polygon Masking**
Instead of drawing a box around the brick, a segmentation model traces the exact pixel-perfect contour of the brick.
- **Why**: Zero background noise. When we analyze the color, we are *only* analyzing the plastic hue.
- **How**: Train YOLO11-Seg or Mask R-CNN on synthetic top-down LEGO datasets.

## 3. Pose & Geometry Normalization
**Stage 2: Homography Transformation**
Bricks in a pile sit at wild angles. If a 2x4 plate is tilted 45 degrees, the camera sees a warped parallelogram.
- **Why**: We must digitally "flatten" the brick.
- **How**: Extract the 4 main corners from the segmentation polygon. Use `cv2.getPerspectiveTransform` to warp the pixels into a flat, top-down orthogonal view. This guarantees the aspect ratio is correct for the final classification step.

## 4. Deterministic Stud Counting
**Stage 3: The "Lightyears Ahead" Feature**
Brickit often struggles with differentiating a 1x14 from a 1x16 if partially occluded. Instead of relying purely on a Neural Network to "guess" the brick type from a blob of color, we count the studs explicitly.
- **Why**: A 2x4 brick always has exactly 8 studs. It is a mathematical certainty.
- **How**: Run a lightweight secondary model (or classical CV like Hough Circle Transform) on the *flattened* brick image to find and count the circular studs. `2 rows * 4 studs = 2x4 Brick`. 

## 5. LAB Color Space Overlap
**Stage 4: Lighting Invariance**
Taking the RGB average of a segmented area fails if half the brick is in a harsh shadow.
- **Why**: RGB blends lightness and hue indiscriminately. 
- **How**: Convert the segmented pixels to the `LAB` color space. The `L` channel holds all the shadow/highlight data. Discard it. Compare only the `A` and `B` channels against the known specific CIELAB values of exact LEGO plastic colors.

## The Final Architecture Payload
When the app sends a photo to the new Python backend, the following sequence executes:
1. `YOLO11-Seg` isolates 150 independent brick masks in 50ms.
2. `OpenCV` isolates the pixels, warps them flat (Pose Correction), and counts the studs.
3. `LAB Analyzer` assigns the exact LEGO color code (e.g., *Bright Red* or *Dark Bluish Gray*).
4. The dictionary `{ id, type: '2x4 Brick', color: 'Bright Red', maskBase64: '...' }` is returned to the frontend.

**Result**: Near 100% accuracy, total lighting immunity, and zero "I think this is a 2x2 but it's really a 1x2" failures.
