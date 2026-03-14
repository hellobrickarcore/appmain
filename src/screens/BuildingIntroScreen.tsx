import React from 'react';
import { Box, Layout, CheckCircle2, ChevronRight, Database, Zap, Sparkles } from 'lucide-react';
import { Screen } from '../types';

interface BuildingIntroScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const BuildingIntroScreen: React.FC<BuildingIntroScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#050A18] text-white font-sans overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center relative z-10 pt-16">
        <div className="w-72 h-72 bg-white/5 border border-white/10 rounded-[60px] p-10 mb-14 shadow-3xl relative group">
           <div className="absolute -top-10 -left-10 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] animate-pulse" />
           <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px]" />
           
           <div className="grid grid-cols-2 gap-5 h-full relative z-10">
              <div className="bg-[#0A0F1E] rounded-[28px] flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform shadow-2xl">
                <Box className="w-12 h-12 text-orange-500" strokeWidth={1.5} />
              </div>
              <div className="bg-[#0A0F1E] rounded-[28px] flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform delay-75 shadow-2xl">
                <Layout className="w-12 h-12 text-indigo-500" strokeWidth={1.5} />
              </div>
              <div className="col-span-2 bg-[#0A0F1E] rounded-[32px] flex flex-col items-center justify-center gap-3 border border-white/10 shadow-3xl">
                <div className="flex items-center gap-3">
                   <Database className="w-5 h-5 text-emerald-500" />
                   <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Inventory Synced</span>
              </div>
           </div>
        </div>

        <div className="max-w-xs">
          <h1 className="text-4xl font-black mb-6 tracking-tighter leading-none italic uppercase">
            We compute.<br />
            You <span className="text-indigo-500">manifest.</span>
          </h1>
          
          <p className="text-slate-500 text-lg font-bold leading-relaxed mb-10">
            HelloBrick synthesizes 3D build paths based on your current physical inventory.
          </p>

          <div className="flex justify-center gap-4">
             {[1, 2, 3].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800" />
             ))}
          </div>
        </div>
      </div>

      <div className="px-8 pb-[max(env(safe-area-inset-bottom),2.5rem)] pt-10 bg-gradient-to-t from-[#050A18] via-[#050A18]/80 to-transparent">
        <button
          onClick={() => onNavigate(Screen.NOTIFICATIONS_INTRO)}
          className="w-full bg-white text-slate-950 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-3xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          Initialize Manifest
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
