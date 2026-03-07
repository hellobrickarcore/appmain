# HelloBrick Runner Guide (Local Mobile Emulation)

To see exactly how HelloBrick looks and feels as a native app on a mobile device—without layout quirks from a standard desktop browser—you should use the "Runner".

In mobile development with Capacitor, **Runner** is simply the name of the iOS Workspace (`App.xcworkspace`) that Xcode uses to compile and run your app on a simulated device.

## Prerequisites
1. **Mac** (You are currently using macOS, which is perfect).
2. **Xcode**: Must be installed from the Mac App Store.
3. **CocoaPods**: Ensure you have CocoaPods installed (`sudo gem install cocoapods` if not).

## How to Start the Runner

Whenever you want to test the app visually:

1. **Build the Web Assets**:
   Open a terminal in the `hellobrick` folder and run:
   ```bash
   npm run build
   ```

2. **Sync with Capacitor (iOS)**:
   This copies your newly built web assets into the native iOS project wrapper.
   ```bash
   npx cap sync ios
   ```

3. **Open Xcode (The Runner)**:
   This command opens the Capacitor workspace directly in Xcode.
   ```bash
   npx cap open ios
   ```

4. **Run the Simulator**:
   - Once Xcode opens, look at the very top center of the Xcode window.
   - You will see the scheme named `App` next to a device name (e.g., `Any iOS Device`).
   - Click the device name to select a specific simulator (e.g., **iPhone 15 Pro**).
   - Click the large **Play (▶️)** button in the top left corner.

The iOS Simulator will launch, boot up iOS, and install the HelloBrick app just like a real device. It will run seamlessly, allowing you to test layouts, safe areas, and the dark-mode glassmorphism with 100% accuracy!
