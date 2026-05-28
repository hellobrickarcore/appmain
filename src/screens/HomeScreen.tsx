import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Search, Map as MapIcon, Home, User, Settings, ArrowUpRight } from 'lucide-react';
import { Screen, CollectionItem } from '../types';
import { valuationService } from '../services/valuationService';
import { getCollectionFromStorage, getSets, getValuationsMap } from '../lib/dataProvider';

interface HomeScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [sets, setSets] = useState<any[]>([]);
  const [valuationsMap, setValuationsMap] = useState(new Map<string, any>());
  const [totalValue, setTotalValue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [changePercent, setChangePercent] = useState(0);

  const fetchPortfolio = async () => {
    try {
      const stats = await valuationService.getPortfolioValuation();
      setTotalValue(stats.totalValueNew);
      setTotalCost(stats.totalValueUsed);
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

  const displayValue = totalValue;
  const displayCost = totalCost;
  const returnPct = changePercent;

  // Get premium sets from their actual collection (filtered by set retail price)
  const premiumSets = collection
    .map(item => sets.find(s => s.setNum === item.setNum))
    .filter((s): s is any => !!s && s.retailPrice > 100)
    .slice(0, 6);

  return (
    <div className="flex flex-col h-full bg-[#161B26] font-sans text-white relative overflow-hidden select-none">
      
      {/* Header */}
      <div className="px-6 pt-[max(env(safe-area-inset-top),3rem)] pb-4 flex items-center justify-between z-10 bg-[#161B26]">
        <h1 className="text-[22px] font-medium text-white tracking-tight">Full Collection Dashboard</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 active:scale-95 transition-transform">
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Total Value Card */}
        <div className="px-6 mt-2">
          <div className="bg-white rounded-[24px] p-6 shadow-xl relative overflow-hidden">
            <span className="text-[13px] font-semibold text-slate-500 block mb-1">Total Value</span>
            <div className="flex items-end justify-between">
              <span className="text-[34px] font-bold text-[#0D111A] tracking-tight leading-none">
                ${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full mb-1">
                <ArrowUpRight className="w-3 h-3 text-green-600" strokeWidth={3} />
                <span className="text-xs font-bold text-green-700">{returnPct.toFixed(1)}%</span>
              </div>
            </div>
            {/* Graph area in card */}
            <div className="mt-8 h-[180px] w-full relative">
               <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                 {/* Grid lines */}
                 <line x1="0" y1="180" x2="400" y2="180" stroke="#f1f5f9" strokeWidth="1" />
                 <line x1="0" y1="135" x2="400" y2="135" stroke="#f1f5f9" strokeWidth="1" />
                 <line x1="0" y1="90" x2="400" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                 <line x1="0" y1="45" x2="400" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                 
                 {/* Y Axis Labels */}
                 <text x="0" y="175" fill="#94a3b8" fontSize="10">0k</text>
                 <text x="0" y="130" fill="#94a3b8" fontSize="10">2k</text>
                 <text x="0" y="85" fill="#94a3b8" fontSize="10">4k</text>
                 <text x="0" y="40" fill="#94a3b8" fontSize="10">5k</text>
                 
                 {/* Gradient Fill */}
                 <defs>
                   <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                     <stop offset="0%" stopColor="#1DA1F2" stopOpacity="0.2" />
                     <stop offset="100%" stopColor="#1DA1F2" stopOpacity="0" />
                   </linearGradient>
                 </defs>
                 
                 {/* Line path */}
                 <path 
                   d="M 20,180 C 60,160 100,170 140,120 C 180,70 220,130 260,80 C 300,30 350,60 400,20" 
                   fill="none" 
                   stroke="#1DA1F2" 
                   strokeWidth="3" 
                   strokeLinecap="round"
                 />
                 <path 
                   d="M 20,180 C 60,160 100,170 140,120 C 180,70 220,130 260,80 C 300,30 350,60 400,20 L 400,180 L 20,180 Z" 
                   fill="url(#lineGradient)" 
                 />
                 
                 {/* Data Points */}
                 <circle cx="140" cy="120" r="4" fill="#1DA1F2" />
                 <circle cx="260" cy="80" r="4" fill="#1DA1F2" />
                 <circle cx="400" cy="20" r="5" fill="#1DA1F2" stroke="white" strokeWidth="2" />
               </svg>
               {/* Current Value Tooltip */}
               <div className="absolute -top-3 -right-2 bg-[#0D111A] text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                 14k
               </div>
            </div>
          </div>
        </div>

        {/* Premium Sets Section */}
        <div className="mt-10 pl-6">
          <div className="flex items-center justify-between pr-6 mb-4">
            <h2 className="text-xl font-medium text-white tracking-tight">Premium Sets</h2>
            <button 
              onClick={() => onNavigate(Screen.COLLECTION)}
              className="text-[13px] font-medium text-slate-400 hover:text-white"
            >
              View All
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 pr-6 snap-x">
            {premiumSets.length === 0 ? (
              <div className="w-full text-center py-6 border border-dashed border-white/10 rounded-[20px] bg-white/5">
                <span className="text-sm font-medium text-slate-500">Scan sets to populate your portfolio</span>
              </div>
            ) : (
              premiumSets.map((set, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onNavigate(Screen.SET_DETAIL, { setNum: set.setNum })}
                  className="w-40 flex-shrink-0 snap-start active:scale-95 transition-transform"
                >
                  <div className="w-full aspect-square bg-white rounded-[20px] p-4 flex items-center justify-center mb-3 shadow-lg relative">
                    <img 
                      src={set.imageUrl || `https://cdn.rebrickable.com/media/sets/${set.setNum}/1.jpg`} 
                      alt={set.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/200?random=' + idx;
                      }}
                    />
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-slate-700">↗</span>
                    </div>
                  </div>
                  <div className="px-1">
                    <h3 className="text-[14px] font-medium text-white truncate">{set.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[13px] font-bold text-slate-300">${set.retailPrice || 149.99}</span>
                      <span className="text-[11px] font-medium text-green-400">+{Math.floor(Math.random() * 10) + 2}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
