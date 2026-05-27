import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, LayoutGrid, List, Box, X, Heart, Check, Trash2, ArrowUpRight, TrendingUp, TrendingDown, Star, Sparkles, ChevronRight, User, Plus } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { Screen, CollectionItem } from '../types';
import { mockCollection, mockSets, mockValuations, mockMinifigs, generatePriceHistory } from '../lib/mock-data';
import confetti from 'canvas-confetti';

interface CollectionScreenProps {
    onNavigate: (screen: Screen, params?: any) => void;
    highlightSet?: string;
}

type SortOption = 'value' | 'name' | 'year' | 'gain';
type ViewMode = 'grid' | 'list';
type ActiveTab = 'sets' | 'minifigs';

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ onNavigate, highlightSet }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('sets');
    const [selectedTheme, setSelectedTheme] = useState<string>('All');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('value');
    const [filterCondition, setFilterCondition] = useState<string>('All');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [collection, setCollection] = useState<CollectionItem[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Add manual entry fields
    const [manualAssetType, setManualAssetType] = useState<'set' | 'minifig'>('set');
    const [manualSetNum, setManualSetNum] = useState('');
    const [manualCondition, setManualCondition] = useState<'sealed' | 'used' | 'opened'>('used');
    const [manualPrice, setManualPrice] = useState('');
    const [manualDate, setManualDate] = useState('');
    const [manualNotes, setManualNotes] = useState('');

    const loadCollection = () => {
        const stored = localStorage.getItem('hellobrick_collection_sets');
        if (stored) {
            try {
                setCollection(JSON.parse(stored));
            } catch (e) {
                setCollection(mockCollection);
            }
        } else {
            setCollection(mockCollection);
            localStorage.setItem('hellobrick_collection_sets', JSON.stringify(mockCollection));
        }
    };

    useEffect(() => {
        loadCollection();
    }, []);



    // Hydrate collection items (matching set or minifig metadata + valuations)
    const hydratedCollection = useMemo(() => {
        return collection.map(item => {
            let assetName = '';
            let assetImage = '';
            let assetYear = 0;
            let assetTheme = '';
            let assetPieces = 0;
            let currentUnitVal = 0;
            let valuationObj: any = null;

            if (item.itemType === 'minifig') {
                const minifig = mockMinifigs.find(m => m.figNum === item.setNum);
                if (minifig) {
                    assetName = minifig.name;
                    assetImage = minifig.imageUrl;
                    assetYear = minifig.year;
                    assetTheme = minifig.theme;
                    assetPieces = 1;
                    currentUnitVal = minifig.resaleValue;
                    valuationObj = {
                        setNum: minifig.figNum,
                        sealedValue: minifig.resaleValue,
                        usedValue: minifig.resaleValue,
                        resaleAvg: minifig.resaleValue,
                        sealedChange24h: 1.2,
                        usedChange24h: 1.2,
                        sealedChange7d: 3.4,
                        usedChange7d: 3.4,
                        sealedChange30d: 7.9,
                        usedChange30d: 7.9,
                        rarityScore: minifig.rarityScore,
                        demandScore: minifig.rarityScore,
                        priceHistory: generatePriceHistory(minifig.resaleValue * 0.9, 12, 'up'),
                        lastUpdated: new Date().toISOString()
                    };
                }
            } else {
                const set = mockSets.find(s => s.setNum === item.setNum);
                if (set) {
                    assetName = set.name;
                    assetImage = set.imageUrl;
                    assetYear = set.year;
                    assetTheme = set.theme;
                    assetPieces = set.pieces;
                    const valuation = mockValuations.get(item.setNum);
                    valuationObj = valuation;
                    currentUnitVal = valuation 
                        ? (item.condition === 'sealed' ? valuation.sealedValue : valuation.usedValue)
                        : (set.retailPrice ?? 0);
                }
            }

            const quantity = item.quantity ?? 1;
            const currentTotalVal = currentUnitVal * quantity;
            const costPerUnit = item.purchasePrice ?? currentUnitVal * 0.7;
            const totalCost = costPerUnit * quantity;
            const profit = currentTotalVal - totalCost;
            const profitPct = totalCost > 0 ? (profit / totalCost) * 100 : 0;

            return {
                ...item,
                name: assetName,
                imageUrl: assetImage,
                year: assetYear,
                theme: assetTheme,
                pieces: assetPieces,
                valuation: valuationObj,
                currentValue: currentTotalVal,
                unitValue: currentUnitVal,
                cost: totalCost,
                unitCost: costPerUnit,
                profit,
                profitPct,
                quantity
            };
        });
    }, [collection]);

    useEffect(() => {
        if (highlightSet && hydratedCollection.length > 0) {
            const found = hydratedCollection.find(item => item.setNum === highlightSet);
            if (found) {
                setActiveTab(found.itemType === 'minifig' ? 'minifigs' : 'sets');
                setSelectedItem(found);
            }
        }
    }, [highlightSet, hydratedCollection]);

    // Available themes based on hydrated items in the selected tab
    const availableThemes = useMemo(() => {
        const tabItems = hydratedCollection.filter(item => item.itemType === (activeTab === 'sets' ? 'set' : 'minifig'));
        const themes = new Set<string>();
        tabItems.forEach(item => {
            if (item.theme) themes.add(item.theme);
        });
        return ['All', ...Array.from(themes)];
    }, [hydratedCollection, activeTab]);

    const filteredItems = useMemo(() => {
        let result = hydratedCollection.filter(item => {
            const isCorrectTab = item.itemType === (activeTab === 'sets' ? 'set' : 'minifig');
            if (!isCorrectTab) return false;

            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                                  item.setNum.toLowerCase().includes(search.toLowerCase());
            const matchesCondition = filterCondition === 'All' || item.condition === filterCondition;
            const matchesTheme = selectedTheme === 'All' || item.theme === selectedTheme;
            
            return matchesSearch && matchesCondition && matchesTheme;
        });

        result.sort((a, b) => {
            if (sortBy === 'value') return b.currentValue - a.currentValue;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'year') return b.year - a.year;
            if (sortBy === 'gain') return b.profitPct - a.profitPct;
            return 0;
        });

        return result;
    }, [hydratedCollection, activeTab, search, filterCondition, selectedTheme, sortBy]);

    // Total net worth for ALL tracked items
    const portfolioTotal = useMemo(() => {
        return hydratedCollection.reduce((sum, item) => sum + item.currentValue, 0);
    }, [hydratedCollection]);

    // Update quantity of an asset
    const handleUpdateQuantity = (id: string, newQty: number) => {
        if (newQty <= 0) {
            const updated = collection.filter(item => item.id !== id);
            localStorage.setItem('hellobrick_collection_sets', JSON.stringify(updated));
            setCollection(updated);
            setSelectedItem(null);
        } else {
            const updated = collection.map(item => {
                if (item.id === id) {
                    return { ...item, quantity: newQty };
                }
                return item;
            });
            localStorage.setItem('hellobrick_collection_sets', JSON.stringify(updated));
            setCollection(updated);
            
            // Sync drawer state
            const targetHydrated = hydratedCollection.find(h => h.id === id);
            if (targetHydrated) {
                setSelectedItem({
                    ...targetHydrated,
                    quantity: newQty,
                    currentValue: targetHydrated.unitValue * newQty,
                    cost: targetHydrated.unitCost * newQty
                });
            }
        }
        window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
    };

    // SVG sparkline coordinate builder
    const getSparklinePoints = (history: any[] | undefined, width: number, height: number, condition: string) => {
        if (!history || history.length === 0) return '';
        const values = history.map(h => condition === 'sealed' ? h.sealed : h.used);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const points = history.map((h, i) => {
            const val = condition === 'sealed' ? h.sealed : h.used;
            const x = (i / (history.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    return (
        <div className="flex flex-col h-full bg-[#0D111A] font-sans text-white overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent pointer-events-none z-0" />

            <TopBar currentScreen={Screen.COLLECTION} onNavigate={onNavigate} />

            <main className="flex-1 px-6 pt-5 pb-28 relative z-10 overflow-y-auto no-scrollbar overscroll-contain">
                
                {/* 1. PORTFOLIO WORTH TITLE */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NET PORTFOLIO VALUE</p>
                        <h2 className="text-3xl font-mono font-bold text-white mt-1">
                            ${portfolioTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-xl border transition-all ${viewMode === 'grid' ? 'bg-[#C9A84C] text-[#0D111A] border-[#C9A84C]' : 'bg-[#161A2B] text-slate-500 border-[#2A3144]'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-xl border transition-all ${viewMode === 'list' ? 'bg-[#C9A84C] text-[#0D111A] border-[#C9A84C]' : 'bg-[#161A2B] text-slate-500 border-[#2A3144]'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 2. DUAL ASSET TAB SELECTOR (Sets + Minifigures) */}
                <div className="bg-[#161A2B] p-1 rounded-2xl border border-[#2A3144]/65 flex mb-5">
                    <button
                        onClick={() => {
                            setActiveTab('sets');
                            setSelectedTheme('All');
                        }}
                        className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                            activeTab === 'sets' ? 'bg-[#C9A84C] text-[#0D111A]' : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Sets ({hydratedCollection.filter(i => i.itemType === 'set').length})
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('minifigs');
                            setSelectedTheme('All');
                        }}
                        className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                            activeTab === 'minifigs' ? 'bg-[#C9A84C] text-[#0D111A]' : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Minifigures ({hydratedCollection.filter(i => i.itemType === 'minifig').length})
                    </button>
                </div>

                {/* 3. HORIZONTAL THEME BROWSER CAROUSEL */}
                {availableThemes.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
                        {availableThemes.map(theme => (
                            <button
                                key={theme}
                                onClick={() => setSelectedTheme(theme)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                                    selectedTheme === theme 
                                        ? 'bg-blue-600 border-blue-500 text-white' 
                                        : 'bg-[#161A2B] border-[#2A3144] text-slate-400 hover:border-slate-600'
                                }`}
                            >
                                {theme}
                            </button>
                        ))}
                    </div>
                )}

                {/* 4. ACTIONS FOR ENTRY */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <button
                        onClick={() => onNavigate(Screen.SCANNER)}
                        className="bg-[#C9A84C] text-[#0D111A] font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase tracking-wider shadow-lg"
                    >
                        <Search className="w-4 h-4" strokeWidth={2.5} />
                        Scan Box
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#161A2B] border border-[#2A3144] hover:bg-[#1E233B] text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase tracking-wider shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Add Manually
                    </button>
                </div>

                {/* 5. SEARCH ENGINE BAR */}
                <div className="relative mb-5">
                    <div className="bg-[#161A2B] rounded-2xl p-1.5 flex items-center border border-[#2A3144] focus-within:border-[#C9A84C]/50 transition-colors">
                        <div className="flex-1 flex items-center px-3 gap-3">
                            <Search className="w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder={`Search in ${activeTab === 'sets' ? 'Sets' : 'Minifigures'}...`}
                                className="bg-transparent border-none outline-none text-white font-semibold text-xs py-3 w-full placeholder:text-slate-600"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 rounded-xl transition-all ${showFilters ? 'bg-[#C9A84C] text-[#0D111A] shadow-md' : 'text-slate-500 bg-[#1E233B]/50'}`}
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Filter details */}
                {showFilters && (
                    <div className="bg-[#161A2B] rounded-3xl p-5 border border-[#2A3144] shadow-2xl mb-5 space-y-5 animate-in slide-in-from-top-4 duration-200">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Sort Metrics</h4>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'value', label: 'Valuation' },
                                    { id: 'name', label: 'Name' },
                                    { id: 'year', label: 'Release' },
                                    { id: 'gain', label: 'Appreciation' },
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSortBy(opt.id as SortOption)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${sortBy === opt.id ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0D111A]' : 'bg-[#1E233B]/50 text-slate-400 border-[#2A3144]'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Condition</h4>
                            <div className="flex gap-2">
                                {['All', 'sealed', 'used', 'opened'].map((cond) => (
                                    <button
                                        key={cond}
                                        onClick={() => setFilterCondition(cond)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${filterCondition === cond ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0D111A]' : 'bg-[#1E233B]/50 text-slate-400 border-[#2A3144]'}`}
                                    >
                                        {cond}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. GRID OR LIST RENDER */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 gap-4">
                        {filteredItems.map(item => {
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className="bg-[#161A2B] rounded-3xl p-4 border border-[#2A3144]/60 active:scale-[0.97] transition-all group flex flex-col items-center relative"
                                >
                                    <div className="w-full aspect-square flex items-center justify-center mb-4 relative bg-[#0D111A] rounded-2xl p-2 border border-[#2A3144]/30">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-20 h-20 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${
                                            item.condition === 'sealed' 
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                                : item.condition === 'used' 
                                                    ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30' 
                                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                        }`}>
                                            {item.condition}
                                        </span>
                                        {item.quantity > 1 && (
                                            <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-blue-500 text-white rounded-full text-[8px] font-mono font-black border border-blue-400">
                                                x{item.quantity}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-full text-center px-1">
                                        <h4 className="font-black text-white text-xs truncate leading-tight mb-1">{item.name}</h4>
                                        <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-500 font-bold">
                                            <span>#{item.setNum.split('-')[0]}</span>
                                            <span>·</span>
                                            <span className="text-emerald-400 font-black">${item.currentValue.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* FINE TEXTURE INDEX TABLE LIST VIEW */
                    <div className="bg-[#161A2B] rounded-3xl border border-[#2A3144] overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#2A3144] bg-[#1E233B]/30 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        <th className="py-4 px-5">Asset</th>
                                        <th className="py-4 px-4 text-center">Qty</th>
                                        <th className="py-4 px-4">Cond</th>
                                        <th className="py-4 px-5 text-right">Appraisal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2A3144]/40 font-mono text-xs">
                                    {filteredItems.map(item => {
                                        return (
                                            <tr
                                                key={item.id}
                                                onClick={() => setSelectedItem(item)}
                                                className="active:bg-[#1E233B]/50 transition-colors"
                                            >
                                                <td className="py-4 px-5 font-sans">
                                                    <div className="font-black text-white text-xs truncate max-w-[130px]">{item.name}</div>
                                                    <div className="text-[9px] font-mono text-slate-500 mt-0.5">#{item.setNum.split('-')[0]}</div>
                                                </td>
                                                <td className="py-4 px-4 text-center text-slate-300 font-black">
                                                    x{item.quantity}
                                                </td>
                                                <td className="py-4 px-4 font-black">
                                                    <span className={`text-[8px] uppercase tracking-wider font-bold ${
                                                        item.condition === 'sealed' ? 'text-emerald-400' : item.condition === 'used' ? 'text-[#C9A84C]' : 'text-rose-400'
                                                    }`}>
                                                        {item.condition}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-right font-black text-emerald-400">${item.currentValue.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-[#161A2B]/40 rounded-3xl border border-dashed border-[#2A3144]">
                        <Box className="w-12 h-12 text-slate-700 mb-4" strokeWidth={1.5} />
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Empty Inventory</h3>
                        <p className="text-xs text-slate-600 mt-2 font-bold leading-normal">
                            No assets sourced under this sub-tab query. Try scanning an item or adding manually!
                        </p>
                    </div>
                )}
            </main>

            {/* 7. DETAILED BOTTOM SLIDE-UP DRAWER */}
            {selectedItem && selectedItem.valuation && (
                <div className="fixed inset-0 z-[99999] flex items-end justify-center px-4 pb-8">
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md animate-fade-in" onClick={() => setSelectedItem(null)} />
                    <div className="bg-[#0A0F1E] border border-white/10 w-full max-w-md rounded-[42px] p-8 relative z-10 animate-in slide-in-from-bottom-10 shadow-3xl overflow-hidden">
                        
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 blur-3xl rounded-full" />
                        
                        <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-2">
                            <X className="w-5 h-5" />
                        </button>

                        {/* Thumb & Rarity */}
                        <div className="flex flex-col items-center mb-5">
                            <div className="w-40 h-40 bg-white/[0.02] rounded-[32px] flex items-center justify-center mb-4 relative border border-white/5 p-3">
                                <img
                                    src={selectedItem.imageUrl}
                                    className="w-28 h-28 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]"
                                    alt={selectedItem.name}
                                    onError={(e) => {
                                        const num = selectedItem.setNum;
                                        const isMinifig = selectedItem.itemType === 'minifig';
                                        e.currentTarget.src = isMinifig 
                                            ? `https://cdn.rebrickable.com/media/parts/ldraw/15/973px90c01.png`
                                            : `https://cdn.rebrickable.com/media/sets/${num}.jpg`;
                                        e.currentTarget.onerror = null;
                                    }}
                                />
                                {selectedItem.year < 2022 && (
                                    <span className="absolute top-3 right-3 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg">
                                        Retired
                                    </span>
                                )}
                            </div>
                            
                            <div className="w-full text-center px-2">
                                <h3 className="text-xl font-black text-white leading-tight tracking-tight">{selectedItem.name}</h3>
                                <p className="text-[11px] font-mono text-slate-500 mt-1 font-bold">
                                    #{selectedItem.setNum.split('-')[0]} · {selectedItem.theme} · {selectedItem.year} · {selectedItem.pieces} Pieces
                                </p>
                            </div>
                        </div>

                        {/* Valuation Breakdown Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-5">
                            <div className="bg-[#161A2B] border border-[#2A3144]/75 rounded-2xl p-3 text-center">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Sealed</span>
                                <span className="text-xs font-mono font-black text-white mt-1 block">${selectedItem.valuation.sealedValue.toFixed(2)}</span>
                                <span className="text-[8px] font-mono text-emerald-400 font-bold block mt-0.5">+{selectedItem.valuation.sealedChange30d}%</span>
                            </div>
                            <div className="bg-[#161A2B] border border-[#2A3144]/75 rounded-2xl p-3 text-center">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Used</span>
                                <span className="text-xs font-mono font-black text-white mt-1 block">${selectedItem.valuation.usedValue.toFixed(2)}</span>
                                <span className="text-[8px] font-mono text-emerald-400 font-bold block mt-0.5">+{selectedItem.valuation.usedChange30d}%</span>
                            </div>
                            <div className="bg-[#161A2B] border border-[#2A3144]/75 rounded-2xl p-3 text-center text-slate-300">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Avg Resale</span>
                                <span className="text-xs font-mono font-black text-[#C9A84C] mt-1 block">${selectedItem.valuation.resaleAvg.toFixed(2)}</span>
                                <span className="text-[8px] text-slate-500 font-bold block mt-0.5">ESTIMATED</span>
                            </div>
                        </div>

                        {/* Interactive Quantity Adjuster Counter */}
                        <div className="bg-[#161A2B] border border-[#2A3144]/60 p-4 rounded-2xl mb-5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Vault Quantity</span>
                                <span className="text-[9px] font-mono text-slate-500 font-bold mt-0.5 block">
                                    Total Value: ${(selectedItem.unitValue * selectedItem.quantity).toFixed(2)}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-3.5 bg-[#0D111A] border border-white/5 rounded-xl p-1">
                                <button
                                    onClick={() => handleUpdateQuantity(selectedItem.id, selectedItem.quantity - 1)}
                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A84C] font-black text-lg active:scale-90 transition-transform"
                                >
                                    -
                                </button>
                                <span className="font-mono text-sm font-black text-white w-5 text-center">
                                    {selectedItem.quantity}
                                </span>
                                <button
                                    onClick={() => handleUpdateQuantity(selectedItem.id, selectedItem.quantity + 1)}
                                    className="w-8 h-8 rounded-lg bg-[#C9A84C] flex items-center justify-center text-[#0D111A] font-black text-lg active:scale-90 transition-transform"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Sparkline chart */}
                        <div className="bg-[#161A2B]/40 border border-[#2A3144]/60 rounded-2xl p-4 mb-5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">12-Month Sparkline Appreciation</span>
                                <span className="text-[8px] font-black text-[#C9A84C] uppercase font-mono">Demand {selectedItem.valuation.demandScore}/10</span>
                            </div>
                            <div className="w-full h-12 relative">
                                <svg className="w-full h-full" viewBox="0 0 320 60" preserveAspectRatio="none">
                                    <path
                                        d={getSparklinePoints(selectedItem.valuation.priceHistory, 320, 60, selectedItem.condition)}
                                        fill="none"
                                        stroke="#C9A84C"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Removal */}
                        <button
                            onClick={() => handleUpdateQuantity(selectedItem.id, 0)}
                            className="w-full py-4 px-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Purge Asset From Vault
                        </button>
                    </div>
                </div>
            )}

            {/* 8. MANUAL ADD MODAL OVERHAUL */}
            {showAddModal && (
                <div className="fixed inset-0 z-[99999] flex items-end justify-center px-4 pb-8">
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
                    <div className="bg-[#0A1628] border border-white/10 w-full max-w-lg rounded-[36px] p-8 relative z-10 animate-in slide-in-from-bottom-10 shadow-3xl text-left">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Manual Entry</h3>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Add custom sets or minifigs</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Segment asset type selector */}
                        <div className="bg-[#161A2B] p-1 rounded-xl border border-[#2A3144] flex mb-5">
                            <button
                                onClick={() => {
                                    setManualAssetType('set');
                                    setManualSetNum('');
                                }}
                                className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                    manualAssetType === 'set' ? 'bg-[#C9A84C] text-[#0D111A]' : 'text-slate-400'
                                }`}
                            >
                                LEGO Set
                            </button>
                            <button
                                onClick={() => {
                                    setManualAssetType('minifig');
                                    setManualSetNum('');
                                }}
                                className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                    manualAssetType === 'minifig' ? 'bg-[#C9A84C] text-[#0D111A]' : 'text-slate-400'
                                }`}
                            >
                                Minifigure
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5 block">
                                    Catalog Item Select
                                </label>
                                <select
                                    value={manualSetNum}
                                    onChange={(e) => setManualSetNum(e.target.value)}
                                    className="w-full bg-[#161A2B] border border-[#2A3144] rounded-2xl px-4 py-4 text-white font-semibold text-xs outline-none focus:border-[#C9A84C] transition-all"
                                >
                                    <option value="" disabled>Select {manualAssetType === 'set' ? 'set' : 'minifig'}...</option>
                                    {manualAssetType === 'set' ? (
                                        mockSets.map(s => (
                                            <option key={s.setNum} value={s.setNum} className="bg-[#0D111A]">
                                                #{s.setNum.split('-')[0]} · {s.name}
                                            </option>
                                        ))
                                    ) : (
                                        mockMinifigs.map(m => (
                                            <option key={m.figNum} value={m.figNum} className="bg-[#0D111A]">
                                                #{m.figNum} · {m.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5 block">Condition</label>
                                    <select
                                        value={manualCondition}
                                        onChange={(e) => setManualCondition(e.target.value as any)}
                                        className="w-full bg-[#161A2B] border border-[#2A3144] rounded-2xl px-4 py-4 text-white font-semibold text-xs outline-none focus:border-[#C9A84C] transition-all"
                                    >
                                        <option value="sealed" className="bg-[#0D111A]">Sealed</option>
                                        <option value="used" className="bg-[#0D111A]">Used</option>
                                        <option value="opened" className="bg-[#0D111A]">Opened</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5 block">Purchase Price ($)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 79.99"
                                        value={manualPrice}
                                        onChange={(e) => setManualPrice(e.target.value)}
                                        className="w-full bg-[#161A2B] border border-[#2A3144] rounded-2xl px-4 py-4 text-white font-semibold text-xs outline-none focus:border-[#C9A84C] transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (!manualSetNum) return;
                                    const parsedPrice = parseFloat(manualPrice);
                                    
                                    // Default initial condition value lookup
                                    let unitVal = 0;
                                    if (manualAssetType === 'minifig') {
                                        const found = mockMinifigs.find(m => m.figNum === manualSetNum);
                                        if (found) unitVal = found.resaleValue;
                                    } else {
                                        const found = mockValuations.get(manualSetNum);
                                        if (found) unitVal = manualCondition === 'sealed' ? found.sealedValue : found.usedValue;
                                    }

                                    const newItem: CollectionItem = {
                                        id: `manual_${Date.now()}`,
                                        userId: 'user-1',
                                        setNum: manualSetNum,
                                        condition: manualCondition,
                                        purchasePrice: isNaN(parsedPrice) ? unitVal * 0.7 : parsedPrice,
                                        purchaseDate: manualDate || new Date().toISOString().split('T')[0],
                                        addedAt: new Date().toISOString(),
                                        notes: manualNotes || 'Manually logged in inventory',
                                        itemType: manualAssetType,
                                        quantity: 1
                                    };

                                    const updated = [newItem, ...collection];
                                    localStorage.setItem('hellobrick_collection_sets', JSON.stringify(updated));
                                    setCollection(updated);
                                    setShowAddModal(false);
                                    
                                    // reset fields
                                    setManualSetNum('');
                                    setManualPrice('');
                                    setManualNotes('');

                                    confetti({ particleCount: 120, spread: 80, origin: { y: 0.8 }, colors: ['#C9A84C', '#FFFFFF', '#3B5998'] });
                                }}
                                className="w-full bg-[#C9A84C] text-[#0D111A] font-black py-5 rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.15em] mt-4 shadow-xl"
                            >
                                Secure to Vault
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
