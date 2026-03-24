# Documentation: Capture & Review Pipeline Fixes

## Overview
The capture pipeline and review flow have been optimized for accuracy and user feedback.

## Key Fixes
- **Holistic Scan**: The `handleCapture` flow now uses a high-resolution (1024px) holistic scan to ensure all bricks in the frame are detected with maximum precision.
- **Accurate Counts**: State transitions between scanning and results have been stabilized to prevent detector state corruption, ensuring the number of bricks shown in the results matches the detections.
- **XP Rewards**: Scanning and saving bricks now awards **10 XP per confirmed brick**. This provides immediate incentive for high-quality scans.
- **Global Error Logging**: API failures and save errors are now logged with full context, preventing "silent" failures where data is lost without user notification.

## Technical Details
- **ScannerScreen.tsx**: Refactored `handleCapture` and `handleSaveSelected` to include XP emission and better error handling.
- **xpService.ts**: Powers the reward system for building activities.
- **Supabase**: Ensures persistent storage of the user's growing brick collection.
