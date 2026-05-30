const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const targetDir = 'ios/App/App/Assets.xcassets/AppIcon.appiconset';

// Mathematical Vector SVG of the Definitive HelloBrick logo
// Zero dependency, zero compression artifacts, zero random white corners!
const svgLogo = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid yellow background compliant with App Store Guidelines -->
  <rect x="0" y="0" width="1024" height="1024" fill="#FFD600" />
  
  <!-- Orange inner brick body with perfectly rounded proportions -->
  <rect x="128" y="128" width="768" height="768" rx="230" fill="#FF7A30" />
  
  <!-- Two black studs (circles) representing a classic 2x1 Lego brick -->
  <circle cx="384" cy="512" r="70" fill="#000000" />
  <circle cx="640" cy="512" r="70" fill="#000000" />
  
  <!-- Subtle gloss overlay on the top half for a premium 3D look -->
  <path d="M 128,128 L 896,128 A 230,230 0 0,1 896,512 L 128,512 A 230,230 0 0,1 128,128 Z" fill="#FFFFFF" opacity="0.08" />
</svg>
`;

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

  // Create a buffer from the clean SVG source
  const sourceBuffer = Buffer.from(svgLogo);

  // Generate App Icons
  for (const item of sizes) {
    const pixelSize = Math.floor(item.size * item.scale);
    console.log(`Generating ${item.name} (${pixelSize}x${pixelSize})...`);
    await sharp(sourceBuffer)
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
  fs.writeFileSync(path.join(targetDir, 'Contents.json'), JSON.stringify(contents, null, 2));

  // Generate Splash Screen
  const splashDir = 'ios/App/App/Assets.xcassets/Splash.imageset';
  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
  }

  const bgColor = '#FFD600';
  const splashSize = 2732;
  const logoSize = 640; // Resized for perfect visual balance on device screen

  console.log('Generating Splash Screen...');
  const logoBuffer = await sharp(sourceBuffer)
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
