import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { User, Camera, Heart, TrendingUp, Package, Zap, Eye, EyeOff, ArrowUpRight, ArrowDownRight, ChevronRight, Bell } from 'lucide-react';
import { Screen } from '../types';
import { valuationService } from '../services/valuationService';
import { getCollectionFromStorage, getSets, getValuationsMap } from '../lib/dataProvider';
import { mockSets, mockValuations, mockMinifigs } from '../lib/mock-data';
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
  { id: 'set',     label: 'Scan Set',     sub: 'Scan and identify sets',        emoji: '📦', color: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'minifig', label: 'Scan Minifig', sub: 'Scan and identify minifigs',    emoji: '🧑', color: '#FF7A30', bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
  { id: 'pile',    label: 'Bulk Scan',    sub: 'Scan a pile of loose bricks',   emoji: '🧱', color: '#6366F1', bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
  { id: 'mystery', label: 'CMF Scanner',  sub: 'Identify hidden figure in box', emoji: '🎁', color: '#F59E0B', bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
];

// Retiring soon data for the alert ticker
const RETIRING_SOON = [
  { name: 'Bookshop', num: '10270', months: 7, gain: '+15%' },
  { name: 'Assembly Sq.', num: '10255', months: 5, gain: '+22%' },
  { name: 'Eiffel Tower', num: '10307', months: 3, gain: '+18%' },
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

  useEffect(() => {
    (async () => {
      try {
        const [col, fetchSets] = await Promise.all([getCollectionFromStorage(), getSets()]);
        setCollection(col);
        setSets(fetchSets);
      } catch (e) {}
    })();
  }, []);

  const totalValue = useMemo(() => {
    if (collection.length === 0) return 0;
    const valuationsMap = new Map(Object.entries(mockValuations));
    return collection.reduce((sum, item) => {
      const set = sets.find(s => s.setNum === item.setNum) ||
        mockSets.find(s => s.setNum === item.setNum) ||
        mockMinifigs.find(f => f.figNum === item.setNum) ||
        { retailPrice: item.purchasePrice || 49.99 };
      const val = valuationsMap.get(item.setNum) || {
        sealedValue: set.retailPrice || 149.99,
        usedValue: (set.retailPrice || 149.99) * 0.7,
      };
      const quantity = (item as any).quantity ?? 1;
      const currentValue = (item.condition === 'sealed' ? val.sealedValue : val.usedValue) * quantity;
      return sum + currentValue;
    }, 0);
  }, [collection, sets]);

  const isEmpty = collection.length === 0;
  const changePercent = GROWTH_BY_FILTER[timeFilter];
  const isPositive = changePercent >= 0;

  // Top sets hydrated with images
  const topSets = useMemo(() =>
    collection
      .map(item => sets.find(s => s.setNum === item.setNum))
      .filter((s): s is any => !!s)
      .slice(0, 6),
  [collection, sets]);

  // Stats row
  const stats = [
    { label: 'Sets', value: collection.length.toString(), icon: '📦' },
    { label: 'Minifigs', value: '0', icon: '🧑' },
    { label: 'Pieces', value: collection.length > 0 ? `${(collection.length * 842).toLocaleString()}` : '—', icon: '🧱' },
    { label: 'Avg Value', value: collection.length > 0 ? `$${Math.round(totalValue / Math.max(collection.length, 1))}` : '—', icon: '💰' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] font-sans text-gray-900 relative overflow-hidden select-none">
      <style>{`
        @keyframes home-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes home-value-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .home-r0 { animation: home-in 0.45s 0.05s ease-out both; }
        .home-r1 { animation: home-value-in 0.5s 0.12s cubic-bezier(0.34,1.56,0.64,1) both; }
        .home-r2 { animation: home-in 0.4s 0.22s ease-out both; }
        .home-r3 { animation: home-in 0.4s 0.32s ease-out both; }
        .home-r4 { animation: home-in 0.4s 0.42s ease-out both; }
        .home-r5 { animation: home-in 0.4s 0.52s ease-out both; }
        .ticker-inner { animation: ticker-scroll 22s linear infinite; }
        .chart-path-transition { transition: d 0.5s ease; }
      `}</style>

      {/* ─── Background radial ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[300px] rounded-full pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(ellipse, #10B98118 0%, transparent 70%)', marginTop: '-60px' }} />

      {/* ─── Header ─── */}
      <div className="home-r0 px-6 pt-[max(env(safe-area-inset-top),2.8rem)] pb-2 flex items-center justify-between z-10 shrink-0">
        <Logo size="sm" light={true} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(Screen.PROFILE)}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center active:scale-90 transition-transform"
          >
            {profileName ? (
              <span className="text-sm font-black text-gray-900">{profileName.charAt(0).toUpperCase()}</span>
            ) : (
              <User className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* ─── Retiring Soon Ticker ─── */}
      {!isEmpty && (
        <div className="home-r0 overflow-hidden border-y border-gray-200 bg-white shadow-sm/80 py-2 shrink-0">
          <div className="ticker-inner flex gap-8 whitespace-nowrap" style={{ width: 'max-content' }}>
            {[...RETIRING_SOON, ...RETIRING_SOON].map((r, i) => (
              <span key={i} className="text-[11px] font-bold text-gray-500 flex items-center gap-2">
                <span className="text-amber-400">⚠️</span>
                <span className="text-gray-900">{r.name} #{r.num}</span>
                retiring in {r.months}mo
                <span className="text-emerald-400">{r.gain}</span>
                <span className="text-gray-400 mx-2">·</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ─── Main Scrollable ─── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-28">

        {/* ─── Value Hero Section ─── */}
        <div className="px-6 mt-6">
          {mounted && (
            <div className="home-r1">
              {/* Category label like Brickify */}
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">VALUE TRACKER</p>

              <div className="flex items-end gap-3 mb-1">
                <div className="text-[52px] font-black text-gray-900 tracking-tight leading-none">
                  {hideValue ? '••••••' : (
                    isEmpty
                      ? '$0.00'
                      : `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  )}
                </div>
                <button
                  onClick={() => setHideValue(!hideValue)}
                  className="mb-2 text-gray-400 active:opacity-50 transition-opacity"
                >
                  {hideValue ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Growth badge */}
              <div className="flex items-center gap-2 mb-5">
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-black ${isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{changePercent}%
                </div>
                <span className="text-gray-400 text-[12px] font-medium">
                  {timeFilter === '1D' ? 'today' : timeFilter === '1W' ? 'this week' : timeFilter === '1M' ? 'this month' : `past ${timeFilter}`}
                </span>
              </div>
            </div>
          )}

          {/* ─── Chart ─── */}
          {mounted && (
            <div className="home-r2 bg-white shadow-sm rounded-[24px] border border-gray-100 p-4 mb-4 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/4 to-transparent pointer-events-none" />

              {isEmpty ? (
                <div className="h-24 flex flex-col items-center justify-center gap-2">
                  <TrendingUp className="w-8 h-8 text-zinc-700" />
                  <p className="text-gray-400 text-xs font-semibold">Add items to track value</p>
                </div>
              ) : (
                <div className="h-[100px] w-full">
                  <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Fill area */}
                    <path
                      d={`${CHART_PATHS[timeFilter]} L400,100 L0,100 Z`}
                      fill="url(#hg)"
                    />
                    {/* Line */}
                    <path
                      d={CHART_PATHS[timeFilter]}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* End dot */}
                    <circle cx="400" cy="8" r="4" fill="#10B981" />
                    <circle cx="400" cy="8" r="7" fill="#10B981" fillOpacity="0.2" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* ─── Time Filter Pills (like Brickify) ─── */}
          {mounted && (
            <div className="home-r2 flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-6">
              {TIME_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black transition-all active:scale-90 ${
                    timeFilter === f
                      ? 'bg-emerald-500 text-gray-900 shadow-[0_4px_15px_rgba(16,185,129,0.4)]'
                      : 'bg-white text-gray-400 border border-gray-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Stats Row ─── */}
        {mounted && (
          <div className="home-r3 px-6 mb-6">
            <div className="grid grid-cols-4 gap-2">
              {stats.map((s, i) => (
                <div key={i} className="bg-white shadow-sm rounded-2xl p-3 border border-gray-100 flex flex-col items-center gap-1">
                  <span className="text-base">{s.icon}</span>
                  <p className="text-[14px] font-black text-gray-900">{s.value}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TOOLS Section (like Brickify) ─── */}
        {mounted && (
          <div className="home-r4 px-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.18em]">TOOLS</h2>
            </div>
            <div className="bg-white shadow-sm rounded-[22px] border border-gray-100 overflow-hidden divide-y divide-white/5">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onNavigate(Screen.SCANNER)}
                  className="w-full flex items-center gap-4 px-5 py-4 active:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-2xl ${tool.bg} border ${tool.border} flex items-center justify-center shrink-0 text-lg`}>
                    {tool.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-900">{tool.label}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{tool.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── My Collection Preview ─── */}
        {mounted && (
          <div className="home-r5 px-6 mb-6">
            <button
              onClick={() => onNavigate(Screen.COLLECTION)}
              className="w-full bg-white shadow-sm rounded-[22px] border border-gray-100 px-5 py-4 flex items-center gap-4 active:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-bold text-gray-900">My Collection</p>
                <p className="text-[11px] text-gray-400 font-medium">
                  {collection.length} sets · {isEmpty ? '0 minifigures' : `${totalValue > 0 ? '$' + totalValue.toFixed(0) : 'calculating'} value`}
                </p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-gray-500" />
              </div>
            </button>
          </div>
        )}

        {/* ─── Top Sets Grid (if collection populated) ─── */}
        {mounted && !isEmpty && topSets.length > 0 && (
          <div className="home-r5 px-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.18em]">TOP GAINING SETS</h2>
              </div>
              <button onClick={() => onNavigate(Screen.COLLECTION)} className="text-[11px] font-black text-emerald-500 active:opacity-70">
                See All →
              </button>
            </div>
            <div className="space-y-2">
              {topSets.slice(0, 4).map((set, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: set.setNum })}
                  className="w-full bg-white shadow-sm rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-4 active:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-[#F5F5F7] rounded-xl overflow-hidden p-1 shrink-0">
                    <img src={set.imageUrl} alt={set.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[13px] font-bold text-gray-900 truncate">{set.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium">#{set.setNum?.split('-')[0]}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-black text-emerald-400">${set.retailPrice || 149}</p>
                    <div className="flex items-center gap-0.5 justify-end">
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                      <p className="text-[10px] font-bold text-emerald-500">+{(4.2 + i * 1.3).toFixed(1)}%</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Empty State ─── */}
        {mounted && isEmpty && (
          <div className="home-r5 px-6 mb-6">
            <div className="bg-white shadow-sm rounded-[24px] border border-dashed border-gray-200 p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-[18px] font-black text-gray-900 mb-2">Start Your Collection</h3>
              <p className="text-gray-400 text-[13px] font-medium mb-6 leading-relaxed">
                Scan your first LEGO set to instantly see its market value and start tracking your portfolio.
              </p>
              <button
                onClick={() => onNavigate(Screen.SCANNER)}
                className="bg-emerald-500 text-black px-7 py-3.5 rounded-2xl font-black text-[14px] flex items-center gap-2 shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-95 transition-transform"
              >
                <Camera className="w-5 h-5" />
                Scan First Set
              </button>
            </div>
          </div>
        )}

        {/* ─── Wishlist Quick Access ─── */}
        {mounted && (
          <div className="home-r5 px-6 mb-6">
            <button
              onClick={() => onNavigate(Screen.WISHLIST)}
              className="w-full flex items-center gap-4 px-5 py-4 bg-white shadow-sm rounded-[22px] border border-gray-100 active:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-pink-400" fill="#F472B6" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-bold text-gray-900">Wishlist</p>
                <p className="text-[11px] text-gray-400 font-medium">Sets you want to track &amp; buy next</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-700" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
