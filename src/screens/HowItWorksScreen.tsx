import React from 'react';
import { Camera, BrainCircuit, Trophy, Gift } from 'lucide-react';
import { Screen } from '../types';

interface HowItWorksScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const HowItWorksScreen: React.FC<HowItWorksScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-[#0A1229] font-sans text-white relative overflow-hidden">
      {/* Top Header Section */}
      <div className="h-4 bg-[#FF7A30] w-full relative z-30" />
      
      {/* Subtle Background Elements */}
      <div className="absolute top-[10%] left-[10%] w-24 h-24 bg-white/5 rounded-[20px] rotate-12 blur-sm pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-32 h-32 bg-white/5 rounded-[32px] -rotate-12 blur-lg pointer-events-none" />

      {/* Header */}
      <div className="px-10 pt-[max(env(safe-area-inset-top),2rem)] pb-8 flex flex-col items-center justify-center z-10 shrink-0">
         <h1 className="text-[32px] font-black text-center tracking-tight leading-none text-white mb-6 uppercase">
            Lets build<br />
            <span className="text-[#FF7A30]">brick by brick</span>
         </h1>
         <p className="text-slate-400 font-bold text-lg leading-snug text-center max-w-[280px]">
             Discover the features designed to master your collection.
          </p>
      </div>

      {/* Feature List (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto px-10 pt-4 pb-4 space-y-4 no-scrollbar relative z-10 overscroll-contain">
         
         {/* Feature Card 1 */}
         <div className="bg-[#1A233A] rounded-[32px] p-6 relative overflow-hidden border border-white/5 shadow-2xl">
             <div className="flex items-center gap-5">
                 <div className="w-16 h-16 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-lg shrink-0">
                     <Camera className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-white">Organise the chaos</h3>
                    <p className="text-slate-500 font-bold text-sm tracking-tight">AR detection & sorting tool</p>
                 </div>
             </div>
         </div>

         {/* Feature Card 2 */}
         <div className="bg-[#1A233A] rounded-[32px] p-6 relative overflow-hidden border border-white/5 shadow-2xl">
             <div className="flex items-center gap-5">
                 <div className="w-16 h-16 rounded-2xl bg-[#FF7A30] flex items-center justify-center text-white shadow-lg shrink-0">
                     <Trophy className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-white">Collect XP</h3>
                    <p className="text-slate-500 font-bold text-sm tracking-tight">Complete daily brick quests</p>
                 </div>
             </div>
         </div>

         {/* Feature Card 3 */}
         <div className="bg-[#1A233A] rounded-[32px] p-6 relative overflow-hidden border border-white/5 shadow-2xl">
             <div className="flex items-center gap-5">
                 <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
                     <BrainCircuit className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-white">Train the Data</h3>
                    <p className="text-slate-500 font-bold text-sm tracking-tight">Help the AI & get XP</p>
                 </div>
             </div>
         </div>

         {/* Feature Card 4 */}
         <div className="bg-[#1A233A] rounded-[32px] p-6 relative overflow-hidden border border-white/5 shadow-2xl">
             <div className="flex items-center gap-5">
                 <div className="w-16 h-16 rounded-2xl bg-[#FF3B7F] flex items-center justify-center text-white shadow-lg shrink-0">
                     <Gift className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-white">Real Rewards</h3>
                    <p className="text-slate-500 font-bold text-sm tracking-tight">Vouchers & cinema tickets</p>
                 </div>
             </div>
         </div>

      </div>
      
      {/* Standardized Footer Button */}
      <div className="px-10 pb-[max(env(safe-area-inset-bottom),3rem)] pt-6 z-20 shrink-0">
          <button 
            onClick={() => onNavigate(Screen.HOME)}
            className="w-full bg-[#2563EB] text-white py-6 rounded-[32px] font-black text-2xl shadow-2xl active:scale-[0.98] transition-all"
          >
              Get Started
          </button>
      </div>
    </div>
  );
};
