import React, { useState, useMemo } from 'react';
import { Screen, CollectionItem } from '../types';
import { Search, ChevronRight, ArrowLeft, Plus, Check, Heart, Box, Flame, Shield, Trophy, Sparkles, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import { collectiblesDatabase, AnyCollectible } from '../lib/collectiblesDatabase';
import { getSafeImageUrl } from '../services/liveCollectibleService';
import confetti from 'canvas-confetti';

interface BrowseScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

interface ThemeCategory {
  id: string;
  name: string;
  franchise: string;
  setsCount: number;
  figsCount?: number;
  cardsCount?: number;
  badge: string;
  badgeColor: string;
  logoUrl?: string;
}

const THEMES_LIST: ThemeCategory[] = [
  { 
    id: 'city', 
    name: 'City', 
    franchise: 'lego', 
    setsCount: 952, 
    figsCount: 2066, 
    badge: 'CITY', 
    badgeColor: 'bg-sky-500 text-white',
    logoUrl: 'https://img.bricklink.com/ItemImage/MN/0/cop045.png'
  },
  { 
    id: 'star-wars', 
    name: 'Star Wars', 
    franchise: 'lego', 
    setsCount: 1140, 
    figsCount: 1620, 
    badge: 'STAR WARS', 
    badgeColor: 'bg-amber-400 text-black',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Star_Wars_Logo.svg'
  },
  { 
    id: 'icons', 
    name: 'Icons & UCS', 
    franchise: 'lego', 
    setsCount: 148, 
    figsCount: 420, 
    badge: 'ICONS', 
    badgeColor: 'bg-zinc-800 text-white',
    logoUrl: 'https://img.bricklink.com/ItemImage/SN/0/75192-1.png'
  },
  { 
    id: 'ninjago', 
    name: 'Ninjago', 
    franchise: 'lego', 
    setsCount: 615, 
    figsCount: 914, 
    badge: 'NINJAGO', 
    badgeColor: 'bg-red-600 text-white',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Lego_Ninjago_logo.png'
  },
  { 
    id: 'castle', 
    name: 'Castle & Medieval', 
    franchise: 'lego', 
    setsCount: 320, 
    figsCount: 680, 
    badge: 'CASTLE', 
    badgeColor: 'bg-emerald-700 text-white',
    logoUrl: 'https://img.bricklink.com/ItemImage/SN/0/10305-1.png'
  },
  { 
    id: 'marvel', 
    name: 'Marvel Super Heroes', 
    franchise: 'lego', 
    setsCount: 325, 
    figsCount: 740, 
    badge: 'MARVEL', 
    badgeColor: 'bg-red-500 text-white',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Marvel_Logo.svg'
  },
  { 
    id: 'cmf', 
    name: 'Minifigure Series', 
    franchise: 'lego', 
    setsCount: 793, 
    figsCount: 765, 
    badge: 'MINIFIGURES', 
    badgeColor: 'bg-orange-500 text-white',
    logoUrl: 'https://img.bricklink.com/ItemImage/MN/0/col160.png'
  },
  { 
    id: 'sv-151', 
    name: 'Scarlet & Violet: 151', 
    franchise: 'pokemon', 
    setsCount: 1, 
    cardsCount: 165, 
    badge: '151', 
    badgeColor: 'bg-rose-500 text-white',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg'
  },
  { 
    id: 'evolving-skies', 
    name: 'Evolving Skies', 
    franchise: 'pokemon', 
    setsCount: 1, 
    cardsCount: 203, 
    badge: 'SWSH07', 
    badgeColor: 'bg-blue-600 text-white',
    logoUrl: 'https://images.pokemontcg.io/swsh7/logo.png'
  },
  { 
    id: 'alpha-mtg', 
    name: 'Alpha Edition (1993)', 
    franchise: 'mtg', 
    setsCount: 1, 
    cardsCount: 302, 
    badge: 'ALPHA', 
    badgeColor: 'bg-purple-900 text-white',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/aa/Magic_the_gathering-logo.svg'
  },
  { 
    id: 'lor-first', 
    name: 'The First Chapter', 
    franchise: 'lorcana', 
    setsCount: 1, 
    cardsCount: 204, 
    badge: 'LORCANA', 
    badgeColor: 'bg-indigo-600 text-white',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Disney_Lorcana_logo.svg'
  },
  { 
    id: 'op-romance', 
    name: 'Romance Dawn OP-01', 
    franchise: 'one_piece', 
    setsCount: 1, 
    cardsCount: 121, 
    badge: 'OP-01', 
    badgeColor: 'bg-amber-600 text-white',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/One_Piece_Logo.svg'
  },
  { 
    id: 'ygo-lob', 
    name: 'Legend of Blue Eyes 1st Ed', 
    franchise: 'yugioh', 
    setsCount: 1, 
    cardsCount: 126, 
    badge: 'LOB-001', 
    badgeColor: 'bg-cyan-700 text-white',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Yu-Gi-Oh%21_%28English_logo%29.svg'
  },
];

const FRANCHISE_PILLS = [
  { id: 'all', label: 'All Catalog', icon: Sparkles },
  { id: 'lego', label: 'LEGO', icon: Box },
  { id: 'pokemon', label: 'Pokémon', icon: Flame },
  { id: 'mtg', label: 'Magic', icon: Flame },
  { id: 'lorcana', label: 'Lorcana', icon: Sparkles },
  { id: 'yugioh', label: 'Yu-Gi-Oh!', icon: Shield },
  { id: 'one_piece', label: 'One Piece', icon: Shield },
  { id: 'sports', label: 'Sports', icon: Trophy },
];

export const BrowseScreen: React.FC<BrowseScreenProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subFilterQuery, setSubFilterQuery] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<ThemeCategory | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'minifigs' | 'sets' | 'cards'>('all');
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({});

  // Filter themes
  const filteredThemes = useMemo(() => {
    return THEMES_LIST.filter(theme => {
      const matchFranchise = selectedFranchise === 'all' || theme.franchise === selectedFranchise;
      const matchSearch = !searchQuery.trim() || 
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.badge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFranchise && matchSearch;
    });
  }, [selectedFranchise, searchQuery]);

  // Filter items in theme or direct search
  const displayedItems = useMemo(() => {
    let items = collectiblesDatabase.getAll();

    if (selectedTheme) {
      // Filter by theme
      items = items.filter(item => {
        const themeLower = (item.theme || '').toLowerCase();
        const selThemeLower = selectedTheme.name.toLowerCase();
        const selIdLower = selectedTheme.id.toLowerCase();
        return themeLower.includes(selThemeLower) || 
               themeLower.includes(selIdLower) ||
               (selectedTheme.id === 'star-wars' && (themeLower.includes('star wars') || themeLower.includes('sw'))) ||
               (selectedTheme.id === 'city' && (themeLower.includes('city') || themeLower.includes('town'))) ||
               (selectedTheme.id === 'icons' && (themeLower.includes('icons') || themeLower.includes('ucs') || themeLower.includes('creator expert'))) ||
               (selectedTheme.id === 'castle' && (themeLower.includes('castle') || themeLower.includes('medieval') || themeLower.includes('knights'))) ||
               (selectedTheme.id === 'sv-151' && (item.setSeries?.toLowerCase().includes('151') || themeLower.includes('151') || item.category === 'pokemon')) ||
               (selectedTheme.id === 'alpha-mtg' && (item.category === 'mtg' || themeLower.includes('alpha') || themeLower.includes('magic'))) ||
               (selectedTheme.id === 'ygo-lob' && (item.category === 'yugioh' || themeLower.includes('blue eyes') || themeLower.includes('yugioh')));
      });

      // Filter by tab (minifigs / sets / cards)
      if (activeTab === 'minifigs') {
        items = items.filter(i => i.type === 'minifigure');
      } else if (activeTab === 'sets') {
        items = items.filter(i => i.type === 'set' || (!i.type && !i.category));
      } else if (activeTab === 'cards') {
        items = items.filter(i => i.type === 'pokemon' || i.type === 'mtg' || i.type === 'yugioh' || i.category === 'pokemon' || i.category === 'mtg' || i.category === 'yugioh');
      }

      // Filter by sub search query
      if (subFilterQuery.trim()) {
        const q = subFilterQuery.toLowerCase();
        items = items.filter(i => 
          i.name.toLowerCase().includes(q) || 
          i.code.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q))
        );
      }
    } else if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.code.toLowerCase().includes(q) ||
        (i.theme && i.theme.toLowerCase().includes(q))
      );
    }

    return items;
  }, [selectedTheme, activeTab, subFilterQuery, searchQuery]);

  // Add to collection
  const handleAddToCollection = (item: AnyCollectible, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('hellobrick_collection_sets');
      const collection: CollectionItem[] = stored ? JSON.parse(stored) : [];
      
      const price = item.sealedPrice || (item as any).marketPrice || item.retailPrice || 0;
      const img = item.imageUrl || (item as any).image || '';

      collection.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: localStorage.getItem('hellobrick_userId') || 'user-1',
        setNum: item.code,
        condition: 'sealed',
        quantity: 1,
        purchasePrice: price,
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: `Added from Catalog (${item.theme || 'GENERAL'})`,
        imageUrl: getSafeImageUrl(img),
        name: item.name,
        theme: item.theme || 'TCG',
        currentPrice: price,
        retailPrice: (item as any).retailPrice || (price * 0.2),
        year: item.year || 2024,
        cardNumber: (item as any).cardNumber || item.code,
        setSeries: (item as any).setSeries || item.theme,
        category: (item as any).category || (item.type as any) || 'pokemon',
        rating: (item as any).rating || 'Strong Buy',
        psa10Value: (item as any).psa10Value || Math.round(price * 2.8),
        psa9Value: (item as any).psa9Value || Math.round(price * 1.45),
        description: item.description || `Catalog entry #${item.code}`,
        addedAt: new Date().toISOString(),
        itemType: item.type === 'minifigure' ? 'minifig' : (item.type === 'pokemon' || item.type === 'mtg' || item.type === 'yugioh' || item.category === 'pokemon' ? 'card' : 'set')
      });

      localStorage.setItem('hellobrick_collection_sets', JSON.stringify(collection));
      window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));

      setAddedMap(prev => ({ ...prev, [item.code]: true }));

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#FF7A30', '#3B82F6']
      });

      setTimeout(() => {
        setAddedMap(prev => ({ ...prev, [item.code]: false }));
      }, 2000);
    } catch {
      alert('Failed to add item to vault');
    }
  };

  // Add to Wishlist
  const handleToggleWishlist = (item: AnyCollectible, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('hellobrick_wishlist');
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (list.includes(item.code)) {
        list = list.filter(c => c !== item.code);
        setWishlistMap(prev => ({ ...prev, [item.code]: false }));
      } else {
        list.push(item.code);
        setWishlistMap(prev => ({ ...prev, [item.code]: true }));
      }
      localStorage.setItem('hellobrick_wishlist', JSON.stringify(list));
    } catch {}
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] font-sans text-gray-900 overflow-y-auto pb-32 select-none">
      
      {/* ─── Header & Search ─── */}
      <div className="px-5 pt-[max(env(safe-area-inset-top),2.5rem)] pb-3 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-xl z-20 border-b border-gray-200/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {selectedTheme ? (
              <button 
                onClick={() => setSelectedTheme(null)}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : null}
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-tight">
                {selectedTheme ? selectedTheme.name : 'Search Database'}
              </h1>
              <p className="text-[11px] font-semibold text-gray-400">
                {selectedTheme ? `${selectedTheme.setsCount} sets cataloged` : '20,000+ sets, minifigs & TCG cards'}
              </p>
            </div>
          </div>

          <button 
            onClick={() => onNavigate(Screen.COLLECTION)}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Search Input Bar (Matching Brickify search) */}
        <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-200/80 shadow-sm flex items-center gap-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={selectedTheme ? subFilterQuery : searchQuery}
            onChange={(e) => selectedTheme ? setSubFilterQuery(e.target.value) : setSearchQuery(e.target.value)}
            placeholder={selectedTheme ? `Filter in ${selectedTheme.name}...` : "Search sets, minifigs, Pokémon, MTG..."}
            className="w-full text-xs font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Category Pills (Horizontal Scroll) */}
        {!selectedTheme && (
          <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar -mx-5 px-5">
            {FRANCHISE_PILLS.map(pill => {
              const Icon = pill.icon;
              const isSelected = selectedFranchise === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedFranchise(pill.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {pill.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-5 space-y-4 mt-3">

        {/* ─── Case 1: Viewing Theme Detail List (Brickify Minifigs/Sets List Flow) ─── */}
        {selectedTheme ? (
          <div>
            {/* Stats / Badges row */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl shadow-xs ${selectedTheme.badgeColor}`}>
                {selectedTheme.badge}
              </span>
              <span className="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-xl">
                {displayedItems.length} items listed
              </span>
            </div>

            {/* Segmented Controls (Minifigs vs Sets vs Cards) */}
            <div className="flex items-center bg-gray-200/70 p-1 rounded-2xl mb-4">
              {[
                { id: 'all', label: 'All' },
                { id: 'minifigs', label: 'Minifigs' },
                { id: 'sets', label: 'Sets' },
                { id: 'cards', label: 'Cards' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Item Rows */}
            <div className="space-y-2.5">
              {displayedItems.map((item) => {
                const price = item.sealedPrice || (item as any).marketPrice || item.retailPrice || 0;
                const isAdded = addedMap[item.code];
                const isWishlisted = wishlistMap[item.code];

                return (
                  <div
                    key={item.id}
                    onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: item.code })}
                    className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-sm flex items-center justify-between gap-3 active:scale-[0.99] transition-transform cursor-pointer hover:border-emerald-400"
                  >
                    {/* Left: Image & Title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 bg-[#F5F5F7] rounded-xl p-1.5 shrink-0 flex items-center justify-center border border-gray-100">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const cat = (item as any).category || '';
                            if (cat === 'pokemon') {
                              target.src = 'https://images.pokemontcg.io/sv3pt5/166_hires.png';
                            } else if (cat === 'mtg') {
                              target.src = 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg';
                            } else if (cat === 'yugioh') {
                              target.src = 'https://images.ygoprodeck.com/images/cards/89631139.jpg';
                            } else {
                              // For LEGO sets/minifigs, try the BrickLink URL pattern based on the item code
                              const code = item.code || '';
                              const isMinifig = cat === 'minifigure' || code.includes('sw') || code.includes('col');
                              target.src = isMinifig
                                ? `https://img.bricklink.com/ItemImage/MN/0/${code}.png`
                                : `https://img.bricklink.com/ItemImage/SN/0/${code}.png`;
                              // If that also fails, just hide
                              target.onerror = () => { target.style.display = 'none'; };
                            }
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-gray-900 truncate leading-tight">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono font-bold text-gray-400">#{item.code}</span>
                          {item.pieces && (
                            <span className="text-[10px] font-semibold text-gray-500">· {item.pieces} pcs</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Price Pill & Quick Add Button */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 block">
                          {price > 0 ? `$${price.toLocaleString()}` : 'Analysing'}
                        </span>
                        {item.psa10Value && item.psa10Value > 0 && (
                          <span className="text-[9px] font-bold text-gray-400">PSA 10: ${item.psa10Value.toLocaleString()}</span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCollection(item, e)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isAdded ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                        {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ─── Case 2: Browse by Theme / Franchise Directory (Brickify Theme List) ─── */
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                Browse by theme ({filteredThemes.length})
              </h3>
            </div>

            <div className="space-y-2.5">
              {filteredThemes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-sm flex items-center justify-between gap-3 active:scale-[0.99] transition-transform cursor-pointer hover:border-emerald-400"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-12 rounded-xl bg-[#F5F5F7] border border-gray-100 p-1 flex items-center justify-center shrink-0">
                      {theme.logoUrl ? (
                        <img 
                          src={theme.logoUrl} 
                          alt={theme.name} 
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${theme.badgeColor}`}>
                          {theme.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900">{theme.name}</h4>
                      <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
                        {theme.setsCount} sets {theme.figsCount ? `· ${(theme.figsCount / 1000).toFixed(1)}K figs` : ''} {theme.cardsCount ? `· ${theme.cardsCount} cards` : ''}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
              ))}
            </div>

            {/* Direct item results if user typed a search query */}
            {searchQuery.trim().length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2.5">
                  Direct Matches ({displayedItems.length})
                </h3>
                <div className="space-y-2.5">
                  {displayedItems.map((item) => {
                    const price = item.sealedPrice || (item as any).marketPrice || item.retailPrice || 0;
                    return (
                      <div
                        key={item.id}
                        onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: item.code })}
                        className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-sm flex items-center justify-between gap-3 active:scale-[0.99] transition-transform cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 bg-[#F5F5F7] rounded-xl p-1 shrink-0 flex items-center justify-center">
                            <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-gray-900 truncate">{item.name}</h4>
                            <span className="text-[10px] font-mono text-gray-400">#{item.code}</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-600">
                          {price > 0 ? `$${price.toLocaleString()}` : 'Analysing'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
