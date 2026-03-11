# HelloBrick App Audit (iOS 13+ Compliance)

This document details the screen-by-screen audit of the HelloBrick app, focusing on navigation flows, safe area compliance, and production readiness.

## 1. Onboarding Flow
- **Screens**: `FeatureIntro`, `HowItWorks`, `NotificationsIntro`, `BuildingIntro`, `Subscription`.
- **Status**: Fixed.
- **Audit Results**: 
    - Layouts were using `h-screen`, causing clipping on iPhone 14/15 Pro models.
    - Updated to `100dvh` and added `safe-area-inset` padding.
    - Navigation is linear and correct.

## 2. Authentication Flow
- **Screens**: `AuthScreen`, `EmailAuthScreen`.
- **Status**: Good.
- **Audit Results**:
    - Centralized logic in `App.tsx` ensures users aren't trapped on Auth.
    - Safe areas respected.

## 3. Home Screen
- **Status**: Fixed.
- **Audit Results**:
    - "Tap to Scan" button positioned correctly for one-handed use.
    - Safe areas for top notch and home indicator added.

## 4. Live Scanner (`ScannerScreen`)
- **Status**: **CRITICAL FIX NEEDED**.
- **Issue**: Overlay drift (boxes at bottom).
- **Issue**: Stability (flickering).
- **Issue**: Data loss on capture (colors/thumbnails).
- **Fixes Planned**: Persistent tracking ID cleanup and ESM smoothing.

## 5. Capture Review (Result Phase)
- **Status**: **MAJOR UX FAILURE**.
- **Issue**: No crop images (just text/color badges).
- **Issue**: Inconsistent selection feedback.
- **Fixes Planned**: Image crop generation on freeze.

## 6. Collection Screen
- **Status**: Good.
- **Audit Results**:
    - Safe areas for scrolling and bottom nav added.
    - Persistence logic verified.

## 7. Feed Screen / Connect Screen
- **Status**: **DEAD END DETECTED**.
- **Issue**: `ConnectScreen` does not show `BottomNav` and lacks a "Back" button.
- **Fixes Planned**: Add `Screen.CONNECT` to `BottomNav` visibility in `App.tsx` and add a back button.

## 8. Navigation Policy
- Root Screens (`Home`, `Scanner`, `Collection`, `Profile`, `Feed`, `Connect`) must show `BottomNav`.
- Sub-Screens (`Settings`, `Quests`, `Puzzles`) must have a clear `ChevronLeft` back path.
