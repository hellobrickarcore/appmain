import React from 'react';
import { Camera, ShieldCheck, ChevronRight, Zap } from 'lucide-react';
import { Screen } from '../types';

interface CameraPermissionScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const CameraPermissionScreen: React.FC<CameraPermissionScreenProps> = ({ onNavigate }) => {
  const handleEnableCamera = async () => {
    // Mark onboarding as finished
    localStorage.setItem('hellobrick_onboarding_finished', 'true');
    // Ensure we trigger a re-render or initial navigation properly
    onNavigate(Screen.SCANNER);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050A18] text-white font-sans overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-orange-600/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center relative z-10 pt-16">
        <div className="w-72 h-72 bg-white/5 border border-white/10 rounded-[60px] flex items-center justify-center mb-14 shadow-3xl relative group">
           <div className="absolute -top-10 -left-10 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] animate-pulse" />
           
           <div className="w-24 h-24 bg-orange-500 rounded-[32px] flex items-center justify-center shadow-[0_20px_60px_rgba(249,115,22,0.4)] transform group-hover:scale-110 transition-transform duration-700">
             <Camera className="w-12 h-12 text-white" strokeWidth={1.5} />
           </div>
           
           <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#0A0F1E] backdrop-blur-md px-6 py-3 rounded-[24px] border border-white/10 flex items-center gap-3 shadow-2xl">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Biometric Secure</span>
           </div>
        </div>

        <div className="max-w-xs">
          <h1 className="text-4xl font-black mb-6 tracking-tighter leading-none uppercase">
            Visual.<br />
            Scanner.<br />
            <span className="text-orange-500">Live.</span>
          </h1>
          
          <p className="text-slate-500 text-lg font-bold leading-relaxed mb-10">
            Enable high-frequency visual capture to instantly identify specimens in the physical field.
          </p>
          
          <div className="flex items-center justify-center gap-4 py-3 bg-white/5 rounded-2xl border border-white/5 px-6">
             <Zap className="w-4 h-4 text-orange-500" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stream 60 FPS / HD</span>
          </div>
        </div>
      </div>

      <div className="px-8 pb-[max(env(safe-area-inset-bottom),2.5rem)] pt-10 bg-gradient-to-t from-[#050A18] via-[#050A18]/80 to-transparent">
        <button
          onClick={handleEnableCamera}
          className="w-full bg-white text-slate-950 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-3xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          Authorize Optics
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
