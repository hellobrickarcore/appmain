const fs = require('fs');
let code = fs.readFileSync('src/screens/SetDetailScreen.tsx', 'utf8');

code = code.replace(/const item: AnyCollectible = useMemo\(\(\) =>\s*collectiblesDatabase\.findById\(activeCode\) \|\| collectiblesDatabase\.getSets\(\)\[0\],\s*\[activeCode\]\s*\);/m, `const item: AnyCollectible = useMemo(() => {
    const dbMatch = collectiblesDatabase.findById(activeCode);
    if (dbMatch) return dbMatch;
    
    try {
      const stored = localStorage.getItem('hellobrick_collection_sets');
      if (stored) {
         const collection = JSON.parse(stored);
         const custom = collection.find(c => c.setNum === activeCode || c.id === activeCode);
         if (custom) {
            return {
               id: custom.id,
               code: custom.setNum,
               name: custom.name || 'Custom Item',
               theme: custom.itemType === 'card' ? 'TCG' : 'Custom',
               year: 2024,
               pieces: 1,
               minifigs: 0,
               retailPrice: custom.purchasePrice || 0,
               imageUrl: custom.imageUrl || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop',
               type: custom.itemType === 'card' ? 'pokemon' : 'set'
            } as any;
         }
      }
    } catch (e) {}

    return collectiblesDatabase.getSets()[0];
  }, [activeCode]);`);

fs.writeFileSync('src/screens/SetDetailScreen.tsx', code);
