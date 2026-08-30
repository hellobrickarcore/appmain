const fs = require('fs');
const glob = require('glob'); // Not available? I'll just use fs
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('src/screens');
files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  let original = code;
  // Replace string literals
  code = code.replace(/'https:\/\/images\.brickset\.com[^']*'/g, "'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop'");
  // Replace template literals
  code = code.replace(/`https:\/\/images\.brickset\.com[^`]*`/g, "'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop'");
  
  if (code !== original) {
    fs.writeFileSync(f, code);
    console.log('Patched', f);
  }
});
