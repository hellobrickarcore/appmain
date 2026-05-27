import * as React from 'react';
import { Scan, Search, TrendingUp, TrendingDown, ArrowUpRight, Box, ChevronRight, Award, Compass, Heart, Bookmark, AlertCircle, ShoppingBag, User, Layers } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { Screen } from '../types';
import { mockCollection, mockValuations, mockSets, mockMinifigs } from '../lib/mock-data';
import { recordSessionHeartbeat } from '../services/supabaseService';

const mockPortfolioHistory = [
    { date: '2023-06', value: 12400 },
    { date: '2023-07', value: 12900 },
    { date: '2023-08', value: 13500 },
    { date: '2023-09', value: 13200 },
    { date: '2023-10', value: 14100 },
    { date: '2023-11', value: 14900 },
    { date: '2023-12', value: 16200 },
    { date: '2024-01', value: 15800 },
    { date: '2024-02', value: 16900 },
    { date: '2024-03', value: 17400 },
    { date: '2024-04', value: 18100 },
    { date: '2024-05', value: 18740 }
];

interface HomeScreenProps {
    onNavigate: (screen: Screen, params?: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
    const [totalValue, setTotalValue] = React.useState(0);
    const [totalCost, setTotalCost] = React.useState(0);
    const [change24h, setChange24h] = React.useState(0);
    const [changePercent, setChangePercent] = React.useState(0);
    const [timeRange, setTimeRange] = React.useState<'1M' | '3M' | '1Y' | 'ALL'>('1Y');
    const [collectionItemsList, setCollectionItemsList] = React.useState<any[]>([]);

    const calculatePortfolio = () => {
        let calculatedValue = 0;
        let calculatedCost = 0;
        let calcChange = 0;

        // Try to load user collection
        const stored = localStorage.getItem('hellobrick_collection_sets');
        let collectionItems = mockCollection;
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.length > 0) collectionItems = parsed;
            } catch (e) { }
        }

        setCollectionItemsList(collectionItems);

        for (const item of collectionItems) {
            const qty = item.quantity ?? 1;
            if (item.itemType === 'minifig') {
                const minifig = mockMinifigs.find(m => m.figNum === item.setNum);
                if (minifig) {
                    const itemVal = minifig.resaleValue * qty;
                    calculatedValue += itemVal;
                    calculatedCost += (item.purchasePrice ? (item.purchasePrice * qty) : (minifig.resaleValue * 0.7 * qty));
                    calcChange += itemVal * (1.2 / 100);
                }
            } else {
                const valuation = mockValuations.get(item.setNum);
                const set = mockSets.find(s => s.setNum === item.setNum);
                if (valuation && set) {
                    const itemVal = (item.condition === 'sealed' ? valuation.sealedValue : valuation.usedValue) * qty;
                    calculatedValue += itemVal;
                    calculatedCost += (item.purchasePrice ? (item.purchasePrice * qty) : (itemVal * 0.7));
                    const pct = item.condition === 'sealed' ? valuation.sealedChange24h : valuation.usedChange24h;
                    calcChange += itemVal * (pct / 100);
                }
            }
        }

        setTotalValue(calculatedValue);
        setTotalCost(calculatedCost);
        setChange24h(calcChange);
        setChangePercent(calculatedValue > 0 ? (calcChange / calculatedValue) * 100 : 0);
    };

    React.useEffect(() => {
        recordSessionHeartbeat();
        calculatePortfolio();

        const interval = setInterval(recordSessionHeartbeat, 5 * 60 * 1000);
        
        // Listen for collection changes
        const handleCollectionUpdate = () => {
            calculatePortfolio();
        };
        window.addEventListener('hellobrick:collection-updated', handleCollectionUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('hellobrick:collection-updated', handleCollectionUpdate);
        };
    }, []);

    // Deterministic SVG sparkline generator
    const generateSvgPath = (width: number, height: number) => {
        if (!mockPortfolioHistory || mockPortfolioHistory.length === 0) return '';
        const values = mockPortfolioHistory.map((h: { date: string; value: number }) => h.value);
        const min = Math.min(...values) * 0.98;
        const max = Math.max(...values) * 1.02;
        const range = max - min;

        const points = mockPortfolioHistory.map((h: { date: string; value: number }, i: number) => {
            const x = (i / (mockPortfolioHistory.length - 1)) * width;
            const y = height - ((h.value - min) / range) * height;
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    const generateAreaPath = (width: number, height: number) => {
        const linePath = generateSvgPath(width, height);
        if (!linePath) return '';
        return `${linePath} L ${width},${height} L 0,${height} Z`;
    };

    return (
        <div className="flex flex-col h-full bg-[#0D111A] font-sans overflow-hidden text-slate-100 relative">
            {/* Ambient glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#C9A84C]/[0.05] blur-[100px] pointer-events-none z-0" />
            <div className="absolute top-60 right-0 w-60 h-60 rounded-full bg-blue-500/[0.04] blur-[80px] pointer-events-none z-0" />
            <div className="absolute bottom-20 left-0 w-72 h-72 rounded-full bg-emerald-500/[0.03] blur-[110px] pointer-events-none z-0" />

            <TopBar currentScreen={Screen.HOME} onNavigate={onNavigate} />

            <main className="flex-1 min-h-0 px-6 relative pb-[max(env(safe-area-inset-bottom),120px)] overflow-y-auto no-scrollbar overscroll-contain z-10">
                
                {/* 1. PORTFOLIO NET WORTH HEADER */}
                <div 
                    onClick={() => onNavigate(Screen.PORTFOLIO_ANALYTICS)}
                    className="mt-6 mb-6 text-center cursor-pointer active:scale-[0.99] transition-all"
                >
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">HELLO`BRICK PORTFOLIO</p>
                    <h1 className="text-4xl font-mono font-bold tracking-tight text-white select-none">
                        ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h1>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                        {change24h >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-rose-400" />
                        )}
                        <span className={`font-mono text-sm font-bold ${change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {change24h >= 0 ? '+' : '-'}${Math.abs(change24h).toFixed(2)} ({formatPercent(changePercent)})
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">TODAY</span>
                    </div>
                </div>

                {/* 2. CHART */}
                <div 
                    onClick={() => onNavigate(Screen.PORTFOLIO_ANALYTICS)}
                    className="bg-[#161A2B] border border-[#2A3144]/60 rounded-[32px] p-5 mb-6 relative overflow-hidden shadow-2xl cursor-pointer active:scale-[0.99] transition-all"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest">Growth Curve</span>
                        <div className="flex gap-1.5">
                            {['1M', '3M', '1Y', 'ALL'].map(range => (
                                <button
                                    key={range}
                                    onClick={(e) => { e.stopPropagation(); setTimeRange(range as any); }}
                                    className={`px-3 py-1 rounded-xl text-[9px] font-black tracking-wider transition-all border ${timeRange === range ? 'bg-[#C9A84C] text-[#0D111A] border-[#C9A84C]' : 'bg-[#1E233B]/50 text-slate-500 border-[#2A3144]'}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full h-28 relative mt-4">
                        <svg className="w-full h-full" viewBox="0 0 320 120" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            <path
                                d={generateAreaPath(320, 120)}
                                fill="url(#chartGradient)"
                                stroke="none"
                            />
                            <path
                                d={generateSvgPath(320, 120)}
                                fill="none"
                                stroke="#C9A84C"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-600 mt-2.5 pt-2.5 border-t border-[#2A3144]/30">
                        <span>12 MONTHS AGO</span>
                        <span>TODAY</span>
                    </div>
                </div>

                {/* 3. 2x2 SCANNER TRIGGERS GRID */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => onNavigate(Screen.SCANNER, { mode: 'minifig' })}
                        className="bg-gradient-to-tr from-[#C9A84C]/10 to-[#C9A84C]/5 p-5 rounded-[28px] border border-[#C9A84C]/25 flex flex-col items-start gap-4 active:scale-[0.97] transition-all shadow-xl group text-left"
                    >
                        <div className="w-11 h-11 bg-[#C9A84C] rounded-2xl flex items-center justify-center text-[#0D111A] shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <User className="w-5 h-5 stroke-[2.5px]" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-xs uppercase tracking-wider">Scan Minifig</h3>
                            <p className="text-[8px] text-[#C9A84C]/80 mt-1 font-bold">CHARACTERS LENS</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate(Screen.SCANNER, { mode: 'set' })}
                        className="bg-gradient-to-tr from-blue-500/10 to-blue-500/5 p-5 rounded-[28px] border border-blue-500/20 flex flex-col items-start gap-4 active:scale-[0.97] transition-all shadow-xl group text-left"
                    >
                        <div className="w-11 h-11 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <Box className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-xs uppercase tracking-wider">Scan Set</h3>
                            <p className="text-[8px] text-blue-400 mt-1 font-bold">BOX ART LENS</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate(Screen.SCANNER, { mode: 'bulk_minifig' })}
                        className="bg-gradient-to-tr from-purple-500/10 to-purple-500/5 p-5 rounded-[28px] border border-purple-500/20 flex flex-col items-start gap-4 active:scale-[0.97] transition-all shadow-xl group text-left"
                    >
                        <div className="w-11 h-11 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-xs uppercase tracking-wider">Bulk Minifigs</h3>
                            <p className="text-[8px] text-purple-400 mt-1 font-bold">MULTIPLE SCAN</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate(Screen.SCANNER, { mode: 'cmf_qr' })}
                        className="bg-gradient-to-tr from-orange-500/10 to-orange-500/5 p-5 rounded-[28px] border border-orange-500/20 flex flex-col items-start gap-4 active:scale-[0.97] transition-all shadow-xl group text-left"
                    >
                        <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <Scan className="w-5 h-5 stroke-[2.5px]" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-xs uppercase tracking-wider">CMF QR Code</h3>
                            <p className="text-[8px] text-orange-400 mt-1 font-bold">BARCODE SCAN</p>
                        </div>
                    </button>
                </div>

                {/* 4. TOTAL METRICS ROW */}
                <div className="bg-[#161A2B] border border-[#2A3144]/60 p-5 rounded-[28px] mb-6 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <Box className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-white text-md leading-none">Vault Inventory</h3>
                            <p className="text-xs text-slate-500 mt-1.5 font-bold">Complete tracked assets</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="font-mono text-sm font-black text-white">
                            {collectionItemsList.reduce((sum, item) => sum + (item.quantity ?? 1), 0)} Items
                        </span>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">TRACKED</p>
                    </div>
                </div>

                {/* 5. TOP PERFORMING ASSETS LIST */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.25em]">Top Performing Assets</h3>
                        <button 
                            onClick={() => onNavigate(Screen.COLLECTION)}
                            className="text-[10px] font-black text-[#C9A84C] uppercase tracking-wider flex items-center gap-1"
                        >
                            View All <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3.5">
                        {collectionItemsList.slice(0, 3).map((item) => {
                            let name = '';
                            let imageUrl = '';
                            let theme = '';
                            let currentVal = 0;
                            let gainPct = 0;

                            if (item.itemType === 'minifig') {
                                const minifig = mockMinifigs.find(m => m.figNum === item.setNum);
                                if (!minifig) return null;
                                name = minifig.name;
                                imageUrl = minifig.imageUrl;
                                theme = minifig.theme;
                                currentVal = minifig.resaleValue * (item.quantity ?? 1);
                                gainPct = 7.9;
                            } else {
                                const set = mockSets.find(s => s.setNum === item.setNum);
                                const val = mockValuations.get(item.setNum);
                                if (!set || !val) return null;
                                name = set.name;
                                imageUrl = set.imageUrl;
                                theme = set.theme;
                                currentVal = (item.condition === 'sealed' ? val.sealedValue : val.usedValue) * (item.quantity ?? 1);
                                gainPct = val.sealedChange30d;
                            }

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => onNavigate(Screen.COLLECTION)}
                                    className="bg-[#161A2B] border border-[#2A3144]/60 p-4 rounded-[24px] flex items-center justify-between active:scale-[0.98] transition-all group shadow-md"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-14 h-14 bg-[#0D111A] rounded-xl flex items-center justify-center overflow-hidden border border-[#2A3144]/50 relative">
                                            <img
                                                src={imageUrl}
                                                alt={name}
                                                className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <h4 className="font-black text-white text-sm truncate leading-tight">{name}</h4>
                                            <p className="text-[10px] font-mono text-slate-500 mt-1 font-bold">
                                                #{item.setNum.split('-')[0]} · {theme}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end shrink-0">
                                        <span className="font-mono text-sm font-black text-white">${currentVal.toFixed(2)}</span>
                                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono mt-1 font-bold">
                                            +{gainPct}% <ArrowUpRight className="w-2.5 h-2.5" />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 6. Price alerts monitor block */}
                <div 
                    onClick={() => onNavigate(Screen.WISHLIST)}
                    className="bg-[#161A2B]/40 border border-[#2A3144] p-5 rounded-[28px] flex items-center gap-4 active:scale-95 transition-all cursor-pointer shadow-lg mt-6"
                >
                    <div className="w-10 h-10 bg-[#C9A84C]/10 rounded-full flex items-center justify-center text-[#C9A84C]">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                        <h4 className="font-black text-white text-xs uppercase tracking-wider">Price Monitors Active</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Verify retired sets against limit-buy targets</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </div>

                {/* 7. LEGO Map stores locator block */}
                <div 
                    onClick={() => onNavigate(Screen.LEGO_MAP)}
                    className="bg-[#161A2B]/40 border border-[#2A3144] p-5 rounded-[28px] flex items-center gap-4 active:scale-95 transition-all cursor-pointer shadow-lg mt-4"
                >
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                        <Compass className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div className="text-left flex-1">
                        <h4 className="font-black text-white text-xs uppercase tracking-wider">LEGO Store Map</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Locate nearby stores, conventions & pickups</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </div>
            </main>
        </div>
    );
};

function formatPercent(value: number, showSign = true): string {
    const formatted = Math.abs(value).toFixed(1);
    if (!showSign) return `${formatted}%`;
    if (value > 0) return `+${formatted}%`;
    if (value < 0) return `-${formatted}%`;
    return `0.0%`;
}
