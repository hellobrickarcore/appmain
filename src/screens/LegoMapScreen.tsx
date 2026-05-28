import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Filter, MapPin, Globe, TrendingUp, TrendingDown } from 'lucide-react';
import { Screen, CollectionItem } from '../types';
import { getCollectionFromStorage } from '../lib/dataProvider';

interface LegoMapScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

export const LegoMapScreen: React.FC<LegoMapScreenProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [collection, setCollection] = useState<CollectionItem[]>([]);

  useEffect(() => {
    getCollectionFromStorage().then(setCollection);
  }, []);

  const pricingRegions = [
    { id: 'eu', name: 'Europe', price: collection.length > 0 ? '$410.00' : '$0.00', lat: 35, lng: 55 },
    { id: 'na', name: 'North America', price: collection.length > 0 ? '$399.99' : '$0.00', lat: 40, lng: 20 },
    { id: 'as', name: 'Asia', price: collection.length > 0 ? '$450.00' : '$0.00', lat: 38, lng: 80 },
    { id: 'au', name: 'Oceania', price: collection.length > 0 ? '$480.00' : '$0.00', lat: 75, lng: 85 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0D111A] font-sans text-white relative overflow-hidden select-none">
      
      {/* 1. MAP GRAPHICS ENGINE */}
      <div className="flex-1 w-full relative bg-[#161B26] min-h-[400px] z-0">
        
        {/* World Map SVG Mock */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Simple grid */}
          <line x1="20" y1="0" x2="20" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
          <line x1="40" y1="0" x2="40" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
          <line x1="60" y1="0" x2="60" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
          <line x1="80" y1="0" x2="80" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
          
          <line x1="0" y1="25" x2="100" y2="25" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />

          {/* Continents outlines (rough) */}
          <path d="M 10,20 C 30,10 40,30 30,50 C 20,40 5,30 10,20 Z" fill="#1DA1F2" fillOpacity="0.1" stroke="#1DA1F2" strokeWidth="0.5" />
          <path d="M 45,25 C 60,15 70,30 65,45 C 55,50 40,40 45,25 Z" fill="#1DA1F2" fillOpacity="0.1" stroke="#1DA1F2" strokeWidth="0.5" />
          <path d="M 75,30 C 95,20 100,50 85,60 C 70,55 75,40 75,30 Z" fill="#1DA1F2" fillOpacity="0.1" stroke="#1DA1F2" strokeWidth="0.5" />
          <path d="M 80,70 C 90,65 95,80 85,90 C 75,85 75,75 80,70 Z" fill="#1DA1F2" fillOpacity="0.1" stroke="#1DA1F2" strokeWidth="0.5" />
        </svg>

        {/* Top Header */}
        <div className="absolute top-[max(env(safe-area-inset-top),2rem)] inset-x-6 flex flex-col gap-4 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(Screen.HOME)}
              className="w-11 h-11 bg-white/10 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md active:scale-90 transition-transform"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 flex items-center gap-2.5 backdrop-blur-md">
              <Search className="w-4 h-4 text-white/70" />
              <input 
                type="text" 
                placeholder="Search set..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-sm font-medium w-full placeholder:text-white/50"
              />
            </div>
          </div>
        </div>

        {/* Floating Map Price Tags */}
        {pricingRegions.map((region) => (
          <div
            key={region.id}
            className="absolute z-20 group transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${region.lng}%`, top: `${region.lat}%` }}
          >
            <div className="bg-[#FF7A30] text-white font-black text-xs px-3 py-1.5 rounded-lg shadow-lg shadow-[#FF7A30]/30 border border-[#FF7A30]/50 relative mb-1">
              {region.price}
              <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-[#FF7A30]"></div>
            </div>
            <div className="w-3 h-3 bg-white rounded-full shadow-md border-2 border-[#161B26]"></div>
          </div>
        ))}
      </div>

      {/* 2. BOTTOM SHEET */}
      <div className="bg-[#0D111A] rounded-t-[36px] px-6 pt-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] shrink-0 min-h-[300px]">
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Global Market Pricing</h2>
          <p className="text-sm font-medium text-slate-400 mt-1">Real-time data across all regions</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#161B26] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
            <Globe className="w-6 h-6 text-[#1DA1F2] mb-2" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Global Avg</span>
            <span className="text-xl font-black text-white mt-1">{collection.length > 0 ? '$425.00' : '$0.00'}</span>
          </div>

          <div className="bg-[#161B26] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
            <TrendingUp className="w-6 h-6 text-emerald-400 mb-2" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Highest (Oceania)</span>
            <span className="text-xl font-black text-emerald-400 mt-1">{collection.length > 0 ? '$480.00' : '$0.00'}</span>
          </div>

          <div className="bg-[#161B26] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center col-span-2">
            <TrendingDown className="w-6 h-6 text-[#FF7A30] mb-2" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lowest (North America)</span>
            <span className="text-2xl font-black text-[#FF7A30] mt-1">{collection.length > 0 ? '$399.99' : '$0.00'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

