import React, { useState, useMemo } from 'react';
import { Screen, CollectionItem, WishlistItem } from '../types';
import { Search, Plus, Heart, ChevronDown, Check, Box, Smile, Sparkles, Trophy, Flame, ArrowUpRight, Layers, Shield } from 'lucide-react';
import { collectiblesDatabase, AnyCollectible, CollectibleCategory } from '../lib/collectiblesDatabase';

interface BrowseScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

const CATEGORIES: { id: CollectibleCategory | 'all'; label: string; icon: any }[] = [
  { id: 'all', label: 'All Catalog', icon: Sparkles },
  { id: 'pokemon', label: 'Pokémon TCG', icon: Flame },
  { id: 'set', label: 'LEGO Sets', icon: Box },
  { id: 'minifigure', label: 'Minifigs', icon: Smile },
  { id: 'mtg', label: 'Magic MTG', icon: Flame },
  { id: 'yugioh', label: 'Yu-Gi-Oh!', icon: Shield },
  { id: 'one_piece', label: 'One Piece', icon: Shield },
  { id: 'lorcana', label: 'Lorcana', icon: Sparkles },
  { id: 'sports', label: 'Sports Cards', icon: Trophy },
  { id: 'moc', label: 'MOC Builds', icon: Sparkles },
];

export const BrowseScreen: React.FC<BrowseScreenProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CollectibleCategory | 'all'>('all');
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({});

  const expansionSets = collectiblesDatabase.getExpansionSets();

  const filteredItems = useMemo(() => {
    let result = collectiblesDatabase.search(searchQuery, selectedCategory);
    result.sort((a, b) => {
      const priceA = a.psa10Value ? a.psa10Value : a.sealedPrice;
      const priceB = b.psa10Value ? b.psa10Value : b.sealedPrice;
      return priceB - priceA;
    });
    return result;
  }, [searchQuery, selectedCategory]);

  const handleAddToCollection = (item: AnyCollectible, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('hellobrick_collection_sets');
      const current: CollectionItem[] = stored ? JSON.parse(stored) : [];

      current.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: 'user-1',
        setNum: item.code,
        condition: 'sealed',
        quantity: 1,
        purchasePrice: item.sealedPrice,
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: `Added from Catalog`,
        addedAt: new Date().toISOString(),
        itemType: item.category === 'minifigure' ? 'minifig' : (item.category === 'set' ? 'set' : 'brick')
      });

      localStorage.setItem('hellobrick_collection_sets', JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
      setAddedMap(prev => ({ ...prev, [item.code]: true }));
    } catch (err) {}
  };

  const handleToggleWishlist = (item: AnyCollectible, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('hellobrick_wishlist_sets');
      let current: WishlistItem[] = stored ? JSON.parse(stored) : [];

      if (wishlistMap[item.code]) {
        current = current.filter(w => w.setNum !== item.code);
        setWishlistMap(prev => ({ ...prev, [item.code]: false }));
      } else {
        current.push({
          id: `wish_${Date.now()}`,
          userId: 'user-1',
          setNum: item.code,
          targetPrice: item.sealedPrice * 0.9,
          alertEnabled: true,
          addedAt: new Date().toISOString(),
          itemType: item.category === 'minifigure' ? 'minifig' : 'set'
        });
        setWishlistMap(prev => ({ ...prev, [item.code]: true }));
      }

      localStorage.setItem('hellobrick_wishlist_sets', JSON.stringify(current));
    } catch (err) {}
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans text-gray-900 overflow-y-auto pb-32 select-none">
      
      {/* ─── Top Sticky Header ─── */}
      <div className="px-5 pt-[max(env(safe-area-inset-top),2.5rem)] pb-3 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-xl z-20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase">EXPLORE CATALOG</span>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Universal Database</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200/80 shadow-sm flex items-center gap-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sets, minifigs, Pokémon, MTG, TCG..."
            className="w-full text-xs font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="px-5 space-y-5 mt-2">
        
        {/* ─── 1. Expansion Sets & Master Binders Section (Matching Slide 4) ─── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Master Expansion Binders
            </h3>
            <span className="text-[11px] font-bold text-gray-400">View All</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
            {expansionSets.map(set => (
              <div
                key={set.id}
                onClick={() => onNavigate(Screen.SET_BINDER, { setId: set.id })}
                className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-sm min-w-[200px] flex flex-col justify-between shrink-0 cursor-pointer active:scale-95 transition-all hover:border-emerald-400"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    {set.series}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{set.totalCards} cards</span>
                </div>

                <h4 className="text-sm font-black text-gray-900 leading-snug">{set.name}</h4>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400">Total Value</span>
                  <span className="text-xs font-black text-emerald-600">${set.totalValue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 2. Category Filter Pills ─── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── 3. Collectibles Results List ─── */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isAdded = !!addedMap[item.code];
            const isWished = !!wishlistMap[item.code];
            const price = item.psa10Value ? item.psa10Value : item.sealedPrice;

            return (
              <div
                key={item.id}
                onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: item.code })}
                className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-sm flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer hover:border-gray-300"
              >
                <div className="w-16 h-16 bg-[#F5F5F7] rounded-xl p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.brickset.com/sets/images/75192-1.jpg';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                      {item.theme}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">#{item.code}</span>
                  </div>
                  <h3 className="text-xs font-black text-gray-900 truncate leading-snug">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-emerald-600">${price.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-emerald-500">+{item.growth1Y}% 1Y</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => handleToggleWishlist(item, e)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                      isWished ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" fill={isWished ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    onClick={(e) => handleAddToCollection(item, e)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                      isAdded ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
