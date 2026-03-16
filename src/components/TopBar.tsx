import { HelpCircle } from 'lucide-react';
import { Screen } from '../types';
import { Logo } from './Logo';

interface TopBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentScreen, onNavigate }) => {
  return (
    <div className="flex items-center justify-between px-6 pt-[max(env(safe-area-inset-top),3rem)] pb-4 relative z-50">
      <div className="w-10 h-10" />

      {/* Central Toggle & Help Container */}
      <div className="flex items-center gap-2">
        <div className="bg-slate-700/50 backdrop-blur-md rounded-full p-1 flex items-center shadow-sm">
          <button
            onClick={() => onNavigate(Screen.HOME)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${currentScreen === Screen.HOME || currentScreen === Screen.SCANNER ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-300'
              }`}
          >
            Scanner
          </button>
          <button
            onClick={() => onNavigate(Screen.COLLECTION)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${currentScreen === Screen.COLLECTION ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-300'
              }`}
          >
            Collection
          </button>
        </div>

        {/* Help Circle Button */}
        <button
          onClick={() => onNavigate(Screen.HOW_TO_SCAN)}
          className="w-10 h-10 bg-slate-700/50 backdrop-blur-md rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-600/50 transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Right Profile Icon - Mascot Style */}
      <button
        onClick={() => onNavigate(Screen.PROFILE)}
        className="active:scale-95 transition-transform"
      >
        <Logo size="md" showText={false} />
      </button>
    </div>
  );
};
