import React from 'react';
import { ChevronLeft, Target, Timer, Copy, Zap, Brain, Scale, ArrowRight, Sparkles } from 'lucide-react';
import { Screen, GameModeId } from '../types';

interface HeadToHeadModesScreenProps {
  onNavigate: (screen: Screen) => void;
  onSelectMode: (mode: GameModeId) => void;
}

export const HeadToHeadModesScreen: React.FC<HeadToHeadModesScreenProps> = ({ onNavigate, onSelectMode }) => {
  
  const handleModeSelect = (mode: GameModeId) => {
    onSelectMode(mode);
    onNavigate(Screen.H2H_MATCHMAKING);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050A18] font-sans text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between sticky top-0 bg-[#050A18]/80 backdrop-blur-xl border-b border-white/5">
          <button 
              onClick={() => onNavigate(Screen.HEAD_TO_HEAD)}
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10"
          >
              <ChevronLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div className="flex flex-col items-center">
             <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">Select Mission</h1>
             <div className="flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Multiplayer Arena</span>
             </div>
          </div>
          <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pb-20 pt-10 overflow-y-auto no-scrollbar space-y-6 relative z-10">
          
          {/* Target Hunt */}
          <button 
             onClick={() => handleModeSelect('TARGET')}
             className="w-full bg-gradient-to-br from-rose-500 to-rose-700 rounded-[48px] p-1 text-left relative overflow-hidden group active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(225,29,72,0.15)]"
          >
              <div className="bg-[#050A18]/20 backdrop-blur-3xl rounded-[44px] p-8 h-full flex flex-col relative z-20">
                  <div className="flex justify-between items-start mb-8">
                      <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                          <Target className="w-8 h-8 text-white" />
                      </div>
                      <div className="bg-white/20 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Live Match</span>
                      </div>
                  </div>
                  
                  <h2 className="text-3xl font-black mb-3 leading-tight text-white">Target Hunt</h2>
                  <p className="text-rose-100/70 font-bold text-sm mb-10 max-w-[85%] leading-relaxed">
                      First to find and scan the hidden target brick wins the round.
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                      <div className="flex gap-2">
                         <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/60">Speed</div>
                         <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/60">Skills</div>
                      </div>
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-rose-600 transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                  </div>
              </div>
          </button>

          {/* Blind Category Sprint */}
          <button 
             onClick={() => handleModeSelect('SPRINT')}
             className="w-full bg-gradient-to-br from-indigo-500 to-indigo-800 rounded-[48px] p-1 text-left relative overflow-hidden group active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(79,70,229,0.15)]"
          >
              <div className="bg-[#050A18]/20 backdrop-blur-3xl rounded-[44px] p-8 h-full flex flex-col relative z-20">
                  <div className="flex justify-between items-start mb-8">
                      <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                          <Timer className="w-8 h-8 text-white" />
                      </div>
                      <div className="bg-white/20 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Multi-Part</span>
                      </div>
                  </div>
                  
                  <h2 className="text-3xl font-black mb-3 leading-tight text-white">Category Sprint</h2>
                  <p className="text-indigo-100/70 font-bold text-sm mb-10 max-w-[85%] leading-relaxed">
                      Identify and capture 5 distinct items from a challenge category.
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                      <div className="flex gap-2">
                         <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/60">Tactical</div>
                      </div>
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                  </div>
              </div>
          </button>

          {/* Mirror Match */}
          <button 
             onClick={() => handleModeSelect('MIRROR')}
             className="w-full bg-gradient-to-br from-cyan-500 to-blue-700 rounded-[48px] p-1 text-left relative overflow-hidden group active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(6,182,212,0.15)]"
          >
              <div className="bg-[#050A18]/20 backdrop-blur-3xl rounded-[44px] p-8 h-full flex flex-col relative z-20">
                  <div className="flex justify-between items-start mb-8">
                      <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                          <Copy className="w-8 h-8 text-white" />
                      </div>
                      <div className="bg-white/20 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Score Attack</span>
                      </div>
                  </div>
                  
                  <h2 className="text-3xl font-black mb-3 leading-tight text-white">Mirror Match</h2>
                  <p className="text-cyan-100/70 font-bold text-sm mb-10 max-w-[85%] leading-relaxed">
                      Find identical duplicates of the guide piece. Highest count wins.
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                      <div className="flex gap-2">
                         <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/60">Volume</div>
                      </div>
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-cyan-600 transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                  </div>
              </div>
          </button>

      </div>
      
      <div className="p-8 bg-[#050A18]/80 backdrop-blur-xl border-t border-white/5 z-20">
           <button 
             onClick={() => onNavigate(Screen.HEAD_TO_HEAD)}
             className="w-full text-slate-500 hover:text-white font-black text-[11px] uppercase tracking-[0.3em] transition-colors py-2"
           >
               Abandom Match Selection
           </button>
      </div>
    </div>
  );
};
