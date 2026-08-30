const fs = require('fs');
let code = fs.readFileSync('src/screens/ScannerScreen.tsx', 'utf8');

code = code.replace(/<div className="w-12 h-12 bg-white\/90 rounded-xl p-1 flex items-center justify-center overflow-hidden">/g, `<div className="w-14 h-14 bg-white/90 rounded-xl p-1 flex items-center justify-center overflow-hidden mb-1">`);
code = code.replace(/<span className="text-\[10px\] font-black text-emerald-400 mt-1">/g, `<span className="text-[10px] font-bold text-white text-center leading-tight line-clamp-2 w-full max-w-[80px] mb-0.5">{item.name}</span>
                  <span className="text-[11px] font-black text-emerald-400">`);

fs.writeFileSync('src/screens/ScannerScreen.tsx', code);
