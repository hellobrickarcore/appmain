import React from 'react';
import { Home, Scan, User, LayoutGrid, Users } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const getIconClass = (screen: Screen) =>
    `w-6 h-6 transition-all duration-300 ${currentScreen === screen ? 'text-orange-500 stroke-[2.5px] scale-110 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]' : 'text-slate-600 stroke-[2px] group-hover:text-slate-300'}`;

  const isActive = (screen: Screen) => currentScreen === screen;

  return (
    <div className="fixed bottom-[max(2rem,env(safe-area-inset-bottom)+1rem)] left-0 right-0 px-6 flex justify-center z-[99999]">
      <div className="bg-[#0A0F1E]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] px-2 py-2 flex items-center justify-between w-full max-w-[380px] relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent opacity-50" />
        
        <button onClick={() => onNavigate(Screen.HOME)} className="p-4 relative group">
          <div className={`absolute inset-0 bg-orange-500/10 rounded-2xl blur-xl transition-opacity duration-300 ${isActive(Screen.HOME) ? 'opacity-100' : 'opacity-0'}`} />
          <Home className={getIconClass(Screen.HOME)} />
        </button>
        
        <button onClick={() => onNavigate(Screen.SCANNER)} className="p-4 relative group">
          <div className={`absolute inset-0 bg-orange-500/10 rounded-2xl blur-xl transition-opacity duration-300 ${isActive(Screen.SCANNER) ? 'opacity-100' : 'opacity-0'}`} />
          <Scan className={getIconClass(Screen.SCANNER)} />
        </button>
        
        <button onClick={() => onNavigate(Screen.COLLECTION)} className="p-4 relative group">
          <div className={`absolute inset-0 bg-orange-500/10 rounded-2xl blur-xl transition-opacity duration-300 ${isActive(Screen.COLLECTION) ? 'opacity-100' : 'opacity-0'}`} />
          <LayoutGrid className={getIconClass(Screen.COLLECTION)} />
        </button>

        <button onClick={() => onNavigate(Screen.FEED)} className="p-4 relative group">
          <div className={`absolute inset-0 bg-orange-500/10 rounded-2xl blur-xl transition-opacity duration-300 ${isActive(Screen.FEED) ? 'opacity-100' : 'opacity-0'}`} />
          <Users className={getIconClass(Screen.FEED)} />
        </button>

        <button onClick={() => onNavigate(Screen.PROFILE)} className="p-4 relative group">
          <div className={`absolute inset-0 bg-orange-500/10 rounded-2xl blur-xl transition-opacity duration-300 ${isActive(Screen.PROFILE) ? 'opacity-100' : 'opacity-0'}`} />
          <User className={getIconClass(Screen.PROFILE)} />
        </button>
      </div>
    </div>
  );
};
