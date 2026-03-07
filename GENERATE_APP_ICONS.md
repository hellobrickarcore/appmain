# Generate App Icons for iOS

## Required Icon Sizes

You need to generate all these sizes from a 1024x1024 source image (the new logo design):

### iPhone Icons:
- 20x20 @2x = 40x40
- 20x20 @3x = 60x60
- 29x29 @2x = 58x58
- 29x29 @3x = 87x87
- 40x40 @2x = 80x80
- 40x40 @3x = 120x120
- 60x60 @2x = 120x120
- 60x60 @3x = 180x180

### iPad Icons:
- 20x20 @1x = 20x20
- 20x20 @2x = 40x40
- 29x29 @1x = 29x29
- 29x29 @2x = 58x58
- 40x40 @1x = 40x40
- 40x40 @2x = 80x80
- 76x76 @1x = 76x76
- 76x76 @2x = 152x152
- 83.5x83.5 @2x = 167x167

### App Store:
- 1024x1024 (marketing icon)

## Quick Method (Using ImageMagick or Online Tool)

### Option 1: Using ImageMagick (if installed)
```bash
cd /Users/akeemojuko/Downloads/hellobrick/ios/App/App/Assets.xcassets/AppIcon.appiconset

# Create source image first (1024x1024 PNG with new logo design)
# Then generate all sizes:

# iPhone
convert source-1024.png -resize 40x40 AppIcon-20@2x.png
convert source-1024.png -resize 60x60 AppIcon-20@3x.png
convert source-1024.png -resize 58x58 AppIcon-29@2x.png
convert source-1024.png -resize 87x87 AppIcon-29@3x.png
convert source-1024.png -resize 80x80 AppIcon-40@2x.png
convert source-1024.png -resize 120x120 AppIcon-40@3x.png
convert source-1024.png -resize 120x120 AppIcon-60@2x.png
convert source-1024.png -resize 180x180 AppIcon-60@3x.png

# iPad
convert source-1024.png -resize 20x20 AppIcon-20@1x.png
convert source-1024.png -resize 40x40 AppIcon-20@2x-ipad.png
convert source-1024.png -resize 29x29 AppIcon-29@1x.png
convert source-1024.png -resize 58x58 AppIcon-29@2x-ipad.png
convert source-1024.png -resize 40x40 AppIcon-40@1x.png
convert source-1024.png -resize 80x80 AppIcon-40@2x-ipad.png
convert source-1024.png -resize 76x76 AppIcon-76@1x.png
convert source-1024.png -resize 152x152 AppIcon-76@2x.png
convert source-1024.png -resize 167x167 AppIcon-83.5@2x.png

# App Store
cp source-1024.png AppIcon-1024.png
```

### Option 2: Using Online Tool
1. Go to https://www.appicon.co/ or https://appicon.build/
2. Upload your 1024x1024 source image
3. Download the generated icon set
4. Extract and copy all PNG files to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Option 3: Using Xcode (Easiest)
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select `App` target > `General` tab
3. Under `App Icons and Launch Screen`, click on the AppIcon asset
4. Drag your 1024x1024 source image into the appropriate slots
5. Xcode will automatically generate all required sizes

## Logo Design Specifications

Based on the new logo design:
- **Outer square**: Yellow (#FFD600), rounded corners (26px for 1024x1024)
- **Inner square**: Orange (#F97316), rounded corners (12px for 1024x1024)
- **Two black squares**: 1.5x1.5px each (scaled proportionally)
- **Background**: Transparent or white

## Current Status

- ✅ Contents.json updated with all required sizes
- ⚠️ Need to generate actual PNG files from 1024x1024 source
- ⚠️ Current: Only AppIcon-512@2x.png exists (needs to be renamed/regenerated)

## Next Steps

1. Create 1024x1024 source image with new logo design
2. Generate all icon sizes using one of the methods above
3. Place all PNG files in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
4. Verify in Xcode that all icons are properly assigned




