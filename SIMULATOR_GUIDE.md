# 📱 HelloBrick Simulator & Screenshot Guide

Follow these steps to launch the app in the iOS simulator and capture high-quality screenshots for the App Store.

## 🛠 Prerequisites
- **Xcode** installed on your Mac.
- **Node.js** and **npm** installed.
- Ensure you are in the project root: `/Users/akeemojuko/.gemini/antigravity/scratch/hellobrick`

## 🚀 Launching the Simulator

Run these commands in your terminal:

1. **Build the web assets:**
   ```bash
   npm run build
   ```

2. **Sync with Capacitor:**
   ```bash
   npx cap sync ios
   ```

3. **Open Xcode:**
   ```bash
   npx cap open ios
   ```

4. **In Xcode:**
   - Select a simulator from the top toolbar (e.g., **iPhone 15 Pro Max** for the 6.7" screenshots).
   - Press the **Play (Run)** button or `Cmd + R`.

## 📸 Capturing Screenshots

Once the app is running in the simulator:

1. **Navigate** to the screen you want to capture.
2. **Take Screenshot**: Press `Cmd + S` in the simulator.
3. **Where are they?**: Screenshots are saved to your **Desktop** by default.

### Required Screenshot Sizes for App Store:
- **6.5" Display** (e.g., iPhone 11 Pro Max, XS Max)
- **6.7" Display** (e.g., iPhone 15 Pro Max, 14 Pro Max)
- **5.5" Display** (Optional, for older iPhones)

## 💡 Tips for Great Screenshots
- **Clean StatusBar**: In the simulator menu, go to `Features > Status Bar` to clean up the time and battery for a professional look.
- **Dark Mode**: If the app supports it, ensure it's toggled consistently.
- **Real Data**: If you need real bricks in the scan, you can drag and drop images/videos into the simulator to "simulate" a camera feed if the plugin supports it, or use the Mock mode I've enabled.
