import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { 
  User, Camera, Heart, TrendingUp, Package, Zap, Eye, EyeOff, 
  ArrowUpRight, ArrowDownRight, ChevronRight, Bell, Search, Sparkles, Trophy, Flame
} from 'lucide-react';
import { Screen } from '../types';
import { valuationService } from '../services/valuationService';
import { getCollectionFromStorage, getSets, getValuationsMap } from '../lib/dataProvider';
import { mockSets, mockValuations, mockMinifigs } from '../lib/mock-data';
import { legoDatabase } from '../lib/legoDatabase';
import { Logo } from '../components/Logo';

interface HomeScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

const TIME_FILTERS = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'] as const;
type TimeFilter = typeof TIME_FILTERS[number];

// Chart paths per timeframe (normalised 0–100 height inverted for SVG)
const CHART_PATHS: Record<TimeFilter, string> = {
  '1D': 'M0,60 C40,58 80,62 120,55 C160,48 200,52 240,45 C280,38 320,42 360,35 C380,32 390,30 400,28',
  '1W': 'M0,75 C50,70 100,78 150,65 C200,52 250,60 300,45 C350,30 380,25 400,20',
  '1M': 'M0,80 C60,76 100,84 160,72 C220,60 260,65 320,48 C360,35 380,28 400,22',
  '3M': 'M0,85 C50,80 100,82 150,70 C200,58 260,65 300,45 C350,28 380,20 400,15',
  '6M': 'M0,88 C80,80 140,85 200,68 C260,52 300,58 350,38 C375,28 390,22 400,18',
  '1Y': 'M0,90 C60,86 120,88 180,72 C240,56 280,62 330,42 C365,26 385,18 400,12',
  'ALL': 'M0,95 C60,90 100,92 160,78 C220,64 260,70 310,50 C355,30 380,18 400,8',
};

const GROWTH_BY_FILTER: Record<TimeFilter, number> = {
  '1D': 0.8, '1W': 2.3, '1M': 4.2, '3M': 8.7, '6M': 12.4, '1Y': 28.6, 'ALL': 41.2,
};

// Quick action tools matching Brickify layout
const TOOLS = [
  { id: 'set',     label: 'Scan Set',     sub: 'Live AR price tags & condition', emoji: '📦', color: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'minifig', label: 'Scan Minifig', sub: 'Identify rare minifig prints',    emoji: '🧑', color: '#FF7A30', bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
  { id: 'pile',    label: 'Bulk Scan',    sub: 'Loose brick pile recognition',    emoji: '🧱', color: '#6366F1', bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
  { id: 'mystery', label: 'CMF Scanner',  sub: 'Read box codes before opening',   emoji: '🎁', color: '#F59E0B', bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  { id: 'ideas',   label: 'What Can I Build?', sub: 'AI MOC instructions for your parts', emoji: '💡', color: '#8B5CF6', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { id: 'alerts',  label: 'Retirement & Price Alerts', sub: 'Get notified before sets retire', emoji: '🔔', color: '#EC4899', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
];

// Retiring soon data for the alert ticker
const RETIRING_SOON = [
  { name: 'Bookshop', num: '10270', months: 4, gain: '+35%' },
  { name: 'Assembly Square', num: '10255', months: 3, gain: '+48%' },
  { name: 'Eiffel Tower', num: '10307', months: 6, gain: '+22%' },
  { name: 'Medieval Blacksmith', num: '21325', months: 2, gain: '+72%' },
  { name: 'UCS Millennium Falcon', num: '75192', months: 8, gain: '+55%' },
];

// Curated market top movers shown in collector view
const POPULAR_MARKET_MOVERS = [
  { setNum: '75192-1', name: 'Millennium Falcon UCS', theme: 'Star Wars', retailPrice: 849.99, marketValue: 940.00, gain: '+18.4%', imageUrl: 'https://images.brickset.com/sets/images/75192-1.jpg' },
  { setNum: '10316-1', name: 'Rivendell', theme: 'Icons', retailPrice: 499.99, marketValue: 580.00, gain: '+24.1%', imageUrl: 'https://images.brickset.com/sets/images/10316-1.jpg' },
  { setNum: '21325-1', name: 'Medieval Blacksmith', theme: 'Ideas', retailPrice: 179.99, marketValue: 310.00, gain: '+72.2%', imageUrl: 'https://images.brickset.com/sets/images/21325-1.jpg' },
  { setNum: '10294-1', name: 'Titanic', theme: 'Icons', retailPrice: 679.99, marketValue: 790.00, gain: '+16.2%', imageUrl: 'https://images.brickset.com/sets/images/10294-1.jpg' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [collection, setCollection] = useState<any[]>([]);
  const [sets, setSets] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1M');
  const [hideValue, setHideValue] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileName = localStorage.getItem('hellobrick_profile_name') || '';

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const loadData = async () => {
    try {
      let [col, fetchSets] = await Promise.all([getCollectionFromStorage(), getSets()]);
      if (!col || col.length === 0) {
        const demoItems = [
          { id: 'demo-1', setNum: '75192-1', condition: 'sealed', purchasePrice: 849.99, addedAt: new Date().toISOString() },
          { id: 'demo-2', setNum: '10316-1', condition: 'used', purchasePrice: 440.00, addedAt: new Date().toISOString() },
          { id: 'demo-3', setNum: '21325-1', condition: 'sealed', purchasePrice: 179.99, addedAt: new Date().toISOString() },
        ];
        localStorage.setItem('hellobrick_collection_sets', JSON.stringify(demoItems));
        col = demoItems;
      }
      setCollection(col);
      setSets(fetchSets);
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  // Demo Starter loader so new users don't see a blank app
  const loadDemoPortfolio = () => {
    const demoItems = [
      { id: 'demo-1', setNum: '75192-1', condition: 'sealed', purchasePrice: 849.99, addedAt: new Date().toISOString() },
      { id: 'demo-2', setNum: '10316-1', condition: 'used', purchasePrice: 440.00, addedAt: new Date().toISOString() },
      { id: 'demo-3', setNum: '21325-1', condition: 'sealed', purchasePrice: 179.99, addedAt: new Date().toISOString() },
    ];
    localStorage.setItem('hellobrick_collection_sets', JSON.stringify(demoItems));
    setCollection(demoItems);
    window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
  };

  const calculatedTotalValue = useMemo(() => {
    if (collection.length === 0) return 0;
    return collection.reduce((sum, item) => {
      const dbItem = legoDatabase.findById(item.setNum);
      const qty = (item as any).quantity ?? 1;
      if (dbItem) {
        const val = item.condition === 'sealed' ? dbItem.sealedPrice : dbItem.usedPrice;
        return sum + (val * qty);
      }
      return sum + ((item.purchasePrice || 89.99) * qty);
    }, 0);
  }, [collection]);

  const isEmpty = collection.length === 0;
  const displayTotal = isEmpty ? 0 : calculatedTotalValue;
  const changePercent = GROWTH_BY_FILTER[timeFilter];
  const isPositive = changePercent >= 0;

  // Top sets hydrated with images
  const topSets = useMemo(() => {
    if (collection.length > 0) {
      return collection
        .map(item => sets.find(s => s.setNum === item.setNum) || mockSets.find(s => s.setNum === item.setNum))
        .filter((s): s is any => !!s)
        .slice(0, 4);
    }
    return POPULAR_MARKET_MOVERS;
  }, [collection, sets]);

  // Stats row
  const stats = [
    { label: 'Sets', value: collection.length > 0 ? collection.length.toString() : '0', icon: '📦' },
    { label: 'Minifigs', value: collection.length > 0 ? `${collection.length * 4}` : '0', icon: '🧑' },
    { label: 'Pieces', value: collection.length > 0 ? `${(collection.length * 842).toLocaleString()}` : '0', icon: '🧱' },
    { label: 'Avg Return', value: collection.length > 0 ? '+24.5%' : '+18.2%', icon: '📈' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] font-sans text-gray-900 relative overflow-hidden select-none">
      <style>{`
        @keyframes home-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes home-value-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .home-r0 { animation: home-in 0.4s 0.05s ease-out both; }
        .home-r1 { animation: home-value-in 0.45s 0.1s cubic-bezier(0.34,1.56,0.64,1) both; }
        .home-r2 { animation: home-in 0.4s 0.18s ease-out both; }
        .home-r3 { animation: home-in 0.4s 0.25s ease-out both; }
        .home-r4 { animation: home-in 0.4s 0.32s ease-out both; }
        .home-r5 { animation: home-in 0.4s 0.4s ease-out both; }
        .ticker-inner { animation: ticker-scroll 24s linear infinite; }
      `}</style>

      {/* ─── Header ─── */}
      <div className="home-r0 px-5 pt-[max(env(safe-area-inset-top),2.5rem)] pb-2 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Logo size="sm" light={false} />
          <button
            onClick={() => onNavigate(Screen.SUBSCRIPTION)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm"
          >
            PRO
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Quests Badge */}
          <button
            onClick={() => onNavigate(Screen.QUESTS)}
            className="h-8 px-2.5 rounded-full bg-white border border-gray-200/90 shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span className="text-[11px] font-black text-gray-800">5d</span>
          </button>

          {/* Alerts Bell */}
          <button
            onClick={() => onNavigate(Screen.ALERTS)}
            className="w-8 h-8 rounded-full bg-white border border-gray-200/90 shadow-sm flex items-center justify-center relative active:scale-95 transition-transform"
          >
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1" />
          </button>

          {/* Profile */}
          <button
            onClick={() => onNavigate(Screen.PROFILE)}
            className="w-8 h-8 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white font-black text-xs shadow-sm active:scale-95 transition-transform"
          >
            {profileName ? profileName.charAt(0).toUpperCase() : 'U'}
          </button>
        </div>
      </div>

      {/* ─── Quick Catalog Search Bar (Like Brickify) ─── */}
      <div className="home-r0 px-5 my-2 shrink-0">
        <button
          onClick={() => onNavigate(Screen.BROWSE)}
          className="w-full bg-white border border-gray-200/80 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-sm active:scale-[0.99] transition-transform text-left"
        >
          <Search className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[13px] font-medium text-gray-400 flex-1 truncate">
            Search 20,000+ sets, minifigs, MOCs...
          </span>
          <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200/60">
            BROWSE
          </span>
        </button>
      </div>

      {/* ─── Retiring Soon Ticker (Always Visible for AFOLs) ─── */}
      <div className="home-r0 overflow-hidden border-y border-gray-200/70 bg-white/80 backdrop-blur-md py-1.5 shrink-0">
        <div className="ticker-inner flex gap-8 whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...RETIRING_SOON, ...RETIRING_SOON].map((r, i) => (
            <button
              key={i}
              onClick={() => onNavigate(Screen.ALERTS)}
              className="text-[11px] font-semibold text-gray-600 flex items-center gap-1.5 active:opacity-70"
            >
              <span className="text-amber-500">⚠️</span>
              <span className="font-bold text-gray-900">{r.name} #{r.num}</span>
              <span className="text-gray-400">retiring in {r.months}mo</span>
              <span className="font-black text-emerald-600">{r.gain}</span>
              <span className="text-gray-300 mx-1">·</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Scrollable ─── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-28">

        {/* ─── Value Hero Section ─── */}
        <div className="px-5 mt-4">
          {mounted && (
            <div className="home-r1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">PORTFOLIO VALUE</p>
                <div className="flex items-center gap-1">
                  {TIME_FILTERS.map(tf => (
                    <button
                      key={tf}
                      onClick={() => setTimeFilter(tf)}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                        timeFilter === tf ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end gap-3 mb-1">
                <div className="text-[44px] sm:text-[50px] font-black text-gray-900 tracking-tight leading-none">
                  {hideValue ? '••••••' : `$${displayTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
                <button
                  onClick={() => setHideValue(!hideValue)}
                  className="mb-1.5 text-gray-400 active:opacity-50 transition-opacity"
                >
                  {hideValue ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Growth badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${isPositive ? 'bg-emerald-500/15 text-emerald-700' : 'bg-red-500/15 text-red-700'}`}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownRight className="w-3 h-3 text-red-600" />}
                  {isPositive ? '+' : ''}{changePercent}%
                </div>
                <span className="text-gray-500 text-[11px] font-medium">
                  {timeFilter === '1D' ? 'today' : timeFilter === '1W' ? 'this week' : timeFilter === '1M' ? 'this month' : `past ${timeFilter}`}
                </span>
                {isEmpty && (
                  <button
                    onClick={loadDemoPortfolio}
                    className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full active:scale-95 transition-transform"
                  >
                    + Try Demo Portfolio
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ─── Portfolio Chart ─── */}
          {mounted && (
            <div className="home-r2 bg-white shadow-sm rounded-[24px] border border-gray-200/80 p-4 mb-4 relative overflow-hidden">
              <div className="h-[90px] w-full">
                <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="hg-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={`${CHART_PATHS[timeFilter]} L400,100 L0,100 Z`} fill="url(#hg-grad)" />
                  <path d={CHART_PATHS[timeFilter]} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="400" cy="8" r="4.5" fill="#10B981" />
                  <circle cx="400" cy="8" r="8" fill="#10B981" fillOpacity="0.25" />
                </svg>
              </div>

              {/* Stats Bar under Chart */}
              <div className="grid grid-cols-4 gap-2 pt-3 mt-1 border-t border-gray-100 text-center">
                {stats.map((s, i) => (
                  <div key={i}>
                    <p className="text-[13px] font-black text-gray-900 leading-tight">{s.value}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── COLLECTOR TOOLS (The Brickify Suite) ─── */}
        {mounted && (
          <div className="home-r3 px-5 mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <h2 className="text-[11px] font-black text-gray-700 uppercase tracking-[0.16em]">SCAN &amp; BUILD TOOLS</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    if (tool.id === 'ideas') onNavigate(Screen.IDEAS);
                    else if (tool.id === 'alerts') onNavigate(Screen.ALERTS);
                    else onNavigate(Screen.SCANNER, { mode: tool.id });
                  }}
                  className="bg-white border border-gray-200/80 rounded-2xl p-3.5 flex flex-col items-start shadow-sm active:scale-[0.98] transition-all text-left group"
                >
                  <div className={`w-9 h-9 rounded-xl ${tool.bg} border ${tool.border} flex items-center justify-center text-base mb-2 group-hover:scale-105 transition-transform`}>
                    {tool.emoji}
                  </div>
                  <p className="text-[13px] font-extrabold text-gray-900 leading-tight mb-0.5">{tool.label}</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-snug line-clamp-2">{tool.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Top Market Movers / Collection Sets ─── */}
        {mounted && (
          <div className="home-r4 px-5 mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <h2 className="text-[11px] font-black text-gray-700 uppercase tracking-[0.16em]">
                  {collection.length > 0 ? 'YOUR TOP SETS' : 'TRENDING MARKET MOVERS'}
                </h2>
              </div>
              <button 
                onClick={() => onNavigate(collection.length > 0 ? Screen.COLLECTION : Screen.BROWSE)} 
                className="text-[11px] font-black text-emerald-600 active:opacity-70"
              >
                See All →
              </button>
            </div>

            <div className="space-y-2">
              {topSets.map((set, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: set.setNum })}
                  className="w-full bg-white shadow-sm rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3.5 active:bg-gray-50 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-[#F5F5F7] rounded-xl overflow-hidden p-1 shrink-0 border border-gray-100">
                    <img src={set.imageUrl} alt={set.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 truncate">{set.name}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">#{set.setNum?.split('-')[0]} · {set.theme || 'LEGO'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-black text-gray-900">${(set.marketValue || set.retailPrice || 149).toFixed(2)}</p>
                    <div className="flex items-center gap-0.5 justify-end">
                      <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                      <p className="text-[10px] font-black text-emerald-600">{set.gain || `+${(12 + i * 4.2).toFixed(1)}%`}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Wishlist & Quests Quick Links ─── */}
        {mounted && (
          <div className="home-r5 px-5 mb-6 grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onNavigate(Screen.WISHLIST)}
              className="bg-white border border-gray-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4" fill="#EC4899" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-black text-gray-900">Wishlist</p>
                <p className="text-[10px] text-gray-400 font-medium truncate">Price alerts</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate(Screen.LEADERBOARD)}
              className="bg-white border border-gray-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" fill="#F59E0B" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-black text-gray-900">Leaderboard</p>
                <p className="text-[10px] text-gray-400 font-medium truncate">Top AFOLs</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
