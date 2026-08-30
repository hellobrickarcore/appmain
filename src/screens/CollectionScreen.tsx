import React, { useState, useMemo, useEffect } from 'react';
import { Plus, X, TrendingUp, Trash2, ChevronRight, Eye, EyeOff, ArrowUpRight, Search, Package, BarChart2, Filter, Heart } from 'lucide-react';
import { Screen, CollectionItem } from '../types';
import { mockSets, mockValuations, mockMinifigs } from '../lib/mock-data';
import { legoDatabase } from '../lib/legoDatabase';
import { valuationService } from '../services/valuationService';
import { Logo } from '../components/Logo';
import confetti from 'canvas-confetti';

interface CollectionScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  highlightSet?: string;
}

const THEME_COLORS: Record<string, string> = {
  'Star Wars': '#FF7A30',
  'Technic': '#6366F1',
  'Creator': '#10B981',
  'City': '#F59E0B',
  'Harry Potter': '#8B5CF6',
  'Marvel': '#EF4444',
  'Ideas': '#06B6D4',
  'Icons': '#EC4899',
  'Custom': '#71717A',
  'Other': '#71717A',
};

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ onNavigate }) => {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualSetNum, setManualSetNum] = useState('');
  const [manualCondition, setManualCondition] = useState<'sealed' | 'used'>('sealed');
  const [manualPrice, setManualPrice] = useState('');
  const [sets, setSets] = React.useState<any[]>([]);
  const [valuationsMap, setValuationsMap] = React.useState(new Map<string, any>());
  const [hideValue, setHideValue] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const loadCollection = async () => {
    try {
      let items = await valuationService.getCollectionItems();
      if (!items || items.length === 0) {
        const stored = localStorage.getItem('hellobrick_collection_sets');
        if (stored) {
          try { items = JSON.parse(stored); } catch {}
        }
      }
      if (!items) items = [];
      setCollection(items);
      const fetchedSets = mockSets;
      const valuations = new Map(Object.entries(mockValuations));
      setSets(fetchedSets);
      setValuationsMap(valuations);
    } catch (e) {
      const stored = localStorage.getItem('hellobrick_collection_sets');
      try { setCollection(stored ? JSON.parse(stored) : []); } catch { setCollection([]); }
      setSets(mockSets);
      setValuationsMap(new Map(Object.entries(mockValuations)));
    }
  };

  useEffect(() => { loadCollection(); }, []);
  useEffect(() => {
    const h = () => loadCollection();
    window.addEventListener('hellobrick:collection-updated', h);
    return () => window.removeEventListener('hellobrick:collection-updated', h);
  }, []);

  const hydratedCollection = useMemo(() => {
    if (!collection.length) return [];
    return collection.map((item) => {
      const dbItem = legoDatabase.findById(item.setNum);
      const set = dbItem ? {
        id: dbItem.id,
        name: dbItem.name,
        setNum: dbItem.code,
        retailPrice: dbItem.retailPrice,
        imageUrl: dbItem.imageUrl,
        theme: dbItem.theme,
        year: dbItem.year,
        isRetired: dbItem.isRetired
      } : {
        id: `custom-${item.setNum}`,
        name: `Collectible #${item.setNum}`,
        setNum: item.setNum,
        retailPrice: item.purchasePrice || 49.99,
        imageUrl: `https://images.brickset.com/sets/images/${item.setNum.includes('-') ? item.setNum : item.setNum + '-1'}.jpg`,
        theme: 'Custom',
        year: 2023,
        isRetired: false
      };

      const val = dbItem ? {
        sealedValue: dbItem.sealedPrice,
        usedValue: dbItem.usedPrice,
        sealedChange30d: dbItem.growth30D,
        usedChange30d: dbItem.growth30D * 0.8
      } : {
        sealedValue: (set.retailPrice || 99) * 1.2,
        usedValue: (set.retailPrice || 99) * 0.8,
        sealedChange30d: 3.5,
        usedChange30d: 2.1
      };

      const quantity = (item as any).quantity ?? 1;
      const currentValue = (item.condition === 'sealed' ? val.sealedValue : val.usedValue) * quantity;
      const purchaseCost = (item.purchasePrice || (set.retailPrice || 100) * 0.8) * quantity;
      const returnVal = currentValue - purchaseCost;
      const returnPct = purchaseCost > 0 ? (returnVal / purchaseCost) * 100 : 0;
      return { ...item, set, val, currentValue, purchaseCost, returnVal, returnPct };
    });
  }, [collection]);

  const filteredCollection = useMemo(() =>
    search.trim()
      ? hydratedCollection.filter(i =>
          i.set.name?.toLowerCase().includes(search.toLowerCase()) ||
          i.setNum?.toLowerCase().includes(search.toLowerCase()))
      : hydratedCollection,
  [hydratedCollection, search]);

  const totalValue  = useMemo(() => hydratedCollection.reduce((s, i) => s + i.currentValue, 0), [hydratedCollection]);
  const totalCost   = useMemo(() => hydratedCollection.reduce((s, i) => s + i.purchaseCost, 0), [hydratedCollection]);
  const totalReturn = useMemo(() => totalValue - totalCost, [totalValue, totalCost]);
  const returnPct   = useMemo(() => totalCost > 0 ? (totalReturn / totalCost) * 100 : 0, [totalReturn, totalCost]);
  const isEmpty = hydratedCollection.length === 0;

  // Compute real theme distribution from actual collection
  const themeDistribution = useMemo(() => {
    if (isEmpty) return [];
    const themeCounts: Record<string, number> = {};
    hydratedCollection.forEach(item => {
      const theme = item.set?.theme || 'Other';
      themeCounts[theme] = (themeCounts[theme] || 0) + item.currentValue;
    });
    const total = Object.values(themeCounts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([label, val]) => ({
        label,
        pct: Math.round((val / total) * 100),
        color: THEME_COLORS[label] || '#71717A',
      }));
  }, [hydratedCollection, isEmpty]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = collection.filter(item => item.id !== id);
    localStorage.setItem('hellobrick_collection_sets', JSON.stringify(updated));
    setCollection(updated);
  };

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const totalPieces = useMemo(() =>
    hydratedCollection.reduce((s, i) => s + ((i.set?.numParts || 0) * ((i as any).quantity ?? 1)), 0),
  [hydratedCollection]);

  const statsRow = [
    { label: 'Sets',    value: isEmpty ? '0' : hydratedCollection.length.toString(),               icon: '📦' },
    { label: 'Pieces',  value: isEmpty ? '—' : totalPieces > 0 ? totalPieces.toLocaleString() : '—', icon: '🧱' },
    { label: 'Invested', value: isEmpty ? '—' : hideValue ? '••' : fmt(totalCost),                  icon: '💵' },
    { label: 'ROI',     value: isEmpty ? '—' : `${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(1)}%`, icon: '📈' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] font-sans text-gray-900 overflow-hidden select-none">
      <style>{`
        @keyframes col-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes col-val {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        .col-r0 { animation: col-in  0.4s 0.05s ease-out both; }
        .col-r1 { animation: col-val 0.5s 0.1s  cubic-bezier(0.34,1.56,0.64,1) both; }
        .col-r2 { animation: col-in  0.4s 0.18s ease-out both; }
        .col-r3 { animation: col-in  0.4s 0.26s ease-out both; }
        .col-r4 { animation: col-in  0.4s 0.34s ease-out both; }
        .col-r5 { animation: col-in  0.4s 0.42s ease-out both; }
      `}</style>

      {/* ─── Header ─── */}
      {mounted && (
        <div className="col-r0 px-6 pt-[max(env(safe-area-inset-top),2.8rem)] pb-3 flex items-center justify-between shrink-0 z-10">
          <Logo size="sm" light={false} />
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(16,185,129,0.35)] active:scale-90 transition-transform text-white"
          >
            <Plus className="w-5 h-5 text-white stroke-[2.5px]" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar pb-28">

        {/* ─── Value Hero ─── */}
        {mounted && (
          <div className="col-r1 px-6 mb-5">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">PORTFOLIO DASHBOARD</p>
            <div className="flex items-end gap-3 mb-1">
              <div className="text-[46px] font-black text-gray-900 tracking-tight leading-none">
                {hideValue ? '••••••' : fmt(isEmpty ? 0 : totalValue)}
              </div>
              <button onClick={() => setHideValue(!hideValue)} className="mb-2 text-gray-400 active:opacity-50">
                {hideValue ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-black ${returnPct >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                <ArrowUpRight className="w-3 h-3" />
                {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(1)}%
              </div>
              <span className="text-gray-400 text-[12px] font-medium">
                {totalReturn >= 0 ? '+' : ''}{fmt(isEmpty ? 0 : totalReturn)} total return
              </span>
            </div>
          </div>
        )}

        {/* ─── Stats Row ─── */}
        {mounted && (
          <div className="col-r2 px-6 mb-5">
            <div className="grid grid-cols-4 gap-2">
              {statsRow.map((s, i) => (
                <div key={i} className="bg-white shadow-sm rounded-2xl px-2 py-3 border border-gray-100 flex flex-col items-center gap-1">
                  <span className="text-base">{s.icon}</span>
                  <p className="text-[13px] font-black text-gray-900">{s.value}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider text-center">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Value Distribution mini bar ─── */}
        {mounted && !isEmpty && (
          <div className="col-r3 px-6 mb-5">
            <div className="bg-white shadow-sm rounded-[20px] border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">BY THEME</p>
                <BarChart2 className="w-4 h-4 text-zinc-700" />
              </div>
              {/* Bar */}
              <div className="flex w-full h-2.5 rounded-full overflow-hidden gap-0.5 mb-3">
                {themeDistribution.map((d, i) => (
                  <div key={i} className="rounded-full transition-all" style={{ width: `${d.pct}%`, background: d.color }} />
                ))}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {themeDistribution.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-[10px] font-semibold text-gray-400">{d.label} {d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Quick Actions ─── */}
        {mounted && (
          <div className="col-r3 px-6 mb-5">
            <div className="flex gap-2.5">
              <button
                onClick={() => onNavigate(Screen.SCANNER)}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-2xl py-3 font-black text-[12px] active:scale-95 transition-transform shadow-[0_4px_15px_rgba(16,185,129,0.25)]"
              >
                <Plus className="w-4 h-4 text-white" /> Scan Set
              </button>
              <button
                onClick={() => onNavigate(Screen.BROWSE)}
                className="flex-1 flex items-center justify-center gap-2 bg-white shadow-sm border border-gray-200/80 text-gray-900 rounded-2xl py-3 font-black text-[12px] active:scale-95 transition-transform"
              >
                <Search className="w-3.5 h-3.5 text-emerald-600" /> Browse
              </button>
              <button
                onClick={() => onNavigate(Screen.WISHLIST)}
                className="flex-1 flex items-center justify-center gap-2 bg-white shadow-sm border border-gray-200/80 text-gray-900 rounded-2xl py-3 font-black text-[12px] active:scale-95 transition-transform"
              >
                <Heart className="w-3.5 h-3.5 text-pink-500" fill="#EC4899" /> Wishlist
              </button>
            </div>
          </div>
        )}

        {/* ─── Search + View Toggle ─── */}
        {mounted && !isEmpty && (
          <div className="col-r4 px-6 mb-4 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your collection..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white shadow-sm border border-gray-200 rounded-2xl h-11 pl-10 pr-4 text-gray-900 text-[13px] font-medium placeholder:text-gray-400 outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="w-11 h-11 bg-white shadow-sm border border-gray-200 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
            >
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}

        {/* ─── Portfolio Grid / List ─── */}
        {mounted && (
          <div className="col-r5 px-6 mb-4">
            {isEmpty ? (
              // Empty state
              <div className="bg-white shadow-sm rounded-[24px] border border-dashed border-gray-200 p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-[18px] font-black text-gray-900 mb-2">No Sets Added Yet</h3>
                <p className="text-gray-500 text-[13px] font-medium mb-6 leading-relaxed max-w-[260px]">
                  Build your collection by scanning boxes, minifigures, or searching the database catalog.
                </p>
                <div className="flex flex-col w-full gap-2.5 max-w-[240px]">
                  <button
                    onClick={() => onNavigate(Screen.SCANNER)}
                    className="w-full bg-emerald-500 text-white py-3.5 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(16,185,129,0.3)] active:scale-95 transition-transform"
                  >
                    <Plus className="w-5 h-5 text-white" />
                    Scan Sets with AR
                  </button>
                  <button
                    onClick={() => onNavigate(Screen.BROWSE)}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 py-3 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Search className="w-4 h-4 text-gray-600" />
                    Browse 20,000+ Sets
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              // ── Grid View ──
              <div className="grid grid-cols-2 gap-3">
                {filteredCollection.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: item.set.setNum })}
                    className="bg-white shadow-sm border border-white/8 rounded-[22px] p-3 cursor-pointer active:scale-[0.97] transition-all relative group overflow-hidden"
                  >
                    {/* Delete btn */}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-red-500/20 text-red-400 border border-red-500/30 p-1.5 rounded-xl transition-all z-10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    {/* Image */}
                    <div className="w-full h-[90px] bg-[#F5F5F7] rounded-[14px] flex items-center justify-center overflow-hidden mb-3">
                      <img
                        src={`https://images.brickset.com/sets/images/${item.set.setNum}.jpg`}
                        alt={item.set.name}
                        className="w-full h-full object-contain p-2"
                        onError={e => {
                          const el = e.currentTarget;
                          if (!el.dataset.fallback) { 
                            el.dataset.fallback = '1'; 
                            el.src = `https://cdn.rebrickable.com/media/sets/${item.set.setNum}.jpg`; 
                          }
                          else if (el.dataset.fallback === '1') { 
                            el.dataset.fallback = '2'; 
                            el.src = item.set.imageUrl || ''; 
                          }
                        }}
                      />
                    </div>

                    {/* Name */}
                    <p className="text-gray-500 text-[10px] font-medium truncate mb-1 leading-tight">
                      #{item.set.setNum?.split('-')[0]} · {item.condition}
                    </p>
                    <p className="text-gray-900 text-[12px] font-bold truncate mb-2">{item.set.name || `Set ${idx + 1}`}</p>

                    {/* Value + trend */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-black text-[15px]">
                        ${item.currentValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                      <div className={`flex items-center gap-0.5 text-[10px] font-black ${item.returnPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        <ArrowUpRight className="w-3 h-3" />
                        {item.returnPct >= 0 ? '+' : ''}{item.returnPct.toFixed(1)}%
                      </div>
                    </div>

                    {/* Sparkline */}
                    <svg viewBox="0 0 60 20" className="w-full h-4 mt-2" fill="none">
                      <path
                        d={item.returnVal >= 0
                          ? 'M0,18 C15,16 25,10 35,8 C45,6 52,3 60,2'
                          : 'M0,4 C15,6 25,12 35,14 C45,16 52,17 60,18'}
                        stroke={item.returnVal >= 0 ? '#10B981' : '#EF4444'}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            ) : (
              // ── List View ──
              <div className="space-y-2">
                {filteredCollection.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: item.set.setNum })}
                    className="bg-white shadow-sm border border-white/8 rounded-2xl px-4 py-3.5 flex items-center gap-4 cursor-pointer active:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-[#F5F5F7] rounded-xl overflow-hidden shrink-0 p-1">
                      <img
                        src={`https://images.brickset.com/sets/images/${item.set.setNum}.jpg`}
                        alt={item.set.name}
                        className="w-full h-full object-contain"
                        onError={e => {
                          const el = e.currentTarget;
                          if (!el.dataset.fallback) {
                            el.dataset.fallback = '1';
                            el.src = `https://cdn.rebrickable.com/media/sets/${item.set.setNum}.jpg`;
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-gray-900 truncate">{item.set.name || `Set ${idx + 1}`}</p>
                      <p className="text-[10px] text-gray-400 font-medium">#{item.set.setNum?.split('-')[0]} · {item.condition}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-black text-gray-900">${item.currentValue.toFixed(0)}</p>
                      <p className={`text-[10px] font-bold ${item.returnPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.returnPct >= 0 ? '+' : ''}{item.returnPct.toFixed(1)}%
                      </p>
                    </div>
                    <button onClick={e => handleDelete(item.id, e)} className="text-zinc-700 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Manual Add Modal ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center px-4 pb-8">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="bg-white shadow-sm border border-gray-200 w-full max-w-sm rounded-[28px] p-7 relative z-10 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-black text-gray-900">Add Set</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 bg-white/6 rounded-full flex items-center justify-center text-gray-500 border border-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Set Number</label>
                <input
                  type="text"
                  placeholder="e.g. 10270-1"
                  value={manualSetNum}
                  onChange={e => setManualSetNum(e.target.value)}
                  className="w-full bg-[#F5F5F7] border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-semibold text-[13px] outline-none focus:border-emerald-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Condition</label>
                  <select
                    value={manualCondition}
                    onChange={e => setManualCondition(e.target.value as any)}
                    className="w-full bg-[#F5F5F7] border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-semibold text-[13px] outline-none"
                  >
                    <option value="sealed">Sealed</option>
                    <option value="used">Used</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Price ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 199.99"
                    value={manualPrice}
                    onChange={e => setManualPrice(e.target.value)}
                    className="w-full bg-[#F5F5F7] border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-semibold text-[13px] outline-none focus:border-emerald-500 transition-all placeholder:text-gray-400"
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
                    quantity: 1,
                  } as any;
                  const updated = [newItem, ...collection];
                  localStorage.setItem('hellobrick_collection_sets', JSON.stringify(updated));
                  setCollection(updated);
                  setShowAddModal(false);
                  setManualSetNum('');
                  setManualPrice('');
                  confetti({ particleCount: 120, spread: 70, origin: { y: 0.8 }, colors: ['#10B981', '#34D399', '#FFFFFF'] });
                }}
                className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl text-[14px] active:scale-95 transition-all shadow-[0_8px_25px_rgba(16,185,129,0.35)] mt-1"
              >
                Add to Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
