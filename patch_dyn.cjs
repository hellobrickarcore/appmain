const fs = require('fs');
let code = fs.readFileSync('src/screens/ScannerScreen.tsx', 'utf8');

code = code.replace(/name: bestMatch\.replace\(\/\(pokemon\|card\|tcg\|magic\|gathering\|lego\)\/gi, ''\)\.trim\(\) \|\| 'Unknown Item',/g, `name: (bestMatch.replace(/(pokemon|card|tcg|magic|gathering|lego)/gi, '').trim() || 'Unknown Item') + (entities.length > 1 ? \` (\${entities.slice(1, 3).join(' ')})\` : ''),`);

fs.writeFileSync('src/screens/ScannerScreen.tsx', code);
