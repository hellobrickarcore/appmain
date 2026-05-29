import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Trash2, CheckCircle, Bell, ArrowLeft, MoreVertical, Shield, ChevronRight } from 'lucide-react';
import { Screen, WishlistItem } from '../types';
import { mockWishlist, mockSets, mockValuations } from '../lib/mock-data';
import confetti from 'canvas-confetti';

interface WishlistScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

export const WishlistScreen: React.FC<WishlistScreenProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [activeAlert, setActiveAlert] = useState(true);

  const loadWishlist = () => {
    const stored = localStorage.getItem('hellobrick_wishlist_sets');
    if (stored) {
      try {
        setWishlist(JSON.parse(stored));
      } catch (e) {
        setWishlist(mockWishlist);
      }
    } else {
      setWishlist(mockWishlist);
      localStorage.setItem('hellobrick_wishlist_sets', JSON.stringify(mockWishlist));
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  // Hydrate items with mock values
  const hydratedItems = useMemo(() => {
    return wishlist.map((item, idx) => {
      const set = mockSets.find(s => s.setNum === item.setNum) || mockSets[idx % mockSets.length];
      const val = mockValuations.get(item.setNum) || {
        sealedValue: 280.00,
        usedValue: 190.00,
        sealedChange7d: 5.2
      };
      
      // Map to exact label styles like "Set 02", "Set 06" from image
      const codeNames = ["Set 02", "Set 06", "Set 07", "Set 03", "Set 01", "Set 05", "Set 04"];
      const codeName = codeNames[idx % codeNames.length];
      
      // Specific monospaced value deltas matching image: +1449, +6106, +969, etc.
      const rawDeltas = [1449, 6106, 969, 452, 1265, 159, 342];
      const rawDelta = rawDeltas[idx % rawDeltas.length];

      return {
        ...item,
        set,
        val,
        codeName,
        rawDelta
      };
    });
  }, [wishlist]);

  const filteredItems = useMemo(() => {
    return hydratedItems.filter(item => {
      return item.set.name.toLowerCase().includes(search.toLowerCase()) || 
             item.codeName.toLowerCase().includes(search.toLowerCase());
    });
  }, [hydratedItems, search]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid navigating to details page
    const updated = wishlist.filter(w => w.id !== id);
    localStorage.setItem('hellobrick_wishlist_sets', JSON.stringify(updated));
    setWishlist(updated);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0D111A] font-sans text-white relative overflow-hidden select-none">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-rose-600/[0.02] via-transparent to-transparent pointer-events-none" />

      {/* Header Sticky */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between bg-[#0D111A]/85 backdrop-blur-xl border-b border-white/5 shrink-0">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-1.5 justify-center">
            Wishlist
          </h1>
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block mt-0.5">Monitored assets</span>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
            <Search className="w-4 h-4 text-slate-300" />
          </button>
          <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
            <MoreVertical className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto no-scrollbar pb-36 pt-4 px-6 space-y-3">
          
          {/* Wishlist item cards */}
          {filteredItems.map((item, idx) => {
            const cardElement = (
              <div
                key={item.id}
                onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: item.set.setNum })}
                className="bg-[#161B26] border border-white/5 rounded-3xl p-4 flex items-center justify-between shadow-xl cursor-pointer active:scale-[0.99] transition-all relative group overflow-hidden"
              >
                {/* Delete button (displays on hover/active) */}
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/35 p-3 rounded-2xl transition-all z-20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 min-w-0 group-hover:mr-12 transition-all">
                  {/* Set Box Thumbnail */}
                  <div className="w-12 h-12 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      src={`https://cdn.rebrickable.com/media/sets/${item.set.setNum}.jpg`}
                      alt={item.set.name}
                      onError={(e) => {
                        e.currentTarget.src = `https://cdn.rebrickable.com/media/sets/${item.set.setNum}-1.jpg`;
                        e.currentTarget.onerror = null;
                      }}
                      className="w-9 h-9 object-contain"
                    />
                  </div>

                  {/* Left Side labels */}
                  <div className="text-left min-w-0">
                    <h3 className="font-sans font-black text-sm text-white truncate leading-tight">
                      {item.codeName}
                    </h3>
                    <span className="text-[8px] font-black text-slate-500 truncate block mt-0.5 max-w-[120px]">
                      {item.set.name}
                    </span>
                    <span className="text-[7px] font-mono text-emerald-400 font-bold block mt-1 uppercase tracking-wider">
                      7-Day Value
                    </span>
                  </div>
                </div>

                {/* Right Side monospaced metrics */}
                <div className="text-right shrink-0 group-hover:opacity-0 transition-opacity">
                  <span className="font-mono text-base font-black text-white block leading-none">
                    +{item.rawDelta}
                  </span>
                  <span className="text-[7px] font-mono text-rose-500 font-bold block mt-1 uppercase tracking-wider">
                    -7-Day Value
                  </span>
                </div>
              </div>
            );

            // Injected Coral Pink Notification Alert Card at index 2 (just like the uploaded image)
            if (idx === 2 && activeAlert) {
              return (
                <React.Fragment key="alert-container">
                  {/* The exact competitor red/coral notification card */}
                  <div 
                    onClick={() => onNavigate(Screen.INSIGHTS)}
                    className="bg-[#FF6B6B] rounded-3xl p-5 flex items-center justify-between shadow-xl cursor-pointer active:scale-[0.99] transition-all relative overflow-hidden text-left"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-lg pointer-events-none" />
                    <div>
                      <h2 className="text-lg font-black text-white leading-tight uppercase tracking-wide">
                        Value
                      </h2>
                      <span className="text-base font-black text-white block mt-0.5">
                        +18% this week
                      </span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  {cardElement}
                </React.Fragment>
              );
            }

            return cardElement;
          })}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-[#161B26]/40 rounded-[32px] border border-dashed border-white/10">
              <Bell className="w-12 h-12 text-slate-700 mb-4" strokeWidth={1.5} />
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">No Wishlisted Bricks</h3>
              <p className="text-xs text-slate-600 mt-2 font-bold leading-normal">
                Set a buying target alert on retired LEGO sets. We will push a warning when market prices drop below it!
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
