const fs = require('fs');
let code = fs.readFileSync('src/screens/ScannerScreen.tsx', 'utf8');
code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\};\s*$/, `        </div>
      </div>

      {showSaveSuccess && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_50px_rgba(16,185,129,0.5)]">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-black text-white">Added to Vault!</h2>
          <p className="text-emerald-400 font-medium mt-2">Redirecting to your collection...</p>
        </div>
      )}

    </div>
  );
};
`);
fs.writeFileSync('src/screens/ScannerScreen.tsx', code);
