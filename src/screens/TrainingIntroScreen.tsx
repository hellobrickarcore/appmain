import * as React from 'react';
import { ChevronLeft, Upload, Info } from 'lucide-react';
import { Screen } from '../types';

interface TrainingIntroScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const TrainingIntroScreen: React.FC<TrainingIntroScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#050A18] text-white font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] -ml-32 -mb-32" />
      
      {/* Header */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),1.5rem)] pb-4 flex items-center justify-between">
         <button 
           onClick={() => onNavigate(Screen.HOME)}
           className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10"
         >
             <ChevronLeft className="w-6 h-6" />
         </button>
         <div className="flex flex-col items-center">
            <h1 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Rewards Hub</h1>
         </div>
         <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-32 pt-4 relative z-10 no-scrollbar">
         <div className="max-w-md mx-auto flex flex-col items-center">
            <h2 className="text-[42px] font-black text-white tracking-tight leading-none mb-4 text-center">XP = Rewards</h2>
            <p className="text-slate-400 font-bold text-base leading-relaxed mb-12 text-center px-4">
               Unlock real rewards every 2 weeks. Upload build videos to earn massive XP and claim your prizes.
            </p>

            {/* XP Progress Card */}
            <div className="w-full bg-[#0F172A] rounded-[32px] p-8 border border-white/5 mb-8">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                     <div className="w-14 h-14 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
                        <Sparkles className="w-6 h-6 text-orange-500" />
                     </div>
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Rewards XP</span>
                        <div className="flex items-baseline gap-1">
                           <span className="text-3xl font-black text-white">1,500</span>
                           <span className="text-sm font-black text-slate-500">XP</span>
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Next Reward</span>
                     <div className="text-green-400 font-black text-lg">500 XP</div>
                  </div>
               </div>

               {/* Progress Bar */}
               <div className="h-4 bg-slate-800/50 rounded-full overflow-hidden relative mb-4">
                  <div className="h-full w-[30%] bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
               </div>
                <p className="text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">
                   Resetting in 9 days • Next: $10 Gift Card
                </p>
            </div>

            {/* Upload Area */}
            <button className="w-full aspect-square max-h-[300px] border-2 border-dashed border-orange-500/30 rounded-[48px] flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/10 transition-all group mb-8">
               <div className="w-20 h-20 bg-[#0F172A] rounded-full flex items-center justify-center border border-white/10 group-active:scale-95 transition-all">
                  <Upload className="w-8 h-8 text-orange-500" />
               </div>
               <div className="text-center">
                  <h3 className="text-2xl font-black text-white">Upload Build Video</h3>
                  <p className="text-slate-500 font-bold text-sm mt-1">Tap to select a video of you<br />putting bricks together.</p>
               </div>
            </button>

            {/* Why videos card */}
            <div className="w-full bg-[#0F172A]/50 rounded-[24px] p-6 border border-white/5 flex gap-4">
               <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                  <Info className="w-5 h-5 text-blue-400" />
               </div>
               <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1.5">Why build videos?</h4>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                     Your uploads help the world's builders identify bricks faster and more accurately. Every contribution puts you closer to the next reward milestone.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const Sparkles = ({ className }: { className?: string }) => (
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="19" cy="5" r="1.5" />
      <circle cx="5" cy="19" r="1.5" />
   </svg>
);
