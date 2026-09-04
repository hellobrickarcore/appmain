import React from 'react';
import { Home, Layers, Scan, Search, Users } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const isActive = (screen: Screen) => currentScreen === screen;

  const getIconClass = (screen: Screen) =>
    `w-[22px] h-[22px] transition-all duration-300 ${
      isActive(screen) 
        ? 'text-emerald-500 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
        : 'text-gray-400 stroke-[2px] group-hover:text-gray-700'
    }`;

  const getLabelClass = (screen: Screen) =>
    `text-[10px] font-semibold mt-1 transition-all duration-300 ${
      isActive(screen) ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-700'
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[99999] px-3 pb-[max(env(safe-area-inset-bottom),0.8rem)]">
      <div className="bg-white/95 backdrop-blur-2xl border border-gray-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.08)] rounded-full px-2 py-2 flex items-center justify-between w-full max-w-[420px] mx-auto relative">
        
        {/* Dashboard / Home */}
        <button onClick={() => onNavigate(Screen.HOME)} className="flex flex-col items-center justify-center w-14 group active:scale-95 transition-transform">
          <Home className={getIconClass(Screen.HOME)} />
          <span className={getLabelClass(Screen.HOME)}>Dashboard</span>
        </button>
        
        {/* Collection */}
        <button onClick={() => onNavigate(Screen.COLLECTION)} className="flex flex-col items-center justify-center w-14 group active:scale-95 transition-transform">
          <Layers className={getIconClass(Screen.COLLECTION)} />
          <span className={getLabelClass(Screen.COLLECTION)}>Collection</span>
        </button>
        
        {/* Scan (Center Prominent) */}
        <div className="relative -top-4 flex justify-center w-14">
          <button 
            onClick={() => onNavigate(Screen.SCANNER)} 
            className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.45)] active:scale-95 transition-transform border-4 border-white"
          >
            <Scan className="w-6 h-6 text-white stroke-[2.5px]" />
          </button>
        </div>
        
        {/* Browse Database */}
        <button onClick={() => onNavigate(Screen.BROWSE)} className="flex flex-col items-center justify-center w-14 group active:scale-95 transition-transform">
          <Search className={getIconClass(Screen.BROWSE)} />
          <span className={getLabelClass(Screen.BROWSE)}>Browse</span>
        </button>

        {/* Community / Network */}
        <button onClick={() => onNavigate(Screen.COMMUNITY)} className="flex flex-col items-center justify-center w-14 group active:scale-95 transition-transform">
          <Users className={getIconClass(Screen.COMMUNITY)} />
          <span className={getLabelClass(Screen.COMMUNITY)}>Community</span>
        </button>
      </div>
    </div>
  );
};


