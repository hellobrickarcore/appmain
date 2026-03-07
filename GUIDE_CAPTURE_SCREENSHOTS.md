# Guide: Capture App Store Screenshots

## Required Screenshot Sizes

### iPhone Screenshots
- **iPhone 6.7"** (iPhone 14 Pro Max): 1290 × 2796 pixels
- **iPhone 6.5"** (iPhone 11 Pro Max): 1242 × 2688 pixels  
- **iPhone 5.5"** (iPhone 8 Plus): 1242 × 2208 pixels

### iPad Screenshots
- **iPad Pro 12.9"**: 2048 × 2732 pixels
- **iPad Pro 11"**: 1668 × 2388 pixels

## Screens to Capture

1. **Home Screen** - Shows scanner CTA and main features
2. **Scanner Screen** - Shows detection overlay with bounding boxes
3. **Collection Screen** - Shows organized bricks
4. **Quests Screen** - Shows available quests and challenges
5. **Profile Screen** - Shows user stats and achievements
6. **Feed Screen** - Shows social feed (if applicable)

## Method 1: Using iOS Simulator (Easiest)

1. **Open Xcode**
2. **Open Simulator**: Xcode > Open Developer Tool > Simulator
3. **Select Device**: Hardware > Device > iPhone 14 Pro Max (for 6.7")
4. **Run App**: 
   ```bash
   npm run build
   npx cap sync ios
   npx cap open ios
   ```
   Then click Play in Xcode
5. **Navigate to each screen**
6. **Take Screenshot**: Cmd + S (or File > New Screen Recording)
7. **Save screenshots** with descriptive names:
   - `home-iphone-6.7.png`
   - `scanner-iphone-6.7.png`
   - etc.

## Method 2: Using Physical Device

1. **Connect iPhone/iPad** to Mac
2. **Run app** on device from Xcode
3. **Navigate to each screen**
4. **Take Screenshot**: 
   - iPhone: Press Power + Volume Up simultaneously
   - iPad: Press Power + Home (or Power + Volume Up on newer models)
5. **Screenshots saved** to Photos app
6. **Transfer to Mac** via AirDrop or Photos sync
7. **Crop/Resize** if needed using Preview or image editor

## Method 3: Using Screenshot Tools

### Fastlane (Automated)
```bash
# Install fastlane
gem install fastlane

# Create Screenshotfile
fastlane snapshot init

# Run screenshots
fastlane snapshot
```

### Manual Tools
- **Sketch** - Design tool with device frames
- **Figma** - Can create device mockups
- **App Store Screenshot Generator** - Online tools

## Tips for Great Screenshots

1. **Use Real Content**: Show actual bricks, not placeholders
2. **Highlight Key Features**: Detection, organization, quests
3. **Show UI Clearly**: Ensure text is readable
4. **Consistent Style**: Same background/theme across screens
5. **No Personal Info**: Remove any personal data
6. **High Quality**: Use actual device resolution, don't upscale

## Organizing Screenshots

Create folders:
```
screenshots/
  ├── iphone-6.7/
  │   ├── 01-home.png
  │   ├── 02-scanner.png
  │   ├── 03-collection.png
  │   ├── 04-quests.png
  │   ├── 05-profile.png
  │   └── 06-feed.png
  ├── iphone-6.5/
  ├── iphone-5.5/
  ├── ipad-12.9/
  └── ipad-11/
```

## Uploading to App Store Connect

1. Go to App Store Connect > Your App > App Store tab
2. Select device size (e.g., "iPhone 6.7" Display")
3. Click "+" to add screenshots
4. Upload screenshots in order (first is shown first)
5. Repeat for all device sizes
6. Add captions if needed (optional)

## Checklist

- [ ] Home screen screenshot (all sizes)
- [ ] Scanner screen screenshot (all sizes)
- [ ] Collection screen screenshot (all sizes)
- [ ] Quests screen screenshot (all sizes)
- [ ] Profile screen screenshot (all sizes)
- [ ] Feed screen screenshot (all sizes)
- [ ] Screenshots organized by device size
- [ ] Screenshots uploaded to App Store Connect




