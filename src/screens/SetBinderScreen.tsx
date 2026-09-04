import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Search, Filter, Check, Heart, Sparkles, Layers, ArrowUpRight, TrendingUp, Info } from 'lucide-react';
import { Screen, CollectionItem } from '../types';
import { collectiblesDatabase, ExpansionSet, AnyCollectible } from '../lib/collectiblesDatabase';
import confetti from 'canvas-confetti';

interface SetBinderScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  setId?: string;
}

export const SetBinderScreen: React.FC<SetBinderScreenProps> = ({ onNavigate, setId }) => {
  const activeSetId = setId || 'set-evolving-skies';
  const expansionSet: ExpansionSet = useMemo(() => {
    return collectiblesDatabase.getExpansionSetById(activeSetId) || collectiblesDatabase.getExpansionSets()[0];
  }, [activeSetId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'uncollected' | 'grails'>('all');
  const [ownedCodes, setOwnedCodes] = useState<Record<string, boolean>>({});

  // Sync owned status from local storage collection
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hellobrick_collection_sets');
      if (stored) {
        const items: CollectionItem[] = JSON.parse(stored);
        const map: Record<string, boolean> = {};
        items.forEach(it => {
          map[it.setNum] = true;
        });
        setOwnedCodes(map);
      }
    } catch (e) {}
  }, []);

  const items = useMemo(() => {
    return collectiblesDatabase.getItemsBySetId(expansionSet.id);
  }, [expansionSet.id]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterType === 'uncollected') {
        return !ownedCodes[item.code];
      }
      if (filterType === 'grails') {
        return item.rating === 'Grail';
      }
      return true;
    });
  }, [items, searchQuery, filterType, ownedCodes]);

  const ownedCount = items.filter(it => ownedCodes[it.code]).length;
  const progressPercent = items.length > 0 ? ((ownedCount / expansionSet.totalCards) * 100).toFixed(1) : '0.0';

  const toggleCollected = (item: AnyCollectible, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('hellobrick_collection_sets');
      let current: CollectionItem[] = stored ? JSON.parse(stored) : [];

      if (ownedCodes[item.code]) {
        current = current.filter(c => c.setNum !== item.code);
        setOwnedCodes(prev => {
          const next = { ...prev };
          delete next[item.code];
          return next;
        });
      } else {
        const price = item.sealedPrice || (item as any).marketPrice || item.retailPrice || 25;
        current.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          userId: 'user-1',
          setNum: item.code,
          condition: 'sealed',
          quantity: 1,
          purchasePrice: price,
          currentPrice: price,
          name: item.name,
          imageUrl: item.imageUrl,
          theme: item.theme,
          year: item.year,
          purchaseDate: new Date().toISOString().split('T')[0],
          notes: `Collected in Master Binder (${expansionSet.name})`,
          addedAt: new Date().toISOString(),
          itemType: item.category === 'minifigure' ? 'minifig' : (item.category === 'set' ? 'set' : 'card')
        });
        setOwnedCodes(prev => ({ ...prev, [item.code]: true }));

        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.85 },
          colors: ['#10B981', '#3B82F6', '#FFCE4A']
        });
      }

      localStorage.setItem('hellobrick_collection_sets', JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
    } catch (err) {}
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] font-sans text-gray-900 overflow-y-auto pb-32 select-none">
      
      {/* ─── 1. Top Header ─── */}
      <div className="px-5 pt-[max(env(safe-area-inset-top),2.5rem)] pb-3 flex items-center justify-between sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-xl z-30">
        <button
          onClick={() => onNavigate(Screen.BROWSE)}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">MASTER SET BINDER</p>
          <h2 className="text-sm font-black text-gray-900 leading-tight">{expansionSet.name}</h2>
        </div>

        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      <div className="px-5 mt-2 space-y-4">
        
        {/* ─── 2. Master Set Completion Card (Exact Slide 4 Replication) ─── */}
        <div className="bg-white rounded-[28px] p-5 border border-gray-200/80 shadow-sm relative overflow-hidden">
          
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">EXPANSION PROGRESS</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xl font-black text-gray-900">{progressPercent}%</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">TOTAL SET VALUE</p>
              <p className="text-xl font-black text-emerald-600 mt-0.5">${expansionSet.totalValue.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(parseFloat(progressPercent), 4)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold pt-2 border-t border-gray-100">
            <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-md text-[11px] font-bold">
              Full Set {ownedCount}/{expansionSet.totalCards}
            </span>
            <span className="text-[11px] font-bold text-gray-400">
              {expansionSet.series} · {expansionSet.releaseYear}
            </span>
          </div>
        </div>

        {/* ─── 3. Search & Filter Bar ─── */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded-2xl px-3.5 py-2.5 border border-gray-200/80 shadow-sm flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter cards..."
              className="w-full text-xs font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center bg-white rounded-2xl p-1 border border-gray-200/80 shadow-sm gap-1">
            {(['all', 'uncollected', 'grails'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                  filterType === tab 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'uncollected' ? 'Missing' : 'Grails'}
              </button>
            ))}
          </div>
        </div>

        {/* ─── 4. Expansion Set Switcher Pills ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {collectiblesDatabase.getExpansionSets().map(s => {
            const isSelected = s.id === expansionSet.id;
            return (
              <button
                key={s.id}
                onClick={() => onNavigate(Screen.SET_BINDER, { setId: s.id })}
                className={`px-3 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s.name} (${s.totalValue.toLocaleString()})
              </button>
            );
          })}
        </div>

        {/* ─── 5. 3-Column Master Binder Visual Grid ─── */}
        <div className="grid grid-cols-3 gap-2.5">
          {filteredItems.map(item => {
            const isOwned = !!ownedCodes[item.code];
            const price = item.psa10Value || item.sealedPrice;

            return (
              <div
                key={item.id}
                onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: item.code })}
                className={`bg-white rounded-[22px] p-2.5 border transition-all duration-200 relative flex flex-col items-center cursor-pointer shadow-sm hover:shadow-md ${
                  isOwned ? 'border-emerald-500/80 bg-emerald-50/20' : 'border-gray-200/80'
                }`}
              >
                {/* Owned Toggle Pin */}
                <button
                  onClick={(e) => toggleCollected(item, e)}
                  className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer ${
                    isOwned ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={isOwned ? 'Collected in Binder' : 'Mark as Collected'}
                >
                  <Check className="w-3 h-3" />
                </button>

                {/* Card Artwork */}
                <div className="w-full aspect-[3/4] flex items-center justify-center p-1 my-1">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop';
                    }}
                  />
                </div>

                {/* Card Number & Title */}
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight truncate w-full text-center">
                  #{item.code.replace('PKM-', '').replace('fig-', '')}
                </p>
                <h4 className="text-[10px] font-black text-gray-900 truncate w-full text-center leading-tight">
                  {item.name}
                </h4>

                {/* Price Badge */}
                <div className="mt-1.5 bg-emerald-50 text-emerald-700 font-black text-[10px] px-2 py-0.5 rounded-full border border-emerald-200/60">
                  ${price.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
