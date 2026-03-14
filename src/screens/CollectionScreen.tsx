import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Layers, Box, X, Palette, Lightbulb, Brain, ChevronRight, Sparkles } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { ZoomableImageViewer } from '../components/ZoomableImageViewer';
import { Screen, Brick } from '../types';
import { CATEGORIES } from '../constants';

interface CollectionScreenProps {
    onNavigate: (screen: Screen, params?: any) => void;
}

type SortOption = 'name' | 'count' | 'category';

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ onNavigate }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('count');
    const [filterColor, setFilterColor] = useState<string>('All');
    const [selectedBrick, setSelectedBrick] = useState<Brick | null>(null);
    const [realCollection, setRealCollection] = useState<Brick[]>([]);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const loadCollection = async () => {
        try {
            const stored = localStorage.getItem('hellobrick_collection');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setRealCollection(parsed.bricks || []);
                } catch (e) { }
            }
        } catch (error) {
            console.error('Error loading collection:', error);
        }
    };

    useEffect(() => {
        loadCollection();
        const handleUpdate = () => loadCollection();
        window.addEventListener('hellobrick:collection-updated', handleUpdate);
        return () => window.removeEventListener('hellobrick:collection-updated', handleUpdate);
    }, []);

    const availableColors = useMemo(() => {
        const colors = new Set(realCollection.map(b => b.color).filter(Boolean));
        return ['All', ...Array.from(colors)];
    }, [realCollection]);

    const filteredBricks = useMemo(() => {
        let result = realCollection.filter(brick =>
            (activeCategory === 'All' || brick.category === activeCategory) &&
            brick.name.toLowerCase().includes(search.toLowerCase())
        );

        if (filterColor !== 'All') {
            result = result.filter(brick => brick.color === filterColor);
        }

        result.sort((a, b) => {
            if (sortBy === 'count') return b.count - a.count;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'category') return a.category.localeCompare(b.category);
            return 0;
        });

        return result;
    }, [activeCategory, search, filterColor, sortBy, realCollection]);

    const uncertainBricks = useMemo(() => {
        return realCollection.filter(b => b.isUncertain || b.labelDisplayStatus === 'tentative');
    }, [realCollection]);

    return (
        <div className="flex flex-col min-h-screen bg-[#050A18] font-sans relative text-white overflow-hidden">
            <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent pointer-events-none z-0" />

            <main className="relative z-10 flex flex-col h-full overflow-y-auto no-scrollbar pb-32">
                <TopBar currentScreen={Screen.COLLECTION} onNavigate={onNavigate} />

                <div className="px-6 pt-8 pb-2">
                    <div className="flex items-center justify-between mb-8">
                       <h1 className="text-4xl font-black text-white tracking-tight">Vault</h1>
                       <div className="flex items-center gap-2">
                          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl">
                             <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total</span>
                                <span className="text-sm font-black text-white leading-none">{realCollection.reduce((s, b) => s + b.count, 0).toLocaleString()}</span>
                             </div>
                             <Box className="w-5 h-5 text-orange-500" />
                          </div>
                       </div>
                    </div>

                    {/* Uncertain Bricks Alert */}
                    {uncertainBricks.length > 0 && (
                        <button
                            onClick={() => onNavigate(Screen.TRAINING)}
                            className="w-full bg-purple-500/10 border border-purple-500/20 rounded-[32px] p-6 mb-8 flex items-center justify-between group active:scale-[0.98] transition-all shadow-xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-black text-white text-lg leading-tight">Expert Training</h3>
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mt-1">Verify {uncertainBricks.length} Pending Parts</p>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-purple-800 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}

                    {/* Search & Tabs */}
                    <div className="relative mb-8">
                        <div className="bg-white/5 rounded-3xl p-1 flex items-center border border-white/10 backdrop-blur-xl group focus-within:border-orange-500/50 transition-colors">
                            <div className="flex-1 flex items-center px-4 gap-4">
                                <Search className="w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search your collection..."
                                    className="bg-transparent border-none outline-none text-white font-black text-sm py-4 w-full placeholder:text-slate-600"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-4 rounded-2xl transition-all ${showFilters ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:text-white bg-white/5'}`}
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="px-6 mb-8 mt-[-8px] animate-in slide-in-from-top-4 duration-300">
                        <div className="bg-[#0A0F1E] rounded-[40px] p-8 border border-white/10 shadow-3xl space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Sort By</h4>
                                <div className="flex gap-3">
                                    {['count', 'name'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setSortBy(opt as SortOption)}
                                            className={`px-6 py-3 rounded-2xl text-xs font-black capitalize transition-all border ${sortBy === opt ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-white/5 text-slate-500 border-white/5'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Filter Color</h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {availableColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setFilterColor(color as string)}
                                            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black capitalize transition-all flex items-center gap-3 border ${filterColor === color ? 'bg-white text-slate-950 border-white shadow-xl' : 'bg-white/5 text-slate-500 border-white/5'}`}
                                        >
                                            {color !== 'All' && (
                                                <div className="w-3 h-3 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: (color || 'white').toLowerCase() }} />
                                            )}
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div className="px-6 grid grid-cols-2 gap-5">
                    {filteredBricks.map(brick => (
                        <div
                            key={brick.id}
                            onClick={() => setSelectedBrick(brick)}
                            className="bg-white/5 rounded-[40px] p-6 border border-white/5 active:scale-[0.97] transition-all group relative flex flex-col items-center"
                        >
                            <div className="w-full h-32 flex items-center justify-center mb-6 relative">
                                <div className="absolute inset-0 bg-white/[0.02] rounded-3xl group-hover:scale-105 transition-transform" />
                                <img
                                    src={brick.image}
                                    alt={brick.name}
                                    className="w-24 h-24 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500 relative z-10"
                                />
                                <div className="absolute top-0 right-0 bg-white text-slate-950 px-2.5 py-1 rounded-2xl shadow-lg text-[10px] font-black z-20 border-2 border-[#050A18]">
                                    x{brick.count}
                                </div>
                            </div>

                            <div className="w-full text-center">
                                <h4 className="font-black text-white text-sm leading-tight truncate mb-1">{brick.name}</h4>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brick.color?.toLowerCase() || '#444' }} />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                        {brick.dimensions || '??'} • {brick.color}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredBricks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                        <Box className="w-16 h-16 text-slate-800 mb-6" strokeWidth={1} />
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">Vault Empty</h3>
                        <p className="text-sm text-slate-600 font-bold mt-2">No matched pieces found. Adjust your filters or scan some more bricks!</p>
                    </div>
                )}
            </main>

            {/* Part Detail Pop-over */}
            {selectedBrick && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8 pointer-events-none">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto" onClick={() => setSelectedBrick(null)} />
                    <div className="bg-[#0A0F1E] border border-white/10 w-full max-w-md rounded-[48px] p-10 relative z-10 pointer-events-auto animate-in slide-in-from-bottom-10 shadow-3xl">
                        <button onClick={() => setSelectedBrick(null)} className="absolute top-8 right-8 text-slate-600 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col items-center mb-10">
                            <div className="w-56 h-56 bg-white/[0.03] rounded-[48px] flex items-center justify-center mb-8 relative border border-white/5">
                                <img src={selectedBrick.image} className="w-40 h-40 object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,0.6)]" alt={selectedBrick.name} />
                                <div className="absolute -top-4 -right-4 bg-orange-500 w-12 h-12 rounded-full border-4 border-[#0A0F1E] flex items-center justify-center shadow-2xl">
                                   <Sparkles className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-white text-center leading-tight mb-3">{selectedBrick.name}</h2>
                            <div className="flex gap-2">
                                <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border border-white/5">{selectedBrick.category}</span>
                                <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border border-white/5">{selectedBrick.dimensions}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="bg-orange-500 text-white p-6 rounded-[32px] text-center shadow-xl shadow-orange-500/20">
                                <p className="text-3xl font-black leading-none mb-1">{selectedBrick.count}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Owned</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] text-center flex flex-col items-center justify-center">
                                <Palette className="w-6 h-6 text-slate-500 mb-2" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedBrick.color}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={() => onNavigate(Screen.IDEAS, { brick: selectedBrick })}
                                className="w-full bg-white text-slate-950 font-black py-6 rounded-[32px] shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                            >
                                <Lightbulb className="w-6 h-6" />
                                Generate Ideas
                            </button>
                            <button className="w-full py-2 text-[10px] font-black text-slate-700 hover:text-slate-400 uppercase tracking-widest transition-colors mb-4">
                                Remove from Vault
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {zoomedImage && (
                <ZoomableImageViewer imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />
            )}
        </div>
    );
};
