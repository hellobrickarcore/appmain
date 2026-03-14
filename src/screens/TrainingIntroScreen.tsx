// @ts-nocheck
import * as React from 'react';
import { ChevronLeft, Camera, Check, BrainCircuit, Trophy, Sparkles, Zap, Shield, ChevronRight } from 'lucide-react';
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
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between sticky top-0 bg-[#050A18]/80 backdrop-blur-xl border-b border-white/5">
         <button 
           onClick={() => onNavigate(Screen.TRAINING)}
           className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10"
         >
             <ChevronLeft className="w-5 h-5" />
         </button>
         <div className="flex flex-col items-center">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">Neural Protocol</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
               <Zap className="w-2.5 h-2.5 text-indigo-500" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Knowledge Transfer</span>
            </div>
         </div>
         <button 
           onClick={() => onNavigate(Screen.HOME)}
           className="text-slate-600 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
         >
           Exit
         </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-32 pt-12 relative z-10 no-scrollbar">
         <div className="max-w-md mx-auto">
            <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-4">How the Hive Leans</h2>
            <p className="text-slate-500 font-bold text-base leading-relaxed mb-16">
               Your verification data is hashed and synthesized into our global detection model in real-time.
            </p>

            {/* The Flow Diagram */}
            <div className="relative border-l-2 border-dashed border-white/5 ml-4 space-y-16 pb-10">
               
               {/* Step 1: Discovery */}
               <div className="relative pl-12 group">
                   <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-xl bg-[#0F172A] border-2 border-indigo-500/30 flex items-center justify-center z-10 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                       <Camera className="w-5 h-5 text-indigo-400" />
                   </div>
                   
                   <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 backdrop-blur-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/50 mb-3 block">Level 1</span>
                       <h3 className="text-xl font-black text-white mb-2 tracking-tight">Detection Ingest</h3>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">
                           A scanner identifies a specimen but generates a low baseline confidence score (under 85%).
                       </p>
                   </div>
               </div>

               {/* Step 2: Verification */}
               <div className="relative pl-12 group">
                   <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-xl bg-[#0F172A] border-2 border-orange-500/30 flex items-center justify-center z-10 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                       <Shield className="w-5 h-5 text-orange-400" />
                   </div>
                   
                   <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/50 mb-3 block">Level 2</span>
                       <h3 className="text-xl font-black text-white mb-2 tracking-tight">Builder Consensus</h3>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">
                           The specimen is sent to the <strong>Neural Workbench</strong>. Master Builders provide the final confirmation vote.
                       </p>
                   </div>
               </div>

               {/* Step 3: Learning */}
               <div className="relative pl-12 group">
                   <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-xl bg-[#0F172A] border-2 border-emerald-500/30 flex items-center justify-center z-10 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                       <BrainCircuit className="w-5 h-5 text-emerald-400" />
                   </div>
                   
                   <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50 mb-3 block">Level 3</span>
                       <h3 className="text-xl font-black text-white mb-2 tracking-tight">Synaptic Update</h3>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">
                           After 5 matching votes, the specimen's geometry is permanently baked into the global detection weights.
                       </p>
                   </div>
               </div>

               {/* Step 4: Reward */}
               <div className="relative pl-12 group">
                   <div className="absolute -left-[19px] top-0 w-9 h-9 rounded-xl bg-[#0F172A] border-2 border-yellow-500/30 flex items-center justify-center z-10 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                       <Trophy className="w-5 h-5 text-yellow-400" />
                   </div>
                   
                   <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500/50 mb-3 block">Elite</span>
                       <h3 className="text-xl font-black text-white mb-2 tracking-tight">Status Upgrade</h3>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">
                           You earn high-yield XP for every confirmed vote. Top contributors receive the <strong>Neural Architect</strong> badge.
                       </p>
                   </div>
               </div>

            </div>
         </div>
      </div>
      
      <div className="p-8 bg-[#050A18]/80 backdrop-blur-3xl pb-[max(env(safe-area-inset-bottom),2rem)] border-t border-white/5 z-50">
          <button 
            onClick={() => onNavigate(Screen.TRAINING)}
            className="w-full bg-white text-slate-950 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-3xl active:scale-95 transition-all flex items-center justify-center gap-3"
          >
              Enter Workbench
              <ChevronRight className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
};
