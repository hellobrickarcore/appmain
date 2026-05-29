import React, { useEffect, useState } from 'react';
import { Screen } from '../types';
import { appStateService } from '../services/appStateService';

interface OnboardingProps {
  onNavigate: (screen: Screen) => void;
}

export const OnboardingQuestionnaire: React.FC<OnboardingProps> = ({ onNavigate }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStart = () => {
    try {
      // Do not set onboarding_finished yet. Wait until the end of the funnel.
      appStateService.navigate(Screen.AUTH);
    } catch (e) {}
  };

  return (
    <div className="flex-1 bg-[#111111] flex flex-col items-center px-6 pt-16 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
      
      <div className={`transition-all duration-1000 ease-out transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} flex flex-col items-center w-full z-10`}>
        <h1 className="text-[42px] font-semibold text-white text-center leading-[1.1] tracking-tight">
          Your LEGO Collection Is<br />
          <span className="text-blue-400">Secretly Worth Thousands</span>
        </h1>
        
        <p className="text-zinc-400 text-lg mt-4 font-medium text-center">
          Discover the true value of your LEGO sets.
        </p>

        <div className="mt-14 flex flex-row flex-wrap justify-center gap-6 relative w-full h-[280px]">
          
          {/* Card 1 */}
          <div className="absolute top-0 left-2 w-[140px] bg-[#1A1A1A] rounded-[24px] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-white/5 transform -rotate-6 animate-[float_6s_ease-in-out_infinite]">
            <div className="aspect-square bg-zinc-800/50 rounded-xl mb-3 overflow-hidden p-2 flex items-center justify-center">
              <img src="https://cdn.rebrickable.com/media/sets/75192-1/1.jpg" alt="Millennium Falcon" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider text-center">Falcon</p>
            <p className="text-emerald-400 text-center mt-1 font-bold text-lg">$849.99</p>
          </div>

          {/* Card 2 */}
          <div className="absolute top-12 right-2 w-[150px] bg-[#1A1A1A] rounded-[24px] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-white/5 transform rotate-3 animate-[float_5s_ease-in-out_infinite_1s]">
            <div className="aspect-square bg-zinc-800/50 rounded-xl mb-3 overflow-hidden p-2 flex items-center justify-center">
              <img src="https://cdn.rebrickable.com/media/sets/10294-1/1.jpg" alt="Titanic" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider text-center">Titanic</p>
            <p className="text-emerald-400 text-center mt-1 font-bold text-lg">$679.99</p>
          </div>

        </div>

        <div className="w-full mt-auto pb-[max(env(safe-area-inset-bottom),2rem)] pt-10">
          <button 
            onClick={handleStart}
            className="w-full bg-white text-[#111111] rounded-full py-5 px-10 active:scale-95 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <span className="text-xl font-semibold">Start Scanning Free</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-15px) rotate(var(--tw-rotate)); }
          100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
        }
      `}</style>
    </div>
  );
};
