import React, { useState, useMemo } from 'react';
import { Screen, CollectionItem, WishlistItem } from '../types';
import { Search, Plus, Heart, ChevronDown, Check, Box, Smile, Sparkles, Trophy, Flame, ArrowUpRight } from 'lucide-react';
import { legoDatabase, AnyCollectible, CollectibleCategory } from '../lib/legoDatabase';

interface BrowseScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

const CATEGORIES: { id: CollectibleCategory | 'all'; label: string; icon: any }[] = [
  { id: 'all', label: 'All Catalog', icon: Sparkles },
  { id: 'set', label: 'Sets & Boxes', icon: Box },
  { id: 'minifigure', label: 'Minifigs', icon: Smile },
  { id: 'pokemon', label: 'Pokémon TCG', icon: Flame },
  { id: 'sports', label: 'Sports Cards', icon: Trophy },
  { id: 'other_tcg', label: 'Other TCG', icon: Flame },
  { id: 'moc', label: 'MOC Builds', icon: Sparkles },
];

const THEMES = ['All', 'Star Wars', 'Pokémon Base Set', 'Evolving Skies', 'Basketball Cards', 'Icons', 'Marvel', 'Ideas', 'Harry Potter', 'Technic', 'Creator Expert', 'Ninjago', 'Architecture', 'Space'];

const SORT_OPTIONS = [
  { label: 'Highest Value', value: 'price_desc' },
  { label: 'Top 1Y Growth', value: 'growth_desc' },
  { label: 'Lowest Value', value: 'price_asc' },
  { label: 'Release Year (Newest)', value: 'recent' },
  { label: 'Alphabetical', value: 'alpha' },
];

export const BrowseScreen: React.FC<BrowseScreenProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CollectibleCategory | 'all'>('all');
  const [selectedTheme, setSelectedTheme] = useState('All');
  const [sortBy, setSortBy] = useState('price_desc');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({});

  const filteredItems = useMemo(() => {
    let result = legoDatabase.search(searchQuery, selectedCategory);

    if (selectedTheme !== 'All') {
      result = result.filter(item => item.theme.toLowerCase() === selectedTheme.toLowerCase());
    }

    result.sort((a, b) => {
      const priceA = a.psa10Value ? a.psa10Value : a.sealedPrice;
      const priceB = b.psa10Value ? b.psa10Value : b.sealedPrice;

      switch (sortBy) {
        case 'price_desc':
          return priceB - priceA;
        case 'growth_desc':
          return b.growth1Y - a.growth1Y;
        case 'price_asc':
          return priceA - priceB;
        case 'recent':
          return b.year - a.year;
        case 'alpha':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, selectedCategory, selectedTheme, sortBy]);

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
    <div className="flex flex-col h-full bg-[#F5F5F7] font-sans text-gray-900 overflow-hidden">
      
      {/* ─── Header & Search ─── */}
      <div className="px-5 pt-[max(env(safe-area-inset-top),2.5rem)] pb-3 bg-white border-b border-gray-200/80 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Collectibles Catalog</h1>
            <p className="text-xs font-semibold text-gray-500">Live market values across LEGO, Pokémon, Sports & TCG</p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-200">
            {filteredItems.length} items
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sets, Charizard, Boba Fett, Jordan, codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F5F7] text-gray-900 pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium border border-gray-200/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mt-3 pt-0.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Secondary Filter & Sort Bar ─── */}
      <div className="px-5 py-2.5 bg-white/70 backdrop-blur-md border-b border-gray-200/60 flex items-center justify-between shrink-0">
        {/* Theme Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[65%]">
          {THEMES.map((theme) => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                selectedTheme === theme
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        {/* Sort Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span>Sort</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-gray-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value);
                    setIsSortOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-gray-50 ${
                    sortBy === opt.value ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-gray-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Collectibles List ─── */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3 pb-28">
        {filteredItems.map((item) => {
          const isAdded = addedMap[item.code];
          const isWished = wishlistMap[item.code];
          const displayPrice = item.psa10Value ? item.psa10Value : item.sealedPrice;

          return (
            <div
              key={item.id}
              onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: item.code })}
              className="bg-white rounded-[24px] p-3.5 border border-gray-200/80 shadow-sm flex items-center gap-3.5 active:scale-[0.99] transition-all cursor-pointer group hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 bg-[#F5F5F7] rounded-2xl p-1 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.brickset.com/sets/images/75192-1.jpg';
                  }}
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                    {item.theme}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">· {item.year}</span>
                  {item.isRetired && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      Retired
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-gray-900 truncate leading-snug">{item.name}</h3>
                
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  #{item.code} · {item.category.toUpperCase()}
                </p>

                {/* Price & Growth */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm font-black text-gray-900">${displayPrice.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                    +{item.growth1Y}% 1Y
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => handleToggleWishlist(item, e)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isWished ? 'bg-rose-50 text-rose-500' : 'bg-gray-100 text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <Heart className="w-4 h-4" fill={isWished ? 'currentColor' : 'none'} />
                </button>

                <button
                  onClick={(e) => handleAddToCollection(item, e)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isAdded ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 font-bold text-base mb-1">No collectibles found</p>
            <p className="text-gray-400 text-xs">Try searching for "Charizard", "Jordan", "75192", or "Boba Fett"</p>
          </div>
        )}
      </div>
    </div>
  );
};
