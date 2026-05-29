import React from 'react';
import { Home, Layers, Scan, BarChart2, User } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  // Navigation mapping
  const isActive = (screen: Screen) => currentScreen === screen;

  const getIconClass = (screen: Screen) =>
    `w-[22px] h-[22px] transition-all duration-300 ${
      isActive(screen) 
        ? 'text-blue-400 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' 
        : 'text-zinc-500 stroke-[2px] group-hover:text-zinc-300'
    }`;

  const getLabelClass = (screen: Screen) =>
    `text-[10px] font-medium mt-1 transition-all duration-300 ${
      isActive(screen) ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[99999] px-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
      <div className="bg-[#1A1C23]/90 backdrop-blur-2xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-full px-2 py-2 flex items-center justify-between w-full max-w-[400px] mx-auto relative">
        
        {/* Home */}
        <button onClick={() => onNavigate(Screen.HOME)} className="flex flex-col items-center justify-center w-16 group active:scale-95 transition-transform">
          <Home className={getIconClass(Screen.HOME)} />
          <span className={getLabelClass(Screen.HOME)}>Home</span>
        </button>
        
        {/* Collection */}
        <button onClick={() => onNavigate(Screen.COLLECTION)} className="flex flex-col items-center justify-center w-16 group active:scale-95 transition-transform">
          <Layers className={getIconClass(Screen.COLLECTION)} />
          <span className={getLabelClass(Screen.COLLECTION)}>Collection</span>
        </button>
        
        {/* Scan (Center Prominent) */}
        <div className="relative -top-5 flex justify-center w-16">
          <button 
            onClick={() => onNavigate(Screen.SCANNER)} 
            className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(16,185,129,0.4)] active:scale-95 transition-transform border-4 border-[#111111]"
          >
            <Scan className="w-6 h-6 text-white stroke-[2.5px]" />
          </button>
        </div>
        
        {/* Insights */}
        <button onClick={() => onNavigate(Screen.INSIGHTS)} className="flex flex-col items-center justify-center w-16 group active:scale-95 transition-transform">
          <BarChart2 className={getIconClass(Screen.INSIGHTS)} />
          <span className={getLabelClass(Screen.INSIGHTS)}>Insights</span>
        </button>

        {/* Profile */}
        <button onClick={() => onNavigate(Screen.PROFILE)} className="flex flex-col items-center justify-center w-16 group active:scale-95 transition-transform">
          <User className={getIconClass(Screen.PROFILE)} />
          <span className={getLabelClass(Screen.PROFILE)}>Profile</span>
        </button>
      </div>
    </div>
  );
};

