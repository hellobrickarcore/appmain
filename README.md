# HelloBrick - LEGO Brick Scanner & Organizer

A gamified LEGO brick detection app using **YOLO v11** and **SAM3** for accurate brick identification and segmentation.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Build for Production

```bash
npm run build
```

## 📱 Mobile Setup

### Automated Setup (Recommended)

```bash
npm run setup:mobile
```

This will:
- Install all Capacitor dependencies
- Initialize Capacitor
- Build the web app
- Add iOS and Android platforms
- Configure permissions automatically

### Manual Setup

See `SETUP_GUIDE.md` for detailed instructions.

### Open in Native IDEs

```bash
# iOS
npm run mobile:ios

# Android
npm run mobile:android
```

## 🎮 Features

- **Brick Detection**: YOLO v11 for accurate brick identification
- **Segmentation**: SAM3 for precise brick isolation
- **Gamification**: XP, levels, streaks, badges, and quests
- **Quest System**: Find the Brick, Sorting Challenge, Color Hunt
- **Duolingo-inspired UI**: Soft pastels, smooth animations, friendly mascot

## 🧱 Brick Detection

Currently uses **mock detection** for development. To enable real detection:

1. Convert YOLO v11 to ONNX format
2. Convert SAM3 to ONNX format
3. Place models in `public/models/`:
   - `public/models/yolo11n.onnx`
   - `public/models/sam3.onnx`

See `HELLOBRICK_SETUP.md` for detailed model setup instructions.

## 📁 Project Structure

```
hellobrick/
├── src/
│   ├── pages/
│   │   └── HelloBrickPage.tsx    # Main app component
│   ├── services/
│   │   ├── brickDetectionService.ts  # YOLO v11 + SAM3
│   │   ├── gamificationService.ts    # XP, quests, progress
│   │   └── cameraService.ts          # Camera access
│   ├── types.ts                      # TypeScript types
│   ├── App.tsx                       # Router setup
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles
├── public/
│   └── models/                       # ML models (add here)
├── capacitor.config.ts               # Capacitor config
├── package.json
└── vite.config.ts
```

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Capacitor** - Mobile framework
- **ONNX Runtime Web** - ML model inference
- **YOLO v11** - Object detection
- **SAM3** - Image segmentation

## 📝 Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run setup:mobile` - Automated mobile setup
- `npm run mobile:sync` - Sync web app to native projects
- `npm run mobile:ios` - Open in Xcode
- `npm run mobile:android` - Open in Android Studio

## 🎨 Design System

**Colors:**
- Primary Yellow: `#FFCE4A`
- Soft Blue: `#7AC7FF`
- Pink Blush: `#FF9AA2`
- Mint Green: `#C9F2A6`

**Border Radius:** 16-28px
**Fonts:** Poppins (headers), Nunito (body)

## 📚 Documentation

- `SETUP_GUIDE.md` - Complete setup instructions
- `HELLOBRICK_SETUP.md` - ML model setup guide
- `MOBILE_SETUP.md` - Mobile deployment guide
- `HARBOR.md` - **Comprehensive Guide to Harbor AI Infrastructure & Tokenomics**

## 🐛 Troubleshooting

**Camera not working?**
- Check browser/device permissions
- Verify `Info.plist` (iOS) or `AndroidManifest.xml` (Android) has camera permissions

**Build errors?**
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors: `npm run build`

**Models not loading?**
- Ensure models are in `public/models/` directory
- Check browser console for errors
- Verify ONNX Runtime Web is installed

## 📄 License

This project uses:
- YOLO v11 (AGPL-3.0) from Ultralytics
- SAM3 (Apache 2.0) from Meta AI
- ONNX Runtime Web (MIT) from Microsoft

---

**Built with ❤️ for LEGO enthusiasts**

