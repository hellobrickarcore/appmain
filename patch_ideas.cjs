const fs = require('fs');
let code = fs.readFileSync('src/screens/IdeasScreen.tsx', 'utf8');

code = code.replace(/<div className=\{`relative group rounded-2xl overflow-hidden bg-white border border-gray-200\/80 shadow-sm transition-all duration-300 hover:shadow-md \$\{compact \? 'flex flex-row' : 'flex flex-col'\}`\}>/g, `<div 
      onClick={() => alert(\`MOC Instructions for \${idea.name} are unlocked in the Premium Tier!\`)}
      className={\`relative group rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer \${compact ? 'flex flex-row' : 'flex flex-col'}\`}>`);

fs.writeFileSync('src/screens/IdeasScreen.tsx', code);
