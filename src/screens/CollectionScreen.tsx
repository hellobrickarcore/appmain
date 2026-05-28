import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, X, TrendingUp, BookOpen, Trash2, ChevronRight } from 'lucide-react';
import { Screen, CollectionItem } from '../types';
import { getCollectionFromStorage, getSets, getValuationsMap } from '../lib/dataProvider';
import confetti from 'canvas-confetti';
import { mockSets, mockMinifigs } from '../lib/mock-data';

interface CollectionScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  highlightSet?: string;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ onNavigate }) => {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualSetNum, setManualSetNum] = useState('');
  const [manualCondition, setManualCondition] = useState<'sealed' | 'used'>('sealed');
  const [manualPrice, setManualPrice] = useState('');
  const [sets, setSets] = React.useState<any[]>([]);
  const [valuationsMap, setValuationsMap] = React.useState(new Map<string, any>());
  const [hideValue, setHideValue] = useState(false);

  const loadCollection = async () => {
    const stored = await getCollectionFromStorage();
    setCollection(stored);
    const [fetchedSets, valuations] = await Promise.all([getSets(), getValuationsMap()]);
    setSets(fetchedSets);
    setValuationsMap(valuations);
  };

  useEffect(() => { loadCollection(); }, []);

  useEffect(() => {
    const handler = () => loadCollection();
    window.addEventListener('hellobrick:collection-updated', handler);
    return () => window.removeEventListener('hellobrick:collection-updated', handler);
  }, []);

  const hydratedCollection = useMemo(() => {
    if (!sets.length && !collection.length) return [];
    return collection.map((item, idx) => {
      const set = sets.find(s => s.setNum === item.setNum) || 
                  mockSets.find(s => s.setNum === item.setNum) ||
                  mockMinifigs.find(f => f.figNum === item.setNum) ||
                  { 
                    name: `Custom LEGO Asset (${item.setNum})`, 
                    setNum: item.setNum, 
                    retailPrice: item.purchasePrice || 49.99, 
                    imageUrl: 'https://cdn.rebrickable.com/media/sets/10305-1.jpg',
                    theme: 'Custom'
                  };
      const val = valuationsMap.get(item.setNum) || {
        sealedValue: set.retailPrice || 149.99,
        usedValue: (set.retailPrice || 149.99) * 0.7,
        sealedChange30d: 4.2,
        usedChange30d: 3.1,
      };
      const quantity = (item as any).quantity ?? 1;
      const currentValue = (item.condition === 'sealed' ? val.sealedValue : val.usedValue) * quantity;
      const purchaseCost = (item.purchasePrice || (set.retailPrice || 100) * 0.8) * quantity;
      const returnVal = currentValue - purchaseCost;
      return { ...item, set, val, currentValue, purchaseCost, returnVal };
    });
  }, [collection, sets, valuationsMap]);

  const totalValue = useMemo(() => hydratedCollection.reduce((s, i) => s + i.currentValue, 0), [hydratedCollection]);
  const totalCost = useMemo(() => hydratedCollection.reduce((s, i) => s + i.purchaseCost, 0), [hydratedCollection]);
  const totalReturn = useMemo(() => totalValue - totalCost, [totalValue, totalCost]);
  const returnPct = useMemo(() => totalCost > 0 ? (totalReturn / totalCost) * 100 : 0, [totalReturn, totalCost]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = collection.filter(item => item.id !== id);
    localStorage.setItem('hellobrick_collection_sets', JSON.stringify(updated));
    setCollection(updated);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#131313] font-sans text-white relative overflow-hidden select-none" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="relative z-50 px-5 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between shrink-0">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="w-9 h-9 flex items-center justify-center text-white active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-black text-white tracking-tight">Collection Dashboard +</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-9 h-9 flex items-center justify-center text-white active:scale-90 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto no-scrollbar pb-36 px-5 space-y-5">

          {/* Main Value Card */}
          <div
            onClick={() => onNavigate(Screen.PORTFOLIO_ANALYTICS)}
            className="bg-[#1C1C1C] border border-white/8 rounded-3xl p-5 cursor-pointer active:scale-[0.99] transition-all shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Value</p>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-4xl font-black text-white tracking-tight">
                    {hideValue ? '••••••' : `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                  </h2>
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="mt-2">
                  <span className="text-emerald-400 font-black text-lg">+{returnPct.toFixed(1)}%</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setHideValue(v => !v); }}
                className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-full"
              >
                {hideValue ? 'Show' : 'Hide'}
              </button>
            </div>
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Duo Portfolio Preview</span>
            <span className="text-slate-500 text-xs font-medium">{hydratedCollection.length} sets</span>
          </div>

          {/* 2-Column Set Grid */}
          <div className="grid grid-cols-2 gap-3">
            {hydratedCollection.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: item.set.setNum })}
                className="bg-[#1C1C1C] border border-white/8 rounded-2xl p-3 cursor-pointer active:scale-[0.98] transition-all relative group"
              >
                {/* Delete */}
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-red-500/20 text-red-400 border border-red-500/30 p-1.5 rounded-lg transition-all z-10"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Set image */}
                <div className="w-full h-20 bg-[#111] rounded-xl flex items-center justify-center overflow-hidden mb-3">
                  <img
                    src={`https://cdn.rebrickable.com/media/sets/${item.set.setNum}.jpg`}
                    alt={item.set.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (!el.dataset.fallback) {
                        el.dataset.fallback = '1';
                        el.src = `https://cdn.rebrickable.com/media/sets/${item.set.setNum}-1.jpg`;
                      }
                    }}
                  />
                </div>

                {/* Name */}
                <p className="text-slate-400 text-[11px] font-medium truncate leading-tight">{item.set.name || `Set ${idx + 1}`}</p>

                {/* Price + sparkline */}
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-white font-black text-base">
                    ${item.currentValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                  <svg viewBox="0 0 40 20" className="w-8 h-4 stroke-emerald-400" fill="none" strokeWidth="2">
                    <path d={item.returnVal >= 0
                      ? "M0,18 C10,18 15,8 20,10 C25,12 30,4 40,2"
                      : "M0,4 C10,4 15,12 20,10 C25,8 30,14 40,16"} />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {hydratedCollection.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-[#1C1C1C]/40 rounded-3xl border border-dashed border-white/10">
              <BookOpen className="w-12 h-12 text-slate-700 mb-4" strokeWidth={1.5} />
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">No Sets Logged</h3>
              <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">
                Your portfolio is currently empty. Tap the scanner to capture official box art and populate your value list!
              </p>
              <button
                onClick={() => onNavigate(Screen.SCANNER)}
                className="mt-5 bg-white text-black font-black px-6 py-3 rounded-2xl text-sm flex items-center gap-2"
              >
                Start Scanning <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center px-4 pb-8">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="bg-[#1A1A1A] border border-white/10 w-full max-w-sm rounded-3xl p-8 relative z-10 animate-in slide-in-from-bottom-10 shadow-3xl text-left">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-white">Add Set</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">Set Number</label>
                <input
                  type="text"
                  placeholder="e.g. 10270-1"
                  value={manualSetNum}
                  onChange={(e) => setManualSetNum(e.target.value)}
                  className="w-full bg-[#222] border border-white/10 rounded-2xl px-4 py-4 text-white font-semibold text-sm outline-none focus:border-white/30 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block">Condition</label>
                  <select
                    value={manualCondition}
                    onChange={(e) => setManualCondition(e.target.value as any)}
                    className="w-full bg-[#222] border border-white/10 rounded-2xl px-4 py-4 text-white font-semibold text-sm outline-none"
                  >
                    <option value="sealed">Sealed</option>
                    <option value="used">Used</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block">Purchase Price ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 199.99"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    className="w-full bg-[#222] border border-white/10 rounded-2xl px-4 py-4 text-white font-semibold text-sm outline-none focus:border-white/30 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!manualSetNum.trim()) return;
                  const parsedPrice = parseFloat(manualPrice);
                  const newItem: CollectionItem = {
                    id: `manual_${Date.now()}`,
                    userId: localStorage.getItem('hellobrick_userId') || 'anonymous',
                    setNum: manualSetNum.trim(),
                    condition: manualCondition,
                    purchasePrice: isNaN(parsedPrice) ? 100 : parsedPrice,
                    purchaseDate: new Date().toISOString().split('T')[0],
                    addedAt: new Date().toISOString(),
                    notes: 'Manually logged',
                    itemType: 'set',
                    quantity: 1
                  } as any;
                  const updated = [newItem, ...collection];
                  localStorage.setItem('hellobrick_collection_sets', JSON.stringify(updated));
                  setCollection(updated);
                  setShowAddModal(false);
                  setManualSetNum('');
                  setManualPrice('');
                  confetti({ particleCount: 100, spread: 60, origin: { y: 0.85 }, colors: ['#C9A84C', '#FFFFFF'] });
                }}
                className="w-full bg-white text-black font-black py-4 rounded-2xl text-sm active:scale-95 transition-all shadow-xl mt-2"
              >
                Add to Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
