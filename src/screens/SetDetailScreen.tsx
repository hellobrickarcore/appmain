import React from 'react';
import { ChevronLeft, Share2, Search, TrendingUp, Info } from 'lucide-react';
import { Screen, LegoSetModel } from '../types';
import { mockSets, mockValuations, mockMinifigs } from '../lib/mock-data';

interface SetDetailScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  setNum?: string;
}

export const SetDetailScreen: React.FC<SetDetailScreenProps> = ({ onNavigate, setNum }) => {
  const activeSetNum = setNum || '10274-1'; // Default to Ecto-1 or similar
  
  const isMinifig = activeSetNum.startsWith('fig') || 
                    activeSetNum.startsWith('sp') || 
                    activeSetNum.startsWith('inf') || 
                    activeSetNum.startsWith('njo');
  
  const rawSet = mockSets.find(s => s.setNum === activeSetNum) || 
                 mockMinifigs.find(f => f.figNum === activeSetNum) || 
                 {
                   id: "set-default",
                   name: "Ghostbusters ECTO-1",
                   setNum: "10274-1",
                   retailPrice: 239.99,
                   imageUrl: 'https://cdn.rebrickable.com/media/sets/10274-1.jpg',
                   isRetired: true,
                   type: 'set' as const
                 };

  const set = {
    id: rawSet.id,
    name: rawSet.name,
    setNum: 'setNum' in rawSet ? rawSet.setNum : ('figNum' in rawSet ? rawSet.figNum : activeSetNum),
    retailPrice: 'retailPrice' in rawSet ? rawSet.retailPrice : ('resaleValue' in rawSet ? rawSet.resaleValue : 199.99),
    imageUrl: rawSet.imageUrl,
    isRetired: 'isRetired' in rawSet ? rawSet.isRetired : true,
    type: 'type' in rawSet ? rawSet.type : 'minifig'
  };

  // Fake history chart data
  const chartPoints = "0,80 50,50 100,60 150,30 200,40 250,15 300,20";

  return (
    <div className="flex flex-col min-h-screen bg-[#111111] font-sans text-white overflow-y-auto pb-32">
      
      {/* Header */}
      <div className="px-6 pt-[max(env(safe-area-inset-top),3rem)] pb-4 flex items-center justify-between z-10 sticky top-0 bg-[#111111]/90 backdrop-blur-md">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 flex items-center justify-center -ml-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full">
             <span className="font-bold text-xs">HB</span>
           </div>
           <span className="font-bold tracking-wide">HelloBrick</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full -mr-2 active:scale-95 transition-transform">
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold mb-6 tracking-tight">Set Detail</h1>

        {/* Hero Image Card */}
        <div className="bg-[#1A1A1A] rounded-[32px] p-6 flex flex-col items-center relative border border-white/5 shadow-2xl mb-6">
           <img 
              src={set.imageUrl} 
              alt={set.name}
              className="w-full max-w-[280px] h-[200px] object-contain drop-shadow-2xl mb-4"
           />
           {set.isRetired && (
             <div className="absolute bottom-6 left-6 bg-[#FF6B6B]/20 border border-[#FF6B6B]/50 text-[#FF6B6B] px-4 py-1.5 rounded-full font-bold text-sm tracking-wide">
               Retired
             </div>
           )}
        </div>

        <h2 className="text-xl font-semibold mb-6 px-2">{set.name}</h2>

        {/* Value Cards (Sealed, Used, Resale) */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-[24px] p-4 flex flex-col items-center justify-center shadow-lg">
             <span className="text-zinc-500 font-semibold text-sm mb-1">Sealed</span>
             <span className="text-black font-bold text-xl">${(set.retailPrice * 1.8).toFixed(0)}</span>
          </div>
          <div className="bg-[#FFB067] rounded-[24px] p-4 flex flex-col items-center justify-center shadow-[0_8px_24px_rgba(255,176,103,0.3)]">
             <span className="text-black/70 font-semibold text-sm mb-1">Used</span>
             <span className="text-black font-bold text-xl">${(set.retailPrice * 1.2).toFixed(0)}</span>
          </div>
          <div className="bg-white rounded-[24px] p-4 flex flex-col items-center justify-center shadow-lg">
             <span className="text-zinc-500 font-semibold text-sm mb-1">Resale</span>
             <span className="text-black font-bold text-xl">${(set.retailPrice * 1.5).toFixed(0)}</span>
          </div>
        </div>

        {/* Price History Chart */}
        <div className="bg-white rounded-[32px] p-6 text-black shadow-xl mb-6 relative overflow-hidden">
           <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="font-bold text-lg">Price History</h3>
              <span className="text-zinc-400 font-semibold text-sm">Drop</span>
           </div>

           {/* Elegant Graph Area */}
           <div className="h-[140px] w-full relative mb-6">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                <div className="border-t border-zinc-100 w-full flex items-start"><span className="text-xs text-zinc-400 -mt-2 ml-1">$5k</span></div>
                <div className="border-t border-zinc-100 w-full flex items-start"><span className="text-xs text-zinc-400 -mt-2 ml-1">$2k</span></div>
                <div className="border-t border-zinc-100 w-full flex items-start"><span className="text-xs text-zinc-400 -mt-2 ml-1">$1k</span></div>
                <div className="border-t border-zinc-100 w-full flex items-start"><span className="text-xs text-zinc-400 -mt-2 ml-1">$50</span></div>
              </div>
              
              {/* SVG Line */}
              <div className="absolute inset-0 pl-8 pb-4">
                 <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF7A30" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FF7A30" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d={`M0,100 L${chartPoints} L300,100 Z`}
                      fill="url(#gradientArea)"
                    />
                    <path 
                      d={`M${chartPoints}`}
                      fill="none" 
                      stroke="#FF7A30" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <circle cx="300" cy="20" r="6" fill="#FF7A30" stroke="white" strokeWidth="2" />
                 </svg>
              </div>
           </div>

           {/* X-Axis labels */}
           <div className="flex justify-between px-8 text-zinc-400 font-semibold text-xs relative z-10">
              <span>40</span>
              <span>31</span>
              <span>44</span>
              <span>19</span>
              <span>31</span>
              <span>22</span>
           </div>
        </div>

        {/* Rarity Score Card */}
        <div className="bg-white rounded-[24px] p-5 flex items-center justify-between text-black shadow-lg">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FF7A30] rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(255,122,48,0.3)]">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-2xl font-black">9.5</span>
                 <span className="text-zinc-500 font-semibold text-sm pt-1">Rarity Score</span>
              </div>
           </div>
           <ChevronLeft className="w-6 h-6 text-zinc-400 transform rotate-180" />
        </div>

      </div>
    </div>
  );
};
