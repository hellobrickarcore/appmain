// @ts-nocheck

import * as React from 'react';
import { ChevronLeft, Camera, Check, BrainCircuit, Trophy, /* ArrowDown */ } from 'lucide-react';
import { Screen } from '../types';

interface TrainingIntroScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const TrainingIntroScreen: React.FC<TrainingIntroScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4 relative z-10">
         <button 
           onClick={() => onNavigate(Screen.TRAINING)}
           className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100"
         >
             <ChevronLeft className="w-6 h-6" />
         </button>
         <h1 className="text-xl font-black text-slate-900">How Learning Works</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-12 relative z-10">
         <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Your knowledge helps HelloBrick get smarter. Here is the journey of a single brick prediction.
         </p>

         {/* The Flow Diagram */}
         <div className="relative border-l-[3px] border-indigo-100 ml-6 space-y-12">
            
            {/* Step 1: Discovery */}
            <div className="relative pl-10 group">
                {/* Icon Node */}
                <div className="absolute -left-[21px] top-0 w-11 h-11 rounded-full bg-white border-4 border-indigo-100 flex items-center justify-center z-10 group-hover:border-indigo-500 group-hover:scale-110 transition-all">
                    <Camera className="w-5 h-5 text-indigo-500" />
                </div>
                
                <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1 block">Step 1</span>
                    <h3 className="text-lg font-black text-slate-900 mb-2">Discovery</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        A user scans a pile of bricks. The AI identifies 90% of them, but is unsure about a specific, rare shape.
                    </p>
                </div>
            </div>

            {/* Step 2: Verification */}
            <div className="relative pl-10 group">
                <div className="absolute -left-[21px] top-0 w-11 h-11 rounded-full bg-white border-4 border-orange-100 flex items-center justify-center z-10 group-hover:border-orange-500 group-hover:scale-110 transition-all">
                    <Check className="w-5 h-5 text-orange-500" />
                </div>
                
                <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1 block">Step 2</span>
                    <h3 className="text-lg font-black text-slate-900 mb-2">Community Vote</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        The uncertain image is sent to the <strong>Training Ground</strong> (here!). Builders like you verify if the AI's guess is correct.
                    </p>
                </div>
            </div>

            {/* Step 3: Learning */}
            <div className="relative pl-10 group">
                <div className="absolute -left-[21px] top-0 w-11 h-11 rounded-full bg-white border-4 border-blue-100 flex items-center justify-center z-10 group-hover:border-blue-500 group-hover:scale-110 transition-all">
                    <BrainCircuit className="w-5 h-5 text-blue-500" />
                </div>
                
                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1 block">Step 3</span>
                    <h3 className="text-lg font-black text-slate-900 mb-2">Model Update</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Once 5 builders agree, the image is added to the permanent dataset. The AI learns this shape forever.
                    </p>
                </div>
            </div>

            {/* Step 4: Reward */}
            <div className="relative pl-10 group">
                <div className="absolute -left-[21px] top-0 w-11 h-11 rounded-full bg-white border-4 border-yellow-100 flex items-center justify-center z-10 group-hover:border-yellow-500 group-hover:scale-110 transition-all">
                    <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                
                <div className="bg-yellow-50/50 rounded-2xl p-5 border border-yellow-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 mb-1 block">Reward</span>
                    <h3 className="text-lg font-black text-slate-900 mb-2">You Level Up</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        For every verification, you earn XP. Top trainers get exclusive "Master Builder" badges on their profile.
                    </p>
                </div>
            </div>

         </div>
      </div>
      
      <div className="p-6 bg-white border-t border-slate-100">
          <button 
            onClick={() => onNavigate(Screen.TRAINING)}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-full shadow-lg active:scale-95 transition-transform"
          >
              Got it, let's train!
          </button>
      </div>
    </div>
  );
};
