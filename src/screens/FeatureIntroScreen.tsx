import React from 'react';
import { Screen } from '../types';
import { Logo } from '../components/Logo';
import { ChevronRight, Zap, Sparkles, Star } from 'lucide-react';

interface FeatureIntroScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const FeatureIntroScreen: React.FC<FeatureIntroScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#050A18] text-white font-sans overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center relative z-10 pt-20">
        <div className="mb-14 relative group">
           <div className="absolute inset-0 bg-white/10 blur-[40px] rounded-full animate-pulse group-hover:bg-orange-500/20 transition-colors" />
           <div className="relative z-10 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500 scale-125">
              <Logo size="lg" />
           </div>
           <div className="absolute -top-4 -right-4 bg-orange-500 p-2.5 rounded-2xl shadow-2xl rotate-12 animate-bounce">
              <Star className="w-5 h-5 text-white fill-current" />
           </div>
        </div>

        <div className="max-w-xs">
          <h1 className="text-5xl font-black mb-6 tracking-tighter leading-[0.9]">
            Scan your <br />
            <span className="text-orange-500 underline decoration-white/20 underline-offset-8">LOOSE BRICKS</span><br />
            & Build.
          </h1>
          
          <p className="text-slate-500 text-lg font-bold leading-relaxed mb-10">
            HelloBrick identifies pieces, counts them, and unlocks hidden builds.
          </p>

          <div className="flex justify-center gap-6 opacity-30">
             <Zap className="w-6 h-6 text-indigo-400" />
             <Sparkles className="w-6 h-6 text-orange-400" />
             <Star className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="px-8 pb-[max(env(safe-area-inset-bottom),2.5rem)] pt-10 bg-gradient-to-t from-[#050A18] via-[#050A18]/80 to-transparent">
        <button
          onClick={() => onNavigate(Screen.BUILDING_INTRO)}
          className="w-full bg-white text-slate-950 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-3xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
