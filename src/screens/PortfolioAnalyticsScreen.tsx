import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  TrendingUp, 
  Star, 
  Layers, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  LineChart,
  Award,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { Screen, CollectionItem } from '../types';
import { getCollectionFromStorage, getSets, getValuationsMap } from '../lib/dataProvider';

interface PortfolioAnalyticsScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

export const PortfolioAnalyticsScreen: React.FC<PortfolioAnalyticsScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'sets' | 'minifigs'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<'Sep' | 'Dec' | 'Today'>('Today');
  
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [sets, setSets] = useState<any[]>([]);
  const [valuationsMap, setValuationsMap] = useState(new Map<string, any>());

  useEffect(() => {
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

  const totalValue = useMemo(() => {
    if (collection.length === 0) return 0;
    let val = 0;
    collection.forEach((item, idx) => {
      const set = sets.find(s => s.setNum === item.setNum) || { retailPrice: 149.99 };
      const v = valuationsMap.get(item.setNum) || {
        sealedValue: set.retailPrice || 149.99,
        usedValue: (set.retailPrice || 149.99) * 0.7
      };
      const quantity = (item as any).quantity ?? 1;
      val += (item.condition === 'sealed' ? v.sealedValue : v.usedValue) * quantity;
    });
    return val;
  }, [collection, sets, valuationsMap]);


  return (
    <div className="flex flex-col min-h-screen bg-[#0D111A] font-sans text-white relative overflow-hidden select-none">
      {/* Background radial spotlight glows */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-[#C9A84C]/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/[0.03] blur-[100px] rounded-full pointer-events-none" />

      {/* Sticky Header */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between bg-[#0D111A]/85 backdrop-blur-xl border-b border-white/5 shrink-0">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-1.5 justify-center">
            Portfolio Analytics
          </h1>
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block mt-0.5">Advanced collection metrics</span>
        </div>
        <div className="w-10 h-10 opacity-0 pointer-events-none" />
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto no-scrollbar pb-36 pt-4 px-6 space-y-5">
          
          {/* Header Summary Cards */}
          <div className="flex items-end justify-between">
            <div className="text-left">
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">PORTFOLIO DEEP DIVE</span>
              <h2 className="text-2xl font-black text-white mt-1 leading-none tracking-tight">
                Advanced <br />Collection Analytics
              </h2>
            </div>
            <div className="text-right bg-gradient-to-tr from-[#C9A84C]/10 to-[#E5C158]/5 border border-[#C9A84C]/25 p-4 rounded-3xl min-w-[120px]">
              <span className="text-[7px] font-black text-[#C9A84C] uppercase tracking-widest block">PREMIUM VALUATION</span>
              <span className="font-mono text-xl font-black text-[#C9A84C] mt-1 block leading-none">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Section: Split Selector */}
          <div className="bg-[#161B26] p-1 rounded-2xl flex gap-1 border border-white/5">
            {(['all', 'sets', 'minifigs'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${
                  activeTab === tab 
                    ? 'bg-white/5 text-[#C9A84C] border border-white/5 shadow-sm'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab === 'all' && 'All Assets'}
                {tab === 'sets' && 'Sets Only'}
                {tab === 'minifigs' && 'Minifigures'}
              </button>
            ))}
          </div>

          {/* TWO GRAPH CARDS GRID: Theme Distribution & Rarity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Graph Card 1: Value Distribution by Theme */}
            <div className="bg-[#161B26] border border-white/5 rounded-[32px] p-5 text-left shadow-xl">
              <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block">THEMATIC DENSITY</span>
              <h3 className="text-sm font-black text-white mt-0.5 mb-5">Value Distribution by Theme</h3>
              
              <div className="h-32 flex items-end justify-between gap-3 px-2">
                {/* Column 1: Star Wars */}
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full bg-[#3B82F6]/90 rounded-t-lg transition-all hover:scale-105 duration-300 shadow-lg shadow-blue-500/10" style={{ height: '75%' }} />
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-wider truncate max-w-[40px]">SW</span>
                </div>
                {/* Column 2: Creator */}
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full bg-[#10B981]/90 rounded-t-lg transition-all hover:scale-105 duration-300 shadow-lg shadow-emerald-500/10" style={{ height: '55%' }} />
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-wider truncate max-w-[40px]">CRE</span>
                </div>
                {/* Column 3: Technic */}
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full bg-[#C9A84C]/90 rounded-t-lg transition-all hover:scale-105 duration-300 shadow-lg shadow-[#C9A84C]/10" style={{ height: '85%' }} />
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-wider truncate max-w-[40px]">TEC</span>
                </div>
                {/* Column 4: Ideas */}
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full bg-[#F59E0B]/90 rounded-t-lg transition-all hover:scale-105 duration-300 shadow-lg shadow-amber-500/10" style={{ height: '40%' }} />
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-wider truncate max-w-[40px]">IDE</span>
                </div>
              </div>
            </div>

            {/* Graph Card 2: Rarity Distribution */}
            <div className="bg-[#161B26] border border-white/5 rounded-[32px] p-5 text-left shadow-xl relative overflow-hidden">
              <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block">INVESTMENT RARITY</span>
              <h3 className="text-sm font-black text-white mt-0.5 mb-5">Rarity Distribution</h3>
              
              <div className="flex items-center gap-6 justify-center">
                {/* Donut chart SVG representation */}
                <div className="w-24 h-24 relative flex items-center justify-center">
                  <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
                    {/* Circle Rare (Gold) */}
                    <circle cx="20" cy="20" r="16" fill="transparent" className="stroke-[#C9A84C]" strokeWidth="4.5" strokeDasharray="100" strokeDashoffset="0" />
                    {/* Circle Standard (Blue) */}
                    <circle cx="20" cy="20" r="16" fill="transparent" className="stroke-[#3B82F6]" strokeWidth="4.5" strokeDasharray="100" strokeDashoffset="35" />
                    {/* Circle Common (Green) */}
                    <circle cx="20" cy="20" r="16" fill="transparent" className="stroke-[#10B981]" strokeWidth="4.5" strokeDasharray="100" strokeDashoffset="75" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[9px] font-mono font-black text-slate-400">INDEX</span>
                    <span className="font-mono text-sm font-black text-white leading-none">88/100</span>
                  </div>
                </div>

                {/* Donut Chart legend indicators */}
                <div className="flex flex-col gap-2 justify-center text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">35% RARE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">40% MID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">25% COMMON</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Graph Card 3: Portfolio Value Growth Over Time */}
          <div className="bg-[#161B26] border border-white/5 rounded-[32px] p-5 text-left shadow-xl">
            <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block">HISTORICAL APPRECIATION</span>
            <h3 className="text-sm font-black text-white mt-0.5 mb-5">Portfolio Value Growth Over Time</h3>
            
            <div className="h-32 bg-[#0D111A] border border-white/5 rounded-2xl p-3 relative flex items-end justify-center">
              
              {/* Horizontal grids */}
              <div className="absolute inset-x-0 top-1/4 h-px border-t border-dashed border-white/5 pointer-events-none" />
              <div className="absolute inset-x-0 top-2/4 h-px border-t border-dashed border-white/5 pointer-events-none" />
              <div className="absolute inset-x-0 top-3/4 h-px border-t border-dashed border-white/5 pointer-events-none" />

              {/* Main growth wave line */}
              <svg viewBox="0 0 100 40" className="w-full h-full stroke-emerald-400 z-10" fill="none" strokeWidth="2.5">
                <defs>
                  <linearGradient id="growthGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0,38 C 20,38 40,25 60,20 C 80,15 90,5 100,2" />
                <path d="M 0,38 C 20,38 40,25 60,20 C 80,15 90,5 100,2 L 100,40 L 0,40 Z" fill="url(#growthGlow)" stroke="none" />
                {/* Custom anchor node */}
                <circle cx="100" cy="2" r="3" fill="#0D111A" stroke="#10B981" strokeWidth="2" className="animate-pulse" />
              </svg>

              {/* Live interactive hovered indicator bubble */}
              <div className="absolute top-4 left-[65%] z-20 bg-[#161B26]/90 border border-white/10 p-2.5 rounded-2xl backdrop-blur-md shadow-lg flex flex-col items-center">
                <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest leading-none">Today</span>
                <span className="font-mono text-[9px] font-black text-emerald-400 mt-1 leading-none">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Months labels */}
            <div className="flex justify-between px-2 mt-3 select-none">
              {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Today'].map(m => (
                <span key={m} className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-wider">{m}</span>
              ))}
            </div>
          </div>

          {/* Section: Top Performing Assets */}
          <div className="bg-[#161B26] border border-white/5 rounded-[32px] p-5 text-left shadow-xl">
            <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block">HIGHLIGHT GAINERS</span>
            <h3 className="text-sm font-black text-white mt-0.5 mb-4">Top Performing Assets</h3>

            <div className="space-y-2">
              
              {collection.length === 0 ? (
                <div className="w-full text-center py-6 border border-dashed border-white/10 rounded-[20px] bg-white/5">
                  <span className="text-sm font-medium text-slate-500">No scanned sets yet</span>
                </div>
              ) : (
                collection.slice(0, 3).map((item, idx) => {
                  const set = sets.find(s => s.setNum === item.setNum) || { name: 'Unknown Set', retailPrice: 0 };
                  const v = valuationsMap.get(item.setNum) || { sealedValue: 0, usedValue: 0 };
                  const value = item.condition === 'sealed' ? v.sealedValue : v.usedValue;
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-300 flex items-center justify-center font-black text-xs text-[#0D111A]">{idx + 1}</div>
                        <div className="text-left">
                          <span className="text-xs font-black text-white block">{set.name}</span>
                          <span className="text-[8px] text-slate-500 block uppercase tracking-wider mt-0.5">Asset {idx + 1} • {item.condition}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-black text-emerald-400 block">${value.toFixed(2)}</span>
                        <span className="text-[7px] font-mono text-emerald-400 font-bold block mt-0.5 uppercase tracking-wider">+0.0%</span>
                      </div>
                    </div>
                  );
                })
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
