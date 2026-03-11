// @ts-nocheck

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Layers, Box, Hexagon, X, Share2, ArrowUpDown, Palette } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { ZoomableImageViewer } from '../components/ZoomableImageViewer';
import { Screen, Brick, LegoSet } from '../types';
import { CATEGORIES } from '../constants';
import { suggestionEngine } from '../services/suggestionEngine';

interface CollectionScreenProps {
    onNavigate: (screen: Screen) => void;
}

type SortOption = 'name' | 'count' | 'category';

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ onNavigate }) => {
    const [viewMode, setViewMode] = useState<'PARTS' | 'SETS'>('PARTS');
    const [activeCategory, setActiveCategory] = useState('All');
    const [search, setSearch] = useState('');

    // Filtering & Sorting State
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('count');
    const [filterColor, setFilterColor] = useState<string>('All');

    const [selectedBrick, setSelectedBrick] = useState<Brick | null>(null);
    const [selectedSet, setSelectedSet] = useState<LegoSet | null>(null);
    const [realCollection, setRealCollection] = useState<Brick[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    // Load collection from backend or localStorage
    const loadCollection = async () => {
        try {
            const getApiUrl = () => {
                const isNative = window.location.protocol === 'capacitor:';
                if (isNative) return 'http://192.168.1.217:3003/api';
                return '/api/dataset';
            };

            // ALWAYS Load from localStorage first for instant UI response
            const stored = localStorage.getItem('hellobrick_collection');
            let localBricks = [];
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    localBricks = parsed.bricks || [];
                    setRealCollection(localBricks);
                } catch (e) { }
            }

            const response = await fetch(`${getApiUrl()}/collection/get?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                const remoteBricks = data.bricks || [];

                // If remote has more bricks or different ones, merge or prefer remote if it seems more complete
                // But generally trust local since it was just updated by scanner
                if (remoteBricks.length > localBricks.length) {
                    setRealCollection(remoteBricks);
                }
            }
        } catch (error) {
            console.error('Error loading collection:', error);
            // Fallback to localStorage
            const stored = localStorage.getItem('hellobrick_collection');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setRealCollection(parsed.bricks || []);
                } catch (e) {
                    console.error('Error parsing stored collection:', e);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCollection();

        // Listen for collection updates from scanner
        const handleCollectionUpdate = () => {
            loadCollection();
        };

        window.addEventListener('hellobrick:collection-updated', handleCollectionUpdate);

        return () => {
            window.removeEventListener('hellobrick:collection-updated', handleCollectionUpdate);
        };
    }, []);

    // Derive available colors from collection
    const availableColors = useMemo(() => {
        const collection = realCollection.length > 0 ? realCollection : [];
        const colors = new Set(collection.map(b => b.color).filter(Boolean));
        return ['All', ...Array.from(colors)];
    }, [realCollection]);

    const filteredBricks = useMemo(() => {
        const collection = realCollection.length > 0 ? realCollection : [];
        let result = collection.filter(brick =>
            (activeCategory === 'All' || brick.category === activeCategory) &&
            brick.name.toLowerCase().includes(search.toLowerCase())
        );

        // Color Filter
        if (filterColor !== 'All') {
            result = result.filter(brick => brick.color === filterColor);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'count') return b.count - a.count; // Descending
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'category') return a.category.localeCompare(b.category);
            return 0;
        });

        return result;
    }, [activeCategory, search, filterColor, sortBy, realCollection]);

    const filteredSets = useMemo(() => {
        const suggestions = suggestionEngine.getSuggestions(realCollection);
        if (!search) return suggestions;
        return suggestions.filter(s =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.setNumber.includes(search)
        );
    }, [realCollection, search]);

    const uniqueCount = filteredBricks.length;
    const totalCount = filteredBricks.reduce((sum, brick) => sum + brick.count, 0);

    const getBrickStyle = (category: string) => {
        switch (category) {
            case 'Technic':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-600',
                    pattern: (
                        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 40 40">
                            <pattern id="tech" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                <circle cx="5" cy="5" r="1.5" fill="currentColor" className="text-blue-900" />
                                <path d="M0 5H10M5 0V10" stroke="currentColor" strokeWidth="0.5" className="text-blue-900" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#tech)" />
                        </svg>
                    )
                };
            case 'Minifigs':
                return {
                    bg: 'bg-yellow-50',
                    text: 'text-yellow-600',
                    pattern: (
                        <svg className="absolute inset-0 w-full h-full opacity-[0.1]" viewBox="0 0 20 20">
                            <path d="M10 2L12 8L18 8L13 12L15 18L10 14L5 18L7 12L2 8L8 8Z" fill="currentColor" className="text-yellow-500" transform="scale(0.5) translate(10,10)" />
                            <circle cx="2" cy="15" r="1" className="text-yellow-400" fill="currentColor" />
                            <circle cx="18" cy="5" r="2" className="text-yellow-400" fill="currentColor" />
                        </svg>
                    )
                };
            case 'Plates':
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-600',
                    pattern: (
                        <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 20 20">
                            <pattern id="plate" x="0" y="0" width="8" height="4" patternUnits="userSpaceOnUse">
                                <rect width="8" height="2" fill="currentColor" className="text-green-900" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#plate)" />
                        </svg>
                    )
                };
            default: // Bricks and others
                return {
                    bg: 'bg-slate-50',
                    text: 'text-slate-500',
                    pattern: (
                        <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 20 20">
                            <pattern id="studs" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                <circle cx="5" cy="5" r="3" fill="currentColor" className="text-slate-900" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#studs)" />
                        </svg>
                    )
                };
        }
    };

    const getSetStatus = (owned: number, total: number) => {
        const pct = owned / total;
        if (pct === 1) return { label: 'Build Ready', color: 'bg-green-100 text-green-700', bar: 'bg-green-500' };
        if (pct > 0.5) return { label: 'In Progress', color: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' };
        return { label: 'Collecting', color: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400' };
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-slate-950 font-sans relative text-slate-100">
            <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-orange-600/10 via-orange-500/5 to-transparent pointer-events-none z-0 opacity-80" />

            <div className="relative z-10 flex flex-col min-h-[100dvh] pb-[max(env(safe-area-inset-bottom),96px)]">
                <TopBar currentScreen={Screen.COLLECTION} onNavigate={onNavigate} />

                <div className="px-6 mt-2 mb-4">
                    <h1 className="text-3xl font-black text-white mb-6 tracking-tight">My Bricks</h1>

                    {/* Search & Filter Bar */}
                    <div className="bg-slate-900/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-2 pl-4 flex items-center gap-3 mb-4 border border-white/10 backdrop-blur-xl">
                        <Search className="w-5 h-5 text-orange-500 stroke-[3px]" />
                        <input
                            type="text"
                            placeholder={viewMode === 'PARTS' ? "Search your inventory..." : "Search sets..."}
                            className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-400 font-bold text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2.5 rounded-xl transition-colors ${showFilters ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-slate-400 hover:text-orange-400'}`}
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && viewMode === 'PARTS' && (
                        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100 animate-in slide-in-from-top-2">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <ArrowUpDown className="w-3 h-3" /> Sort By
                                </div>
                                <div className="flex gap-2">
                                    {['name', 'count', 'category'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setSortBy(opt as SortOption)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-colors ${sortBy === opt ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-800 text-slate-300 border-white/10'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <Palette className="w-3 h-3" /> Color Filter
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {availableColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setFilterColor(color as string)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-colors flex items-center gap-2 ${filterColor === color ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-800 text-slate-300 border-white/10'}`}
                                        >
                                            {color !== 'All' && (
                                                <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: color.toLowerCase() === 'red' ? '#B40000' : color.toLowerCase() === 'blue' ? '#0055BF' : color.toLowerCase() === 'yellow' ? '#F2CD37' : color.toLowerCase() === 'green' ? '#237841' : color.toLowerCase() === 'white' ? '#D9D9D9' : color.toLowerCase() === 'black' ? '#050505' : '#888' }} />
                                            )}
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View Mode Toggle */}
                    <div className="flex bg-slate-900/50 p-1 rounded-xl mb-6 border border-white/5">
                        <button
                            onClick={() => setViewMode('PARTS')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'PARTS' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                        >
                            Parts
                        </button>
                        <button
                            onClick={() => setViewMode('SETS')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'SETS' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                        >
                            Sets
                        </button>
                    </div>

                    {/* Stats Header (Only for Parts view) */}
                    {viewMode === 'PARTS' && (
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 bg-indigo-950/60 backdrop-blur-xl rounded-[28px] p-5 text-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/10 relative overflow-hidden group">
                                <div className="relative z-10 flex flex-col h-full justify-between min-h-[100px]">
                                    <div className="flex items-center gap-2 mb-2 opacity-80">
                                        <Layers className="w-4 h-4" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Unique</p>
                                    </div>
                                    <p className="text-4xl font-black tracking-tight">{uniqueCount}</p>
                                </div>
                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
                                <div className="absolute right-0 bottom-0 w-16 h-16 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-[32px]" />
                            </div>

                            <div className="flex-1 bg-slate-900/60 rounded-[28px] p-5 text-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/10 relative overflow-hidden backdrop-blur-xl">
                                <div className="relative z-10 flex flex-col h-full justify-between min-h-[100px]">
                                    <div className="flex items-center gap-2 mb-2 opacity-50">
                                        <Hexagon className="w-4 h-4" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Total</p>
                                    </div>
                                    <p className="text-4xl font-black tracking-tight">{totalCount}</p>
                                </div>
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-500/20 rounded-full blur-xl" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Category Filter (Only for Parts) */}
                {viewMode === 'PARTS' && (
                    <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md py-3 border-b border-white/5 mb-4 transition-all duration-300">
                        <div className="flex gap-2 px-6 overflow-x-auto no-scrollbar items-center">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 border ${activeCategory === cat
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* GRID CONTENT */}
                <div className="px-6 grid grid-cols-2 gap-4">
                    {viewMode === 'PARTS' ? (
                        filteredBricks.map(brick => {
                            const style = getBrickStyle(brick.category);
                            return (
                                <div
                                    key={brick.id}
                                    onClick={() => setSelectedBrick(brick)}
                                    className="group relative bg-slate-900 rounded-[24px] p-0 shadow-sm border border-white/10 active:scale-[0.98] transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-white/20 overflow-hidden"
                                >
                                    {/* Card Header / Image Area */}
                                    <div className={`h-32 relative flex items-center justify-center overflow-hidden ${style.bg}`}>
                                        {/* Pattern Background */}
                                        {style.pattern}

                                        {/* Brick Image */}
                                        <img
                                            src={brick.image}
                                            alt={brick.name}
                                            className="w-20 h-20 object-contain relative z-10 drop-shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 ease-out cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setZoomedImage(brick.image);
                                            }}
                                        />

                                        {/* Count Badge */}
                                        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm border border-white/10 z-20 flex items-center gap-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text-', 'bg-')}`} />
                                            <span className="text-xs font-black text-white">x{brick.count}</span>
                                        </div>
                                    </div>

                                    {/* Card Footer / Info */}
                                    <div className="p-4 bg-slate-900 relative z-20 border-t border-white/5">
                                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${style.text}`}>{brick.category}</div>
                                        <h3 className="font-bold text-white text-sm leading-tight truncate">{brick.name}</h3>
                                        <div className="flex items-center gap-1 mt-2">
                                            <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: brick.color_hex || (brick.color?.toLowerCase() === 'red' ? '#B40000' : brick.color?.toLowerCase() === 'blue' ? '#0055BF' : brick.color?.toLowerCase() === 'yellow' ? '#F2CD37' : brick.color?.toLowerCase() === 'green' ? '#237841' : brick.color?.toLowerCase() === 'white' ? '#D9D9D9' : brick.color?.toLowerCase() === 'black' ? '#050505' : '#888') }} />
                                            <span className="text-[10px] font-bold text-slate-400 capitalize">{brick.color}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        // SETS VIEW
                        filteredSets.map(set => {
                            const status = getSetStatus(set.ownedParts, set.partCount);
                            const percent = Math.round((set.ownedParts / set.partCount) * 100);

                            return (
                                <div
                                    key={set.id}
                                    onClick={() => setSelectedSet(set)}
                                    className="bg-slate-900 col-span-2 rounded-[24px] p-4 shadow-sm border border-white/10 active:scale-[0.99] transition-transform cursor-pointer flex gap-4 items-center group hover:border-white/20"
                                >
                                    <div className="w-24 h-24 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center p-2 group-hover:bg-slate-100 transition-colors">
                                        <img src={set.image} className="w-full h-full object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-white text-lg leading-tight">{set.name}</h3>
                                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                                                {status.label}
                                            </div>
                                        </div>
                                        <span className="text-slate-400 text-xs font-bold px-0 py-1 rounded-md mb-3 block">Set #{set.setNumber}</span>

                                        {/* Progress Bar Container */}
                                        <div className="relative pt-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-bold text-slate-500">{set.ownedParts}/{set.partCount} Parts</span>
                                                <span className="font-black text-slate-900">{percent}%</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${status.bar}`} style={{ width: `${percent}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {((viewMode === 'PARTS' && filteredBricks.length === 0) || (viewMode === 'SETS' && filteredSets.length === 0)) && (
                        <div className="col-span-2 py-12 text-center opacity-50 flex flex-col items-center">
                            <Box className="w-12 h-12 mb-2 text-slate-300" />
                            <p className="font-bold text-slate-400">Nothing found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Zoomable Image Viewer */}
            {zoomedImage && (
                <ZoomableImageViewer
                    imageUrl={zoomedImage}
                    alt="Brick image"
                    onClose={() => setZoomedImage(null)}
                />
            )}

            {/* PART DETAIL MODAL */}
            {selectedBrick && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setSelectedBrick(null)} />
                    <div className="bg-slate-900 border border-white/10 w-full max-w-sm m-4 rounded-[32px] p-6 relative z-10 pointer-events-auto animate-in slide-in-from-bottom-10 shadow-2xl">
                        <button onClick={() => setSelectedBrick(null)} className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20">
                            <X className="w-5 h-5 text-slate-300" />
                        </button>

                        <div className="flex flex-col items-center mb-6">
                            <div className="w-48 h-48 bg-slate-800 rounded-[32px] flex items-center justify-center mb-6 shadow-inner cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setZoomedImage(selectedBrick.image)}>
                                <img src={selectedBrick.image} className="w-32 h-32 object-contain" />
                            </div>
                            <h2 className="text-2xl font-black text-white text-center leading-tight mb-1">{selectedBrick.name}</h2>

                            {/* Category Selector */}
                            <div className="mt-3 w-full">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Collection Bin</label>
                                <select
                                    value={selectedBrick.category}
                                    onChange={async (e) => {
                                        const newCategory = e.target.value;
                                        const updatedBrick = { ...selectedBrick, category: newCategory };
                                        setSelectedBrick(updatedBrick);

                                        // Update in collection
                                        const updatedCollection = realCollection.map(b =>
                                            b.id === selectedBrick.id ? updatedBrick : b
                                        );
                                        setRealCollection(updatedCollection);

                                        // Save to backend
                                        try {
                                            const userId = localStorage.getItem('hellobrick_userId') || 'anonymous';

                                            await fetch(`/api/dataset/collection/save`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    userId,
                                                    bricks: updatedCollection
                                                })
                                            });

                                            // Also save to localStorage
                                            localStorage.setItem('hellobrick_collection', JSON.stringify({
                                                bricks: updatedCollection,
                                                lastUpdated: Date.now()
                                            }));
                                        } catch (error) {
                                            console.error('Error updating category:', error);
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20 flex flex-col items-center">
                                <span className="text-3xl font-black text-orange-500">{selectedBrick.count}</span>
                                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Owned</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-1 group/share cursor-pointer hover:bg-white/10">
                                <span className="text-xl font-black text-white">{Math.round((selectedBrick.confidence || 0.85) * 100)}%</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover/share:text-orange-400 transition-colors">Confidence</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mb-6">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Color</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: selectedBrick.color_hex || '#888' }} />
                                    <span className="text-xs font-bold text-white">{selectedBrick.color}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Dimensions</span>
                                <span className="text-xs font-bold text-white">{selectedBrick.dimensions || 'Unknown'}</span>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
                            Find Builds with this Part
                        </button>
                    </div>
                </div>
            )}

            {/* SET DETAIL MODAL */}
            {selectedSet && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setSelectedSet(null)} />
                    <div className="bg-slate-900 border border-white/10 w-full max-w-md m-4 rounded-[32px] p-0 relative z-10 pointer-events-auto animate-in slide-in-from-bottom-10 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="relative h-48 bg-slate-800 flex items-center justify-center">
                            <button onClick={() => setSelectedSet(null)} className="absolute top-4 right-4 bg-black/50 backdrop-blur p-2 rounded-full hover:bg-black/70 z-20">
                                <X className="w-5 h-5 text-white" />
                            </button>
                            <img src={selectedSet.image} className="h-40 object-contain" />
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-black text-white leading-tight">{selectedSet.name}</h2>
                                    <p className="text-slate-500 font-bold text-sm">Set #{selectedSet.setNumber}</p>
                                </div>
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {Math.round((selectedSet.ownedParts / selectedSet.partCount) * 100)}% Complete
                                </div>
                            </div>

                            <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">Set Contents</h3>
                            <div className="space-y-3">
                                {selectedSet.bricks.map(brick => (
                                    <div key={brick.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                        <img src={brick.image} className="w-10 h-10 object-contain mix-blend-multiply" />
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-white">{brick.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{brick.category}</p>
                                        </div>
                                        <div className="text-sm font-bold text-white">x{brick.count}</div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
                                View Building Instructions
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
