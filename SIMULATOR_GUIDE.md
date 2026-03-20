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

## 📸 Recommended App Store Screenshots (The "Winning 5")

Don't use the paywall as a main screenshot—it's better to show value. Capture these 5 screens for maximum conversion:

1.  **The Scanner (AI in Action)**: Navigate to **Scanner**. Point the camera at bricks (or use mock mode). Capture the moment the AI detects and labels parts. *Shows the core tech.*
2.  **The Vault (Your Collection)**: Navigate to **Collection**. Show a well-populated list of pieces sorted by category and color. *Shows the utility.*
3.  **Build Ideas (What to Build)**: Navigate to **Ideas**. Show the discovery screen suggesting a specific model you can build with current inventory. *Shows the outcome.*
4.  **H2H Battle (Unique Game)**: Navigate to **Multiplayer > Head-to-Head**. Capture the competitive sorting interface. *Shows the fun.*
5.  **Community Lab (Earn XP)**: Navigate to **Training** or **Feed**. Show the verification interface where users earn rewards for helping the AI. *Shows the community.*

### Best Device Targets
- **6.7" Display**: iPhone 16 Pro Max (Required)
- **6.5" Display**: iPhone 11 Pro Max / XS Max (Required)

## 💡 Pro Tips for iPhone Screenshots
- **Clean StatusBar**: In the simulator menu, go to `Features > Status Bar` and select "Clean" for a professional look.
- **Realistic Data**: I have updated the onboarding backgrounds to be realistic brick environments (wood tables, organized bins) instead of futuristic renders.
- **Save Location**: Press `Cmd + S` in the simulator. Images will appear on your **Desktop**.
