import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { User, Plus, Heart, BarChart2, PackageOpen, Camera } from 'lucide-react';
import { Screen, CollectionItem } from '../types';
import { valuationService } from '../services/valuationService';
import { getCollectionFromStorage, getSets, getValuationsMap } from '../lib/dataProvider';
import { Logo } from '../components/Logo';

interface HomeScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [sets, setSets] = useState<any[]>([]);
  const [valuationsMap, setValuationsMap] = useState(new Map<string, any>());
  const [totalValue, setTotalValue] = useState(0);
  const [changePercent, setChangePercent] = useState(0);

  const fetchPortfolio = async () => {
    try {
      const stats = await valuationService.getPortfolioValuation();
      setTotalValue(stats.totalValueNew);
      setChangePercent(stats.roiPercentage);
    } catch (e) {
      console.error("Failed to load portfolio", e);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    const loadData = async () => {
      const [col, fetchSets, vals] = await Promise.all([
        getCollectionFromStorage(),
        getSets(),
        getValuationsMap()
      ]);
      setCollection(col);
      setSets(fetchSets);
      setValuationsMap(vals);
    };
    loadData();
  }, []);

  const premiumSets = collection
    .map(item => sets.find(s => s.setNum === item.setNum))
    .filter((s): s is any => !!s)
    .slice(0, 4);

  const isEmpty = collection.length === 0;

  return (
    <div className="flex flex-col h-full bg-[#111111] font-sans text-white relative overflow-hidden select-none">
      
      {/* Header */}
      <div className="px-6 pt-[max(env(safe-area-inset-top),3rem)] pb-2 flex items-center justify-between z-10">
        <Logo size="sm" light={true} />
        <button 
          onClick={() => onNavigate(Screen.PROFILE)}
          className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
        >
          <User className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        
        {isEmpty ? (
          // STRONG EMPTY STATE
          <div className="px-6 mt-12 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-white/5">
              <PackageOpen className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Welcome to HelloBrick</h2>
            <p className="text-zinc-400 text-center mb-8 px-4">
              Your collection is currently empty. Start scanning your sets to instantly reveal their real-time market value.
            </p>
            <button 
              onClick={() => onNavigate(Screen.SCANNER)}
              className="bg-emerald-500 text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)] active:scale-95 transition-transform"
            >
              <Camera className="w-6 h-6" />
              Scan First Set
            </button>
          </div>
        ) : (
          // POPULATED DASHBOARD
          <div className="animate-in fade-in duration-500">
            {/* Value Display */}
            <div className="px-6 mt-6">
              <div className="flex items-center gap-3">
                <span className="text-[48px] font-semibold text-white tracking-tight leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <span className="text-sm font-bold text-emerald-400">{changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}% ↗</span>
                </div>
              </div>
              
              <div className="mt-3 flex justify-between items-end">
                <div>
                  <p className="text-[15px] font-medium text-zinc-400">Total Collection Value</p>
                  <p className="text-[13px] font-medium text-zinc-500">{collection.length} Sets Logged</p>
                </div>
              </div>

              {/* Elegant SVG Chart representing growth */}
              <div className="mt-8 bg-zinc-900 rounded-[24px] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
                <h3 className="text-sm font-semibold text-zinc-400 mb-6 tracking-wide">6 MONTH TREND</h3>
                <div className="h-32 w-full">
                  <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <path 
                      d="M0,80 C100,70 150,90 200,50 C250,10 300,40 400,20" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      className="drop-shadow-[0_5px_10px_rgba(16,185,129,0.5)]"
                    />
                    {/* Data dots */}
                    <circle cx="200" cy="50" r="5" fill="#111" stroke="#10b981" strokeWidth="2" />
                    <circle cx="400" cy="20" r="5" fill="#10b981" />
                  </svg>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-zinc-500 font-medium">Jan</span>
                  <span className="text-xs text-zinc-500 font-medium">Jun</span>
                </div>
              </div>
            </div>

            {/* Top Sets Grid */}
            {premiumSets.length > 0 && (
              <div className="mt-10 px-6">
                <button 
                  onClick={() => onNavigate(Screen.COLLECTION)}
                  className="flex items-center gap-1 mb-4 active:opacity-70 transition-opacity"
                >
                  <h2 className="text-[13px] font-bold text-zinc-300 tracking-widest uppercase">TOP SETS</h2>
                  <span className="text-[13px] font-bold text-zinc-300">→</span>
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  {premiumSets.map((set, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: set.setNum })}
                      className="bg-[#1A1A1A] border border-white/10 rounded-[20px] p-3 shadow-[0_8px_20px_rgba(0,0,0,0.4)] active:scale-95 transition-transform relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-blue-500/0 group-active:bg-blue-500/10 transition-colors" />
                      
                      <p className="text-[10px] text-zinc-400 font-medium truncate mb-2 pr-2 leading-tight">
                        {set.name.split(' ').slice(0, 4).join(' ')}<br/>
                        ({set.setNum.split('-')[0]})
                      </p>
                      
                      <div className="w-full aspect-[4/3] flex items-center justify-center mb-3 drop-shadow-xl bg-[#111] rounded-xl p-2">
                        <img 
                          src={set.imageUrl} 
                          alt={set.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="mt-auto">
                        <h3 className="text-[11px] font-bold text-white uppercase tracking-wider truncate mb-0.5">
                          {set.name.replace('LEGO ', '').split(' ').slice(0, 2).join(' ')}
                        </h3>
                        <p className="text-[14px] font-bold text-emerald-400">${set.retailPrice || 149.99}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="mt-10 px-6 mb-8">
              <h2 className="text-[16px] font-semibold text-white mb-4">Quick Actions</h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                <button 
                  onClick={() => onNavigate(Screen.SCANNER)}
                  className="flex-shrink-0 flex items-center gap-2 bg-[#1A1A1A] border border-white/10 px-5 py-3.5 rounded-full active:scale-95 transition-transform"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="text-[14px] font-medium text-white">Scan Set</span>
                </button>
                <button 
                  onClick={() => onNavigate(Screen.WISHLIST)}
                  className="flex-shrink-0 flex items-center gap-2 bg-[#1A1A1A] border border-white/10 px-5 py-3.5 rounded-full active:scale-95 transition-transform"
                >
                  <Heart className="w-4 h-4 text-zinc-300" />
                  <span className="text-[14px] font-medium text-white">Wishlist</span>
                </button>
                <button 
                  onClick={() => onNavigate(Screen.INSIGHTS)}
                  className="flex-shrink-0 flex items-center gap-2 bg-[#1A1A1A] border border-white/10 px-5 py-3.5 rounded-full active:scale-95 transition-transform"
                >
                  <BarChart2 className="w-4 h-4 text-zinc-300" />
                  <span className="text-[14px] font-medium text-white">Insights</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
