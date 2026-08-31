const fs = require('fs');
const path = require('path');

const dir = 'src/screens';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let code = fs.readFileSync(filePath, 'utf8');
  let newCode = code.replace(/min-h-screen/g, 'h-full');
  
  // also standardise the pb-32 to pb-28 if we want, or just ensure it has pb-
  // Actually pb-32 is fine (8rem), pb-28 is 7rem. Both clear the nav bar.
  
  if (code !== newCode) {
    fs.writeFileSync(filePath, newCode);
    console.log('Fixed min-h-screen in', f);
  }
});
