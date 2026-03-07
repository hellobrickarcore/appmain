# Detection Enhancement Suggestions

## Current Architecture
- **Layer 1 (Gemini)**: Fast initial detection for real-time UI feedback
- **Layer 2 (YOLOv8)**: Verification and refinement for accuracy
- **Consensus System**: Accumulates detections over time, uses majority voting

## Additional Data Sources to Enhance Detection

### 1. **User Feedback Loop**
- **What**: Track user corrections when they edit detected brick labels/colors
- **How**: When user changes a detection in post-capture UI, log the correction
- **Impact**: Creates labeled training data automatically
- **Implementation**: Add correction tracking in `ScannerScreen.tsx` post-capture selection

### 2. **Historical Detection Patterns**
- **What**: Learn from user's past scans - if they frequently scan certain brick types
- **How**: Build a user-specific model that weights common bricks higher
- **Impact**: Personalizes detection for each user's collection
- **Implementation**: Store user scan history, weight detections by frequency

### 3. **Context from Collection**
- **What**: Use user's existing collection to inform detection
- **How**: If user has 50 red 2x4 bricks, prioritize that detection
- **Impact**: Reduces false positives for bricks user doesn't own
- **Implementation**: Query collection API during detection, boost confidence for known bricks

### 4. **Environmental Context**
- **What**: Use device sensors (lighting, angle, distance)
- **How**: Accelerometer for angle, ambient light sensor for lighting conditions
- **Impact**: Adjusts detection thresholds based on environment
- **Implementation**: Access device sensors, pass to detection service

### 5. **Multi-Frame Temporal Analysis**
- **What**: Analyze multiple frames together (already partially implemented)
- **How**: Use optical flow to track brick movement, stabilize across frames
- **Impact**: Better handling of moving bricks, reduces flickering
- **Implementation**: Enhance current consensus system with motion tracking

### 6. **Color Calibration**
- **What**: Calibrate color detection using known reference colors
- **How**: Show user a color calibration screen with reference bricks
- **Impact**: More accurate color detection across different lighting
- **Implementation**: Store color calibration profile per device/user

### 7. **Part Number Database Lookup**
- **What**: Cross-reference detected part numbers with Bricklink/LEGO database
- **How**: Validate part numbers exist, get official dimensions/colors
- **Impact**: Filters impossible detections (e.g., part number that doesn't exist)
- **Implementation**: API integration with Bricklink or local part database

### 8. **3D Shape Analysis**
- **What**: Use depth estimation or stereo vision to understand brick dimensions
- **How**: Analyze shadows, perspective, relative sizes
- **Impact**: Better dimension detection (2x4 vs 2x2)
- **Implementation**: Add depth estimation model or use camera focus data

### 9. **User Verification Queue**
- **What**: Flag low-confidence detections for user verification
- **How**: When confidence < 70%, add to training queue automatically
- **Impact**: Continuously improves model with edge cases
- **Implementation**: Already partially implemented in training queue system

### 10. **Ensemble Voting**
- **What**: Run multiple detection models and vote on results
- **How**: Use Gemini + YOLOv8 + custom trained model, majority vote
- **Impact**: Reduces errors by combining strengths of multiple models
- **Implementation**: Add third detection model, implement voting logic

### 11. **Brick Relationship Context**
- **What**: Understand how bricks connect (studs, connections)
- **How**: Detect connection patterns, validate physical constraints
- **Impact**: Filters impossible configurations
- **Implementation**: Add connection detection model or rule-based validation

### 12. **Scale Reference Detection**
- **What**: Detect known objects (minifig, hand) for scale reference
- **How**: If minifig detected, use it to calibrate brick sizes
- **Impact**: More accurate dimension detection
- **Implementation**: Add minifig detection, use as scale reference

## Recommended Priority Implementation Order

1. **User Feedback Loop** (High Impact, Easy) - Already have infrastructure
2. **Context from Collection** (High Impact, Medium) - Use existing collection API
3. **Multi-Frame Temporal Analysis** (Medium Impact, Medium) - Enhance existing system
4. **Part Number Database Lookup** (High Impact, Hard) - Requires external API
5. **Color Calibration** (Medium Impact, Easy) - Simple calibration screen
6. **Ensemble Voting** (High Impact, Hard) - Requires additional model training

## Current Improvements Made

- ✅ Always use YOLOv8 verification (no random skipping)
- ✅ Consensus system with weighted averaging
- ✅ Majority voting for labels, colors, part numbers
- ✅ Confidence boosting based on consensus count
- ✅ Temporal stability (only show detections seen multiple times)




