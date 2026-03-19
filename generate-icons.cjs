
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const source = 'icon-source-1024.png';
const targetDir = 'ios/App/App/Assets.xcassets/AppIcon.appiconset';

const sizes = [
  { size: 20, scale: 2, name: 'icon-20-2x.png' },
  { size: 20, scale: 3, name: 'icon-20-3x.png' },
  { size: 29, scale: 1, name: 'icon-29.png' },
  { size: 29, scale: 2, name: 'icon-29-2x.png' },
  { size: 29, scale: 3, name: 'icon-29-3x.png' },
  { size: 40, scale: 2, name: 'icon-40-2x.png' },
  { size: 40, scale: 3, name: 'icon-40-3x.png' },
  { size: 60, scale: 2, name: 'icon-60-2x.png' },
  { size: 60, scale: 3, name: 'icon-60-3x.png' },
  { size: 76, scale: 1, name: 'icon-76.png' },
  { size: 76, scale: 2, name: 'icon-76-2x.png' },
  { size: 83.5, scale: 2, name: 'icon-83.5-2x.png' },
  { size: 1024, scale: 1, name: 'icon-1024.png' }
];

async function generate() {
  if (!fs.existsSync(targetDir)) {
    console.log('Target directory not found, creating...');
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const item of sizes) {
    const pixelSize = Math.floor(item.size * item.scale);
    console.log(`Generating ${item.name} (${pixelSize}x${pixelSize})...`);
    await sharp(source)
      .resize(pixelSize, pixelSize)
      .toFile(path.join(targetDir, item.name));
  }

  // Update Contents.json
  const contents = {
    images: sizes.map(item => ({
      size: `${item.size}x${item.size}`,
      idiom: item.size === 1024 ? 'ios-marketing' : (item.size === 76 || item.size === 83.5 ? 'ipad' : 'iphone'),
      filename: item.name,
      scale: `${item.scale}x`
    })),
    info: { version: 1, author: 'xcode' }
  };
  
  // Refine for universal/iPad specificity if needed, but the above is a good start
  // Generate Splash Screen
  const splashDir = 'ios/App/App/Assets.xcassets/Splash.imageset';
  const bgColor = '#FFD600';
  const splashSize = 2732;
  const logoSize = 1024; // Size of logo in center

  console.log('Generating Splash Screen...');
  const logoBuffer = await sharp(source)
    .resize(logoSize, logoSize)
    .toBuffer();

  const splash = sharp({
    create: {
      width: splashSize,
      height: splashSize,
      channels: 4,
      background: bgColor
    }
  })
  .composite([{ input: logoBuffer, gravity: 'center' }])
  .png();

  await splash.toFile(path.join(splashDir, 'splash-2732x2732.png'));
  await splash.toFile(path.join(splashDir, 'splash-2732x2732-1.png'));
  await splash.toFile(path.join(splashDir, 'splash-2732x2732-2.png'));

  console.log('Done!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
