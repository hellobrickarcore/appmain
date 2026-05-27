import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  Search, 
  MapPin, 
  Navigation, 
  Clock, 
  Filter, 
  Check, 
  Phone, 
  Compass, 
  AlertCircle,
  Settings
} from 'lucide-react';
import { Screen } from '../types';

interface LegoMapScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

interface LegoStoreLocation {
  id: string;
  name: string;
  distance: string;
  address: string;
  inStock: boolean;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
  type: 'store' | 'outlet' | 'convention' | 'pickup';
}

export const LegoMapScreen: React.FC<LegoMapScreenProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-1');
  const [activeFilter, setActiveFilter] = useState<'all' | 'instock'>('all');

  const locations: LegoStoreLocation[] = [
    { id: 'store-1', name: "Store Store LEGO", distance: "2.3 mi", address: "4610s Street City Mall", inStock: true, phone: "(555) 124-4610", hours: "10:00 AM - 9:00 PM", lat: 35, lng: 45, type: 'store' },
    { id: 'store-2', name: "Creator Expert Official", distance: "2.3 mi", address: "467 Broadway Avenue", inStock: true, phone: "(555) 782-0467", hours: "10:00 AM - 9:00 PM", lat: 55, lng: 60, type: 'store' },
    { id: 'store-3', name: "Creator Expert Outlet", distance: "2.3 mi", address: "462 Grand Outlet Hwy", inStock: true, phone: "(555) 193-0462", hours: "9:00 AM - 10:00 PM", lat: 70, lng: 30, type: 'outlet' },
    { id: 'store-4', name: "LEGO Greate Convention", distance: "2.7 mi", address: "4600s Convention Hall", inStock: true, phone: "(555) 304-4600", hours: "8:00 AM - 6:00 PM (Sat-Sun)", lat: 25, lng: 80, type: 'convention' },
    { id: 'store-5', name: "City Street View Pickup", distance: "2.3 mi", address: "4610s Pickup Hub", inStock: true, phone: "(555) 890-4610", hours: "10:00 AM - 7:00 PM", lat: 85, lng: 15, type: 'pickup' },
    { id: 'store-6', name: "Brick Island Convention", distance: "3.5 mi", address: "900 Coastal Pavilion", inStock: false, phone: "(555) 609-0900", hours: "9:00 AM - 5:00 PM", lat: 40, lng: 20, type: 'convention' }
  ];

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchSearch = loc.name.toLowerCase().includes(search.toLowerCase()) || 
                          loc.address.toLowerCase().includes(search.toLowerCase());
      const matchFilter = activeFilter === 'all' || loc.inStock;
      return matchSearch && matchFilter;
    });
  }, [search, activeFilter]);

  const activeStore = locations.find(l => l.id === selectedStoreId) || locations[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#0D111A] font-sans text-white relative overflow-hidden select-none">
      {/* 1. INTERACTIVE MAPBOX GRAPHICS ENGINE */}
      <div className="flex-1 w-full relative bg-[#0D0F16] min-h-[250px] z-0">
        
        {/* Coastal Map SVG Layout (Dark blueprint theme, inspired by mockup) */}
        <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Blue coast boundaries */}
          <path d="M 0,40 C 20,40 30,55 40,50 C 50,45 60,65 70,55 C 80,45 90,75 100,65 L 100,100 L 0,100 Z" fill="#1E3A8A" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="0.5" />
          
          {/* Streets Grids */}
          <line x1="10" y1="0" x2="10" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="0.3" />
          <line x1="30" y1="0" x2="30" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="0.3" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="0.3" />
          <line x1="70" y1="0" x2="70" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="0.3" />
          <line x1="90" y1="0" x2="90" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="0.3" />
          
          <line x1="0" y1="20" x2="100" y2="20" stroke="white" strokeOpacity="0.05" strokeWidth="0.3" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="white" strokeOpacity="0.05" strokeWidth="0.3" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="white" strokeOpacity="0.05" strokeWidth="0.3" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="white" strokeOpacity="0.05" strokeWidth="0.3" />

          {/* Highway blue artery route */}
          <path d="M 50,0 C 45,30 55,60 48,100" fill="none" stroke="#3B82F6" strokeWidth="1.2" strokeOpacity="0.6" className="stroke-blue-500 animate-pulse" />
        </svg>

        {/* Map Top Floating Header bar (Back + Search + Filter/Settings) */}
        <div className="absolute top-[max(env(safe-area-inset-top),2rem)] inset-x-6 flex items-center gap-3 z-30">
          <button
            onClick={() => onNavigate(Screen.HOME)}
            className="w-11 h-11 bg-[#161B26]/90 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md active:scale-90 transition-transform shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 text-slate-300" strokeWidth={2.5} />
          </button>
          
          {/* Quick search input */}
          <div className="flex-1 bg-[#161B26]/90 border border-white/10 rounded-full px-4 py-3 flex items-center gap-2.5 backdrop-blur-md shadow-lg focus-within:border-[#C9A84C]/50 transition-colors">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search stores..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xs font-bold w-full placeholder:text-slate-500"
            />
          </div>

          <button 
            onClick={() => setActiveFilter(prev => prev === 'all' ? 'instock' : 'all')}
            className={`w-11 h-11 border rounded-full flex items-center justify-center backdrop-blur-md active:scale-90 transition-transform shadow-lg ${
              activeFilter === 'instock' 
                ? 'bg-[#C9A84C] border-transparent text-[#0D111A]' 
                : 'bg-[#161B26]/90 border-white/10 text-slate-300'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Map Pins selector nodes */}
        {filteredLocations.map((loc) => {
          const isActive = loc.id === selectedStoreId;
          // Position relative grids
          const leftPercent = loc.lng;
          const topPercent = loc.lat;

          return (
            <button
              key={loc.id}
              onClick={() => setSelectedStoreId(loc.id)}
              className="absolute z-20 group transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
            >
              {/* Pulsating glow if active */}
              {isActive && (
                <span className="absolute -inset-3 bg-rose-500/20 blur-md rounded-full animate-ping pointer-events-none" />
              )}
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border transition-all ${
                isActive 
                  ? 'bg-rose-500 border-rose-400 text-white scale-120 z-30 shadow-rose-500/20' 
                  : 'bg-[#161B26]/95 border-white/10 text-slate-400 hover:text-white'
              }`}>
                <MapPin className="w-4 h-4" />
              </div>
            </button>
          );
        })}

        {/* Map Zoom Controls on right */}
        <div className="absolute right-6 top-[150px] z-30 flex flex-col gap-2">
          <button className="w-10 h-10 bg-[#161B26]/90 border border-white/10 rounded-xl flex items-center justify-center backdrop-blur-md active:scale-95 transition-all text-slate-300 font-bold font-mono text-sm shadow-md">+</button>
          <button className="w-10 h-10 bg-[#161B26]/90 border border-white/10 rounded-xl flex items-center justify-center backdrop-blur-md active:scale-95 transition-all text-slate-300 font-bold font-mono text-sm shadow-md">-</button>
        </div>
      </div>

      {/* 2. SLIDE-UP BOTTOM SHEET (Store list & deep detailed hub) */}
      <div className="bg-[#161B26] border-t border-white/5 rounded-t-[36px] px-6 pt-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] relative z-10 shadow-2xl flex flex-col max-h-[55%] shrink-0">
        
        {/* Drag handle line preview */}
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-4 pointer-events-none" />

        {/* Interactive toggle header */}
        <div className="flex justify-between items-center mb-4 text-left">
          <div>
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">LOCAL STORES</span>
            <h2 className="text-lg font-black text-white mt-0.5 uppercase tracking-wide">LEGO Map directory</h2>
          </div>
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
            {filteredLocations.length} locations found
          </span>
        </div>

        {/* Scrollable list viewport */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 max-h-[220px]">
          {filteredLocations.map((loc) => {
            const isSelected = loc.id === selectedStoreId;
            return (
              <div
                key={loc.id}
                onClick={() => setSelectedStoreId(loc.id)}
                className={`p-4 rounded-3xl border flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] ${
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-600/10 to-[#C9A84C]/5 border-blue-500/35 shadow-md' 
                    : 'bg-[#0D111A] border-white/5'
                }`}
              >
                <div className="text-left min-w-0">
                  <h3 className="font-black text-xs text-white truncate flex items-center gap-1.5 leading-tight">
                    {loc.name}
                  </h3>
                  <span className="text-[8px] font-semibold text-slate-500 block mt-0.5">
                    {loc.distance} · {loc.address}
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {loc.inStock && (
                    <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      In Stock
                    </span>
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'border-white/10 text-slate-600'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Sheet Hub drawer (when selected) */}
        {activeStore && (
          <div className="border-t border-white/5 mt-4 pt-4 flex justify-between items-center gap-4 text-left animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Navigation className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] text-[#C9A84C] font-black block uppercase tracking-wider">SELECTED STORE</span>
                <h4 className="text-xs font-black text-white truncate leading-tight mt-0.5">{activeStore.name}</h4>
                <p className="text-[8px] text-slate-500 leading-tight truncate mt-0.5">{activeStore.hours}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <a href={`tel:${activeStore.phone}`} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-90">
                <Phone className="w-4 h-4" />
              </a>
              <button 
                onClick={() => {
                  // Alert success route simulator
                  alert(`Directing you to ${activeStore.name} via Apple Maps / Mapbox GPS...`);
                }}
                className="px-4 bg-gradient-to-r from-[#C9A84C] to-[#E5C158] text-[#0D111A] font-black rounded-xl text-[10px] uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center shadow-md"
              >
                Go
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
