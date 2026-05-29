import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { User, Plus, Heart, BarChart2 } from 'lucide-react';
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
      setTotalValue(stats.totalValueNew > 0 ? stats.totalValueNew : 18740); // Mockup value fallback
      setChangePercent(stats.roiPercentage !== 0 ? stats.roiPercentage : 4.2);
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
  const returnPct = changePercent;

  // Premium sets (Mock or Real)
  const premiumSets = collection.length > 0 
    ? collection
        .map(item => sets.find(s => s.setNum === item.setNum))
        .filter((s): s is any => !!s)
        .slice(0, 4)
    : [
        { name: 'Millennium Falcon', setNum: '75192-1', retailPrice: 849.99, imageUrl: 'https://cdn.rebrickable.com/media/sets/75192-1/1.jpg' },
        { name: 'Titanic', setNum: '10294-1', retailPrice: 679.99, imageUrl: 'https://cdn.rebrickable.com/media/sets/10294-1/1.jpg' },
        { name: 'Hogwarts Castle', setNum: '71043-1', retailPrice: 469.99, imageUrl: 'https://cdn.rebrickable.com/media/sets/71043-1/1.jpg' },
        { name: 'Home Alone', setNum: '21330-1', retailPrice: 299.99, imageUrl: 'https://cdn.rebrickable.com/media/sets/21330-1/1.jpg' }
      ];

  const pieceCount = premiumSets.reduce((acc, set) => acc + (set.numParts || 0), 0) || 89000;

  return (
    <div className="flex flex-col h-full bg-[#111111] font-sans text-white relative overflow-hidden select-none">
      
      {/* Header */}
      <div className="px-6 pt-[max(env(safe-area-inset-top),3rem)] pb-2 flex items-center justify-between z-10">
        <h1 className="text-[20px] font-black tracking-widest text-white/90">
          BRICK<span className="text-zinc-500 font-medium">FOLIO</span>
        </h1>
        <button className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden active:scale-95 transition-transform">
          <User className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Value Display */}
        <div className="px-6 mt-6">
          <div className="flex items-center gap-3">
            <span className="text-[48px] font-semibold text-white tracking-tight leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              ${displayValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="text-sm font-bold text-emerald-400">+{returnPct.toFixed(1)}% ↗</span>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-[15px] font-medium text-zinc-400">Total Collection Value</p>
            <p className="text-[13px] font-medium text-zinc-500">{collection.length || 142} Sets / {(pieceCount / 1000).toFixed(0)}k Pieces</p>
          </div>
        </div>

        {/* Top Sets Grid */}
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
                {/* Glow effect on tap/hover */}
                <div className="absolute inset-0 bg-blue-500/0 group-active:bg-blue-500/10 transition-colors" />
                
                <p className="text-[10px] text-zinc-400 font-medium truncate mb-2 pr-2 leading-tight">
                  {set.name.split(' ').slice(0, 4).join(' ')}<br/>
                  ({set.setNum.split('-')[0]})
                </p>
                
                <div className="w-full aspect-[4/3] flex items-center justify-center mb-3 drop-shadow-xl">
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
                  <p className="text-[14px] font-bold text-emerald-400">${set.retailPrice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10 px-6 mb-8">
          <h2 className="text-[16px] font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <button className="flex-shrink-0 flex items-center gap-2 bg-[#1A1A1A] border border-white/10 px-5 py-3.5 rounded-full active:scale-95 transition-transform">
              <Plus className="w-4 h-4 text-zinc-300" />
              <span className="text-[14px] font-medium text-white">Add Set</span>
            </button>
            <button 
              onClick={() => onNavigate(Screen.WISHLIST)}
              className="flex-shrink-0 flex items-center gap-2 bg-[#1A1A1A] border border-white/10 px-5 py-3.5 rounded-full active:scale-95 transition-transform"
            >
              <Heart className="w-4 h-4 text-zinc-300" />
              <span className="text-[14px] font-medium text-white">Wishlist</span>
            </button>
            <button 
              onClick={() => onNavigate(Screen.PORTFOLIO_ANALYTICS)}
              className="flex-shrink-0 flex items-center gap-2 bg-[#1A1A1A] border border-white/10 px-5 py-3.5 rounded-full active:scale-95 transition-transform"
            >
              <BarChart2 className="w-4 h-4 text-zinc-300" />
              <span className="text-[14px] font-medium text-white">Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
