import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Calendar, 
  Layers, 
  Users, 
  Plus, 
  Heart, 
  Check,
  Share2,
  AlertCircle
} from 'lucide-react';
import { Screen, LegoSetModel } from '../types';
import { mockSets, mockValuations } from '../lib/mock-data';
import confetti from 'canvas-confetti';

interface SetDetailScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  setNum?: string;
}

export const SetDetailScreen: React.FC<SetDetailScreenProps> = ({ onNavigate, setNum }) => {
  const [isSavedInCollection, setIsSavedInCollection] = useState(false);
  const [isSavedInWishlist, setIsSavedInWishlist] = useState(false);
  const [activeChartRange, setActiveChartRange] = useState<'30d' | '90d' | '1y'>('30d');

  // Fallback to Bookshop if no setNum is provided
  const activeSetNum = setNum || '10270-1';
  
  // Find set and valuation
  const set = mockSets.find(s => s.setNum === activeSetNum) || mockSets[0];
  const val = mockValuations.get(activeSetNum) || {
    sealedValue: 280.00,
    usedValue: 190.00,
    resaleAvg: 220.00,
    sealedChange30d: 4.2,
    usedChange30d: 2.1,
    rarityScore: 8,
    demandScore: 9,
    isRetired: true,
    priceHistory: [
      { date: '30 days ago', sealed: 260, used: 180 },
      { date: '15 days ago', sealed: 270, used: 185 },
      { date: 'Today', sealed: 280, used: 190 }
    ]
  };

  useEffect(() => {
    // Check if item already exists in collection
    const colStored = localStorage.getItem('hellobrick_collection_sets');
    if (colStored) {
      try {
        const col = JSON.parse(colStored);
        setIsSavedInCollection(col.some((c: any) => c.setNum === activeSetNum));
      } catch(e){}
    }

    // Check if item already exists in wishlist
    const wishStored = localStorage.getItem('hellobrick_wishlist_sets');
    if (wishStored) {
      try {
        const wish = JSON.parse(wishStored);
        setIsSavedInWishlist(wish.some((w: any) => w.setNum === activeSetNum));
      } catch(e){}
    }
  }, [activeSetNum]);

  const handleAddCollection = () => {
    const colStored = localStorage.getItem('hellobrick_collection_sets');
    let currentCollection = [];
    if (colStored) {
      try { currentCollection = JSON.parse(colStored); } catch(e){}
    }

    if (isSavedInCollection) {
      // Remove
      const updated = currentCollection.filter((c: any) => c.setNum !== activeSetNum);
      localStorage.setItem('hellobrick_collection_sets', JSON.stringify(updated));
      setIsSavedInCollection(false);
    } else {
      // Add
      const newColItem = {
        id: `col_${Date.now()}`,
        userId: 'user-1',
        setNum: activeSetNum,
        condition: 'sealed',
        quantity: 1,
        purchasePrice: val.sealedValue,
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: 'Added from premium set detail deep dive page.',
        addedAt: new Date().toISOString(),
        itemType: 'set'
      };
      const updated = [newColItem, ...currentCollection];
      localStorage.setItem('hellobrick_collection_sets', JSON.stringify(updated));
      setIsSavedInCollection(true);
      confetti({ particleCount: 120, spread: 60, origin: { y: 0.8 }, colors: ['#C9A84C', '#FFFFFF'] });
    }
  };

  const handleAddWishlist = () => {
    const wishStored = localStorage.getItem('hellobrick_wishlist_sets');
    let currentWishlist = [];
    if (wishStored) {
      try { currentWishlist = JSON.parse(wishStored); } catch(e){}
    }

    if (isSavedInWishlist) {
      // Remove
      const updated = currentWishlist.filter((w: any) => w.setNum !== activeSetNum);
      localStorage.setItem('hellobrick_wishlist_sets', JSON.stringify(updated));
      setIsSavedInWishlist(false);
    } else {
      // Add
      const newWishItem = {
        id: `wish_${Date.now()}`,
        userId: 'user-1',
        setNum: activeSetNum,
        targetPrice: val.sealedValue * 0.9, // 10% lower target
        alertEnabled: true,
        addedAt: new Date().toISOString(),
        itemType: 'set'
      };
      const updated = [newWishItem, ...currentWishlist];
      localStorage.setItem('hellobrick_wishlist_sets', JSON.stringify(updated));
      setIsSavedInWishlist(true);
      confetti({ particleCount: 80, spread: 50, origin: { y: 0.8 }, colors: ['#FF7A30', '#FFFFFF'] });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0D111A] font-sans text-white relative overflow-hidden select-none">
      {/* Background Radial Spotlights */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-blue-600/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C9A84C]/[0.02] blur-[100px] rounded-full pointer-events-none" />

      {/* Sticky Header */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between bg-[#0D111A]/85 backdrop-blur-xl border-b border-white/5 shrink-0">
        <button
          onClick={() => onNavigate(Screen.COLLECTION)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="text-center max-w-[180px]">
          <h1 className="text-xs font-black text-white truncate leading-tight uppercase tracking-wider">{set.name}</h1>
          <span className="text-[8px] font-mono text-slate-500 font-bold block mt-0.5 uppercase tracking-widest">
            Set #{set.setNum.split('-')[0]}
          </span>
        </div>
        <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
          <Share2 className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Main viewport */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto no-scrollbar pb-32">
          
          {/* 1. HERO LEGO IMAGE CARD */}
          <div className="px-6 pt-5">
            <div className="bg-[#161B26] border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center shadow-xl relative overflow-hidden min-h-[220px]">
              
              {/* Retired / Active status badge */}
              <div className="absolute top-4 left-4 z-10">
                {set.isRetired ? (
                  <span className="text-[8px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    ⚠️ retired
                  </span>
                ) : (
                  <span className="text-[8px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    ❇️ active
                  </span>
                )}
              </div>

              {/* Rarity score badge */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-[#C9A84C]/15 border border-[#C9A84C]/35 px-2.5 py-1 rounded-full">
                <Star className="w-3 h-3 text-[#C9A84C] fill-[#C9A84C]" />
                <span className="text-[8px] font-black text-[#C9A84C] uppercase tracking-wider">
                  Rarity: {val.rarityScore * 10}/100
                </span>
              </div>

              {/* Set CDN Box art */}
              <img 
                src={`https://cdn.rebrickable.com/media/sets/${set.setNum}.jpg`} 
                alt={set.name}
                onError={(e) => {
                  e.currentTarget.src = `https://cdn.rebrickable.com/media/sets/${set.setNum}-1.jpg`;
                  e.currentTarget.onerror = null;
                }}
                className="w-[180px] h-[140px] object-contain transition-transform duration-500 hover:scale-105"
              />

              <div className="mt-3 w-full text-center">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">RELEASED</span>
                <span className="text-xs font-black text-white mt-0.5 block">{set.year} Theme: {set.theme}</span>
              </div>
            </div>
          </div>

          {/* 2. THREE-VALUE FINANCIAL BREAKDOWN */}
          <div className="px-6 pt-5">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-left">ESTIMATED VALUATIONS</span>
            <div className="grid grid-cols-3 gap-3">
              
              {/* Sealed Value */}
              <div className="bg-[#161B26] border border-white/5 rounded-2xl p-3 text-left">
                <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block">SEALED BOX</span>
                <div className="font-mono text-sm font-black text-emerald-400 mt-1">${val.sealedValue.toFixed(0)}</div>
                <div className="flex items-center gap-0.5 mt-0.5 text-[8px] font-bold text-emerald-400">
                  <TrendingUp className="w-2.5 h-2.5" />
                  +{val.sealedChange30d.toFixed(1)}%
                </div>
              </div>

              {/* Used Value */}
              <div className="bg-[#161B26] border border-white/5 rounded-2xl p-3 text-left">
                <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block">USED SET</span>
                <div className="font-mono text-sm font-black text-slate-300 mt-1">${val.usedValue.toFixed(0)}</div>
                <div className="flex items-center gap-0.5 mt-0.5 text-[8px] font-bold text-[#C9A84C]">
                  <TrendingUp className="w-2.5 h-2.5" />
                  +{val.usedChange30d.toFixed(1)}%
                </div>
              </div>

              {/* Resale Average */}
              <div className="bg-[#161B26] border border-white/5 rounded-2xl p-3 text-left">
                <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block">RESALE AVG</span>
                <div className="font-mono text-sm font-black text-white mt-1">${val.resaleAvg.toFixed(0)}</div>
                <div className="flex items-center gap-0.5 mt-0.5 text-[8px] font-bold text-slate-500">
                  <span>0.0%</span>
                </div>
              </div>

            </div>
          </div>

          {/* 3. INTERACTIVE APPRECIATION CHART */}
          <div className="px-6 pt-5">
            <div className="bg-[#161B26] border border-white/5 rounded-[28px] p-5 shadow-xl text-left">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">MARKET APPRECIATION</span>
                  <h3 className="font-black text-sm text-white mt-0.5">Appreciation Graph</h3>
                </div>
                <div className="flex bg-[#0D111A] border border-white/5 p-1 rounded-xl gap-1">
                  {(['30d', '90d', '1y'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setActiveChartRange(range)}
                      className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg transition-all ${
                        activeChartRange === range
                          ? 'bg-[#C9A84C] text-[#0D111A] shadow-sm'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Premium Line Chart SVG Drawing */}
              <div className="h-32 bg-[#0D111A] border border-white/5 rounded-2xl relative overflow-hidden flex items-end justify-center p-3">
                
                {/* Horizontal grid lines */}
                <div className="absolute inset-x-0 top-1/4 h-px border-t border-dashed border-white/5 pointer-events-none" />
                <div className="absolute inset-x-0 top-2/4 h-px border-t border-dashed border-white/5 pointer-events-none" />
                <div className="absolute inset-x-0 top-3/4 h-px border-t border-dashed border-white/5 pointer-events-none" />

                {/* SVG Graph line path */}
                <svg viewBox="0 0 100 40" className="w-full h-full stroke-[#C9A84C] relative z-10" fill="none" strokeWidth="2.5" strokeLinecap="round">
                  {/* Fill gradient below line */}
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {activeChartRange === '30d' && (
                    <>
                      <path d="M 0,38 C 20,38 40,28 60,30 C 80,32 90,8 100,5" />
                      <path d="M 0,38 C 20,38 40,28 60,30 C 80,32 90,8 100,5 L 100,40 L 0,40 Z" fill="url(#chartGlow)" stroke="none" />
                      <circle cx="100" cy="5" r="3" fill="#0D111A" stroke="#C9A84C" strokeWidth="2" className="animate-pulse" />
                    </>
                  )}
                  {activeChartRange === '90d' && (
                    <>
                      <path d="M 0,38 C 20,34 30,10 50,15 C 70,20 85,25 100,2" />
                      <path d="M 0,38 C 20,34 30,10 50,15 C 70,20 85,25 100,2 L 100,40 L 0,40 Z" fill="url(#chartGlow)" stroke="none" />
                      <circle cx="100" cy="2" r="3" fill="#0D111A" stroke="#C9A84C" strokeWidth="2" className="animate-pulse" />
                    </>
                  )}
                  {activeChartRange === '1y' && (
                    <>
                      <path d="M 0,38 C 15,35 30,30 45,12 C 60,-5 80,18 100,8" />
                      <path d="M 0,38 C 15,35 30,30 45,12 C 60,-5 80,18 100,8 L 100,40 L 0,40 Z" fill="url(#chartGlow)" stroke="none" />
                      <circle cx="100" cy="8" r="3" fill="#0D111A" stroke="#C9A84C" strokeWidth="2" className="animate-pulse" />
                    </>
                  )}
                </svg>

                {/* Graph tooltip label */}
                <div className="absolute top-3 right-3 z-20 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#C9A84C]/45 flex items-center gap-1">
                  <span className="text-[7px] text-slate-400 font-bold block uppercase leading-none">PEAK</span>
                  <span className="font-mono text-[9px] font-black text-emerald-400 leading-none">
                    {activeChartRange === '30d' && '$280'}
                    {activeChartRange === '90d' && '$292'}
                    {activeChartRange === '1y' && '$315'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. KEY STATS GRID */}
          <div className="px-6 pt-5">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-left">KEY DETAILED STATISTICS</span>
            <div className="bg-[#161B26] border border-white/5 rounded-3xl p-5 shadow-xl">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                
                {/* Release Year */}
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block">YEAR</span>
                    <span className="text-xs font-black text-white block mt-0.5">{set.year}</span>
                  </div>
                </div>

                {/* Part Count */}
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block">PIECE COUNT</span>
                    <span className="text-xs font-black text-white block mt-0.5">{set.pieces} pcs</span>
                  </div>
                </div>

                {/* Minifigures */}
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block">MINIFIGURES</span>
                    <span className="text-xs font-black text-white block mt-0.5">{set.minifigs || '5'} owned</span>
                  </div>
                </div>

                {/* Retirement */}
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block">RETIREMENT</span>
                    <span className="text-xs font-black text-white block mt-0.5">
                      {set.isRetired ? 'Retired (Dec 2023)' : 'Pending (Dec 2026)'}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 5. BOTTOM ONE-TAP ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D111A]/90 border-t border-white/5 px-6 pt-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] backdrop-blur-md flex gap-3 shrink-0">
        
        {/* Add to Wishlist toggle */}
        <button
          onClick={handleAddWishlist}
          className={`flex-1 h-16 border rounded-2xl font-black text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-2 active:scale-95 transition-all ${
            isSavedInWishlist
              ? 'bg-[#FF7A30]/10 border-[#FF7A30]/50 text-[#FF7A30]'
              : 'bg-white/5 border-white/5 text-slate-300 hover:text-white'
          }`}
        >
          {isSavedInWishlist ? (
            <>
              <Check className="w-4 h-4" />
              On Wishlist
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 text-slate-400 hover:fill-red-500 hover:text-red-500" />
              Add Wishlist
            </>
          )}
        </button>

        {/* Add to Collection toggle */}
        <button
          onClick={handleAddCollection}
          className={`flex-1 h-16 font-black rounded-2xl text-xs uppercase tracking-[0.12em] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl ${
            isSavedInCollection
              ? 'bg-[#C9A84C]/25 border border-[#C9A84C]/50 text-[#C9A84C]'
              : 'bg-gradient-to-r from-[#C9A84C] to-[#E5C158] text-[#0D111A]'
          }`}
        >
          {isSavedInCollection ? (
            <>
              <Check className="w-4 h-4" />
              In Collection
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 text-[#0D111A]" strokeWidth={3} />
              Add Collection
            </>
          )}
        </button>

      </div>
    </div>
  );
};
