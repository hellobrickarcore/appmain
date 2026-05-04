import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist/index.html');

if (!fs.existsSync(distPath)) {
  console.error('❌ ERROR: dist/index.html NOT FOUND. Build failed to generate output.');
  process.exit(1);
}

const content = fs.readFileSync(distPath, 'utf8');

if (content.includes('src="/src/main.tsx"') || content.includes('src="./src/main.tsx"')) {
  console.error('❌ CRITICAL ERROR: Production build contains development source paths (/src/main.tsx).');
  console.error('This will cause a BLANK SCREEN in production due to MIME type checking.');
  console.error('Check your vite.config.ts and ensure the build process is transforming the HTML correctly.');
  process.exit(1);
}

console.log('✅ BUILD VERIFIED: index.html is production-ready.');
process.exit(0);
