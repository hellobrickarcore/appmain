import React from 'react';
import { Home, Scan, Box, User } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const getIconClass = (screen: Screen) =>
    `w-6 h-6 transition-colors duration-200 ${currentScreen === screen ? 'text-orange-400 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'text-slate-400 stroke-[2px] hover:text-slate-300'}`;

  return (
    <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-50">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-6 py-4 flex items-center justify-between w-full max-w-[340px]">
        <button onClick={() => onNavigate(Screen.HOME)} className="p-2 relative group">
          <Home className={getIconClass(Screen.HOME)} />
        </button>
        <button onClick={() => onNavigate(Screen.SCANNER)} className="p-2 relative group">
          <Scan className={getIconClass(Screen.SCANNER)} />
        </button>
        <button onClick={() => onNavigate(Screen.COLLECTION)} className="p-2">
          <Box className={getIconClass(Screen.COLLECTION)} />
        </button>
        <button onClick={() => onNavigate(Screen.PROFILE)} className="p-2">
          <User className={getIconClass(Screen.PROFILE)} />
        </button>
      </div>
    </div>
  );
};
