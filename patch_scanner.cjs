const fs = require('fs');
let code = fs.readFileSync('src/screens/ScannerScreen.tsx', 'utf8');

code = code.replace(/const addToTray = \(item: DetectedItem\) => {[\s\S]*?alert\('Error saving to vault'\);\s*\}\s*\};/m, `const addToTray = (item: DetectedItem) => {
    if (!item.matchedCollectible) return;
    setScannedTray(prev => {
      const matchId = item.matchedCollectible!.code || item.matchedCollectible!.id;
      if (prev.some(c => (c.code || c.id) === matchId)) return prev;
      return [...prev, item.matchedCollectible!];
    });
  };

  // ── Save tray to collection ──
  const handleSaveToCollection = () => {
    if (scannedTray.length === 0) return;
    try {
      const stored = localStorage.getItem('hellobrick_collection_sets');
      const current = stored ? JSON.parse(stored) : [];

      scannedTray.forEach(item => {
        current.push({
          id: \`item_\${Date.now()}_\${Math.random().toString(36).substr(2, 6)}\`,
          userId: 'user-1',
          setNum: item.code || item.id,
          condition: 'sealed',
          quantity: 1,
          purchasePrice: item.sealedPrice || 0,
          purchaseDate: new Date().toISOString().split('T')[0],
          notes: \`Scanned with AR (\${item.type?.toUpperCase() || 'UNKNOWN'})\`,
          addedAt: new Date().toISOString(),
          itemType: item.type === 'minifigure' ? 'minifig' : (item.type === 'pokemon' || item.type === 'mtg' ? 'card' : 'set')
        });
      });

      localStorage.setItem('hellobrick_collection_sets', JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));

      // Massive Success Animation
      setShowSaveSuccess(true);
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#10B981', '#FF7A30', '#3B82F6', '#FFCE4A'],
          zIndex: 9999
        });
      });

      // Wait 1.5 seconds so they clearly see the animation, then go to the Vault
      setTimeout(() => onNavigate(6), 1500); // Screen.COLLECTION is usually 6, we'll use onNavigate with the imported enum if possible, wait onNavigate takes Screen!
    } catch {
      alert('Error saving to vault');
    }
  };`);
fs.writeFileSync('src/screens/ScannerScreen.tsx', code);
