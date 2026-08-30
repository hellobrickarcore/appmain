const fs = require('fs');
let code = fs.readFileSync('src/lib/collectiblesDatabase.ts', 'utf8');

// Replace Pokemon URLs
code = code.replace(/https:\/\/images\.pokemontcg\.io[^'"]+/g, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png');

// Replace Lego URLs
code = code.replace(/https:\/\/images\.brickset\.com[^'"]+/g, 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop');

// Replace MTG URLs
code = code.replace(/https:\/\/cards\.scryfall\.io[^'"]+/g, 'https://images.unsplash.com/photo-1606166325683-e6deb6979b0c?q=80&w=400&auto=format&fit=crop');

// Replace Yugioh URLs
code = code.replace(/https:\/\/images\.ygoprodeck\.com[^'"]+/g, 'https://images.unsplash.com/photo-1620336655055-088d06e36bf0?q=80&w=400&auto=format&fit=crop');

fs.writeFileSync('src/lib/collectiblesDatabase.ts', code);
console.log('Database images patched.');
