import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Share2, Heart, Plus, TrendingUp, ShieldCheck, Sparkles, Check, Info, Bell, RefreshCw, Layers } from 'lucide-react';
import { Screen, CollectionItem, WishlistItem } from '../types';
import { collectiblesDatabase, AnyCollectible } from '../lib/collectiblesDatabase';
import { marketFeedService, MarketFeedStatus } from '../services/marketFeedService';
import confetti from 'canvas-confetti';

interface SetDetailScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  setNum?: string;
}

export const SetDetailScreen: React.FC<SetDetailScreenProps> = ({ onNavigate, setNum }) => {
  const activeCode = setNum || '75252-1';
  const item: AnyCollectible = useMemo(() => 
    collectiblesDatabase.findById(activeCode) || collectiblesDatabase.getSets()[0], 
    [activeCode]
  );
  
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1Y');
  const [isAdded, setIsAdded] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [marketStatus, setMarketStatus] = useState<MarketFeedStatus>(marketFeedService.getStatus());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsub = marketFeedService.subscribe(() => {
      setMarketStatus(marketFeedService.getStatus());
    });
    // Trigger daily sync if due
    marketFeedService.syncDailyMarketRates(false);
    return () => { unsub(); };
  }, []);

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    await marketFeedService.syncDailyMarketRates(true);
    setIsRefreshing(false);
    confetti({ particleCount: 35, spread: 45, origin: { y: 0.85 } });
  };

  const priceHistory = useMemo(() => collectiblesDatabase.getPriceHistory(item.code, 12), [item.code]);

  // Generate SVG path for price trend
  const chartPath = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return '';
    const minVal = Math.min(...priceHistory.map(p => p.sealed));
    const maxVal = Math.max(...priceHistory.map(p => p.sealed));
    const range = maxVal - minVal || 1;

    const points = priceHistory.map((p, i) => {
      const x = (i / (priceHistory.length - 1)) * 360;
      const y = 80 - ((p.sealed - minVal) / range) * 65;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M${points.join(' L')}`;
  }, [priceHistory]);

  const handleAddToCollection = () => {
    try {
      const stored = localStorage.getItem('hellobrick_collection_sets');
      const current: CollectionItem[] = stored ? JSON.parse(stored) : [];

      current.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: 'user-1',
        setNum: item.code,
        condition: 'sealed',
        quantity: 1,
        purchasePrice: item.sealedPrice,
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: `Added from Universal Market Dossier`,
        addedAt: new Date().toISOString(),
        itemType: item.category === 'minifigure' ? 'minifig' : (item.category === 'set' ? 'set' : 'brick')
      });

      localStorage.setItem('hellobrick_collection_sets', JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('hellobrick:collection-updated'));
      setIsAdded(true);

      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#10B981', '#FF7A30', '#3B82F6']
      });
    } catch (e) {}
  };

  const handleToggleWishlist = () => {
    try {
      const stored = localStorage.getItem('hellobrick_wishlist_sets');
      let current: WishlistItem[] = stored ? JSON.parse(stored) : [];

      if (isWished) {
        current = current.filter(w => w.setNum !== item.code);
        setIsWished(false);
      } else {
        current.push({
          id: `wish_${Date.now()}`,
          userId: 'user-1',
          setNum: item.code,
          targetPrice: item.sealedPrice * 0.9,
          alertEnabled: true,
          addedAt: new Date().toISOString(),
          itemType: item.category === 'minifigure' ? 'minifig' : 'set'
        });
        setIsWished(true);
      }

      localStorage.setItem('hellobrick_wishlist_sets', JSON.stringify(current));
    } catch (e) {}
  };

  const isCard = item.category === 'pokemon' || item.category === 'sports' || item.category === 'other_tcg';

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans text-gray-900 overflow-y-auto pb-32 select-none">
      
      {/* ─── Top Sticky Header ─── */}
      <div className="px-5 pt-[max(env(safe-area-inset-top),2.5rem)] pb-3 flex items-center justify-between sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-xl z-20">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">MARKET DOSSIER</p>
          <h2 className="text-xs font-bold text-gray-700">#{item.code}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleToggleWishlist}
            className={`w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              isWished ? 'text-rose-500 bg-rose-50' : 'text-gray-600'
            }`}
          >
            <Heart className="w-5 h-5" fill={isWished ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="px-5 mt-2 space-y-4">
        
        {/* ─── 1. Hero Showcase Card ─── */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-200/80 shadow-sm relative overflow-hidden flex flex-col items-center">
          
          {/* Status Badges */}
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              {item.theme} · {item.year}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-gray-900 text-white px-2.5 py-1 rounded-full">
              {item.rating}
            </span>
          </div>

          {/* Large Image */}
          <div className="w-full h-56 flex items-center justify-center p-2 mb-4">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="max-h-full max-w-full object-contain filter drop-shadow-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.brickset.com/sets/images/75192-1.jpg';
              }}
            />
          </div>

          {/* Title & Info */}
          <h1 className="text-xl font-black text-gray-900 text-center leading-tight">{item.name}</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1 text-center">
            {item.category === 'set' && `Set #${item.code} · ${(item as any).pieces?.toLocaleString()} pieces · ${(item as any).minifigsCount} minifigs`}
            {item.category === 'minifigure' && `Minifigure #${item.code} · ${(item as any).exclusiveSetName || 'Collector Edition'}`}
            {item.category === 'pokemon' && `Card #${(item as any).cardNumber} · ${(item as any).setSeries}`}
            {item.category === 'sports' && `Card #${(item as any).cardNumber} · ${(item as any).player} · ${(item as any).sport}`}
            {item.category === 'other_tcg' && `Card #${(item as any).cardNumber} · ${(item as any).game}`}
            {item.category === 'moc' && `MOC Build #${item.code} · ${(item as any).pieceCount} pieces`}
          </p>

          {item.isRetired && (
            <div className="mt-3 bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
              ⚠️ Official Production Retired / Vault Edition
            </div>
          )}
        </div>

        {/* ─── 2. Daily Multi-Market Aggregate Status Bar ─── */}
        <div className="bg-white rounded-[24px] p-4 border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <p className="text-[11px] font-black text-gray-900 leading-tight">LIVE MARKET FEED</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-0.5">
                Aggregated daily across 8 collectible exchanges · {item.primaryMarketplace}
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshRates}
            disabled={isRefreshing}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0 cursor-pointer"
            title="Refresh Daily Rates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>

        {/* ─── 3. Market Valuation Grid (Dynamic Cards vs Sets) ─── */}
        <div className="grid grid-cols-3 gap-2.5">
          {isCard ? (
            <>
              <div className="bg-white rounded-[24px] p-4 border border-gray-200/80 shadow-sm text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">PSA 10 GEM MINT</p>
                <p className="text-lg font-black text-emerald-600">${(item.psa10Value || item.sealedPrice * 2.5).toLocaleString()}</p>
                <p className="text-[10px] font-bold text-emerald-600 mt-0.5">+{item.growth1Y}% 1Y</p>
              </div>

              <div className="bg-white rounded-[24px] p-4 border border-gray-200/80 shadow-sm text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">PSA 9 MINT</p>
                <p className="text-lg font-black text-gray-900">${(item.psa9Value || item.sealedPrice * 1.4).toLocaleString()}</p>
                <p className="text-[10px] font-semibold text-gray-500 mt-0.5">Verified</p>
              </div>

              <div className="bg-white rounded-[24px] p-4 border border-gray-200/80 shadow-sm text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">RAW UNGRADED</p>
                <p className="text-lg font-black text-gray-900">${item.sealedPrice.toLocaleString()}</p>
                <p className="text-[10px] font-semibold text-gray-500 mt-0.5">Near Mint</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-[24px] p-4 border border-gray-200/80 shadow-sm text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">SEALED (MISB)</p>
                <p className="text-lg font-black text-gray-900">${item.sealedPrice.toFixed(0)}</p>
                <p className="text-[10px] font-bold text-emerald-600 mt-0.5">+{item.growth1Y}% 1Y</p>
              </div>

              <div className="bg-white rounded-[24px] p-4 border border-gray-200/80 shadow-sm text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">USED / COMPLETE</p>
                <p className="text-lg font-black text-gray-900">${item.usedPrice.toFixed(0)}</p>
                <p className="text-[10px] font-semibold text-gray-500 mt-0.5">Complete</p>
              </div>

              <div className="bg-white rounded-[24px] p-4 border border-gray-200/80 shadow-sm text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">ORIGINAL MSRP</p>
                <p className="text-lg font-black text-gray-900">${item.retailPrice.toFixed(0)}</p>
                <p className="text-[10px] font-semibold text-gray-500 mt-0.5">{item.year}</p>
              </div>
            </>
          )}
        </div>

        {/* ─── 4. Interactive Price History Chart ─── */}
        <div className="bg-white rounded-[28px] p-5 border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">HISTORICAL TRAJECTORY</p>
              <h3 className="text-sm font-bold text-gray-900">Price Movement</h3>
            </div>
            <div className="flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-xl">
              {(['1M', '3M', '1Y', 'ALL'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf as any)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    timeframe === tf ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full h-28 relative">
            <svg viewBox="0 0 360 85" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={`${chartPath} L360,85 L0,85 Z`}
                fill="url(#detailGrad)"
              />
              <path
                d={chartPath}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500">
            <span>12 Months Ago: ${(priceHistory[0]?.sealed || item.retailPrice).toFixed(0)}</span>
            <span className="font-black text-emerald-600">Current: ${item.sealedPrice.toFixed(0)} (+{item.growth1Y}%)</span>
          </div>
        </div>

        {/* ─── 5. Detailed Analytics Breakdown ─── */}
        <div className="bg-white rounded-[28px] p-5 border border-gray-200/80 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Collector Valuation Metrics</h3>
          
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Demand Index</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-900">{item.demandScore}/10</span>
                <span className="text-emerald-500">★★★★★</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Rarity Tier</span>
              <span className="font-bold text-gray-900">Tier {item.rarityScore} / 10 ({item.rating})</span>
            </div>

            {item.category === 'set' && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Part-Out Value (BrickLink)</span>
                <span className="font-bold text-emerald-600">${(item as any).partOutValue?.toFixed(2)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-gray-500 font-medium">Daily Liquidity Index</span>
              <span className="font-bold text-gray-900">Very High (Top 2% Market Volume)</span>
            </div>
          </div>
        </div>

        {/* ─── 6. Action Button ─── */}
        <div className="pt-2">
          <button
            onClick={handleAddToCollection}
            className={`w-full py-4 rounded-2xl font-black text-base shadow-[0_8px_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isAdded 
                ? 'bg-gray-900 text-white' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-[0.98]'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-5 h-5" />
                <span>Added to Your Vault</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Add to My Collection Vault</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
