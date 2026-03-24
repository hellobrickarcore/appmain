<<<<<<< HEAD
import React, { useState } from 'react';
import { ChevronRight, X, Check, Scan, Smartphone, Move, Sun } from 'lucide-react';
=======
import React from 'react';
import { Scan, ChevronRight, Shield } from 'lucide-react';
>>>>>>> 7ac4433 (feat: hellobrick v1.4.0 - CV pipeline upgrade & SEO expansion)
import { Screen } from '../types';

interface HowToScanScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface Step {
  title: string;
  subtitle: string;
  description: string;
  renderVisual: () => React.ReactNode;
}

export const HowToScanScreen: React.FC<HowToScanScreenProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: "1. No Overlapping",
      subtitle: "Single Layer Only",
      description: "Spread your parts in a single layer, making sure they don't overlap. 150 to 250 pieces is the ideal amount for one scan.",
      renderVisual: () => (
        <div className="flex gap-4 w-full h-full p-4">
          <div className="flex-1 bg-slate-800/50 rounded-2xl relative overflow-hidden flex items-center justify-center">
            <div className="relative w-24 h-24">
               {/* Overlapping bricks */}
               <div className="w-12 h-8 bg-orange-500 rounded-sm absolute top-4 left-4 rotate-12 shadow-md">
                 <div className="grid grid-cols-2 gap-1 p-1"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full"/><div className="w-1.5 h-1.5 bg-orange-400 rounded-full"/></div>
               </div>
               <div className="w-12 h-12 bg-blue-500 rounded-sm absolute top-8 left-8 -rotate-6 shadow-md">
                 <div className="grid grid-cols-2 gap-1 p-1"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"/><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"/><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"/><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"/></div>
               </div>
               <div className="w-16 h-8 bg-red-500 rounded-sm absolute top-6 left-2 rotate-[45deg] shadow-md opacity-90">
                 <div className="grid grid-cols-3 gap-1 p-1"><div className="w-1.5 h-1.5 bg-red-400 rounded-full"/><div className="w-1.5 h-1.5 bg-red-400 rounded-full"/><div className="w-1.5 h-1.5 bg-red-400 rounded-full"/></div>
               </div>
            </div>
            <div className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"><X className="w-4 h-4 text-white" /></div>
          </div>
          <div className="flex-1 bg-slate-800/50 rounded-2xl relative overflow-hidden flex items-center justify-center">
            <div className="relative w-24 h-24">
               {/* Spread out bricks */}
               <div className="w-10 h-6 bg-orange-500 rounded-sm absolute top-2 left-2 rotate-6">
                 <div className="grid grid-cols-2 gap-1 p-1"><div className="w-1 h-1 bg-orange-400 rounded-full"/><div className="w-1 h-1 bg-orange-400 rounded-full"/></div>
               </div>
               <div className="w-10 h-10 bg-blue-500 rounded-sm absolute top-12 left-4 -rotate-[20deg]">
                 <div className="grid grid-cols-2 gap-1 p-1"><div className="w-1 h-1 bg-blue-400 rounded-full"/><div className="w-1 h-1 bg-blue-400 rounded-full"/></div>
               </div>
               <div className="w-12 h-6 bg-red-500 rounded-sm absolute top-4 left-14 rotate-[15deg]">
                 <div className="grid grid-cols-3 gap-1 p-1"><div className="w-1 h-1 bg-red-400 rounded-full"/><div className="w-1 h-1 bg-red-400 rounded-full"/></div>
               </div>
               <div className="w-8 h-8 bg-emerald-500 rounded-sm absolute top-14 left-16 rotate-12">
                 <div className="grid grid-cols-2 gap-1 p-1"><div className="w-1 h-1 bg-emerald-400 rounded-full"/><div className="w-1 h-1 bg-emerald-400 rounded-full"/></div>
               </div>
            </div>
            <div className="absolute top-2 left-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"><Check className="w-4 h-4 text-white" /></div>
          </div>
        </div>
      )
    },
    {
      title: "2. Clean Background",
      subtitle: "Plain Surface",
      description: "Use a clean, bright background that's large enough. A plain table or even two sheets of printer paper work great! Avoid patterns or high-contrast surfaces.",
      renderVisual: () => (
        <div className="flex gap-4 w-full h-full p-4">
          <div className="flex-1 bg-slate-800/50 rounded-2xl relative overflow-hidden flex items-center justify-center">
             {/* Patterned Background */}
             <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
             <div className="w-12 h-8 bg-blue-500 rounded-sm relative z-10" />
             <div className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-white" /></div>
          </div>
          <div className="flex-1 bg-slate-800/50 rounded-2xl relative overflow-hidden flex items-center justify-center">
             {/* Plain Background */}
             <div className="absolute inset-0 bg-white/10"></div>
             <div className="w-12 h-8 bg-blue-500 rounded-sm relative z-10" />
             <div className="absolute top-2 left-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>
          </div>
        </div>
      )
    },
    {
      title: "3. Good Lighting",
      subtitle: "Bright & Even",
      description: "Make sure the lighting is bright and even. Distinguishing between similar parts isn't easy, and good lighting makes a massive difference for identification.",
      renderVisual: () => (
        <div className="flex gap-4 w-full h-full p-4">
          <div className="flex-1 bg-slate-800/50 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center">
             <div className="w-full h-full bg-black/40 absolute inset-0 flex items-center justify-center">
                <Sun className="w-12 h-12 text-slate-600 opacity-20" />
             </div>
             <div className="w-10 h-6 bg-orange-600 rounded-sm relative z-10 blur-[0.5px]" />
             <div className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-white" /></div>
          </div>
          <div className="flex-1 bg-slate-800/50 rounded-2xl relative overflow-hidden flex items-center justify-center">
             <div className="absolute top-0 right-0 w-full h-full bg-yellow-400/10 blur-3xl rounded-full" />
             <Sun className="w-8 h-8 text-yellow-400 absolute top-2 right-2 opacity-50" />
             <div className="w-10 h-6 bg-orange-500 rounded-sm relative z-10 shadow-lg" />
             <div className="absolute top-2 left-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>
          </div>
        </div>
      )
    },
    {
      title: "4. Proper Angle",
      subtitle: "Birds-Eye View",
      description: "Position your camera directly above the pile. Try to keep it parallel to the surface for the best results. Tilted angles hide part of the brick shapes.",
      renderVisual: () => (
        <div className="flex gap-4 w-full h-full p-4">
          <div className="flex-1 bg-slate-800/50 rounded-2xl relative overflow-hidden flex items-center justify-center">
             <div className="relative transform rotate-x-45 perspective-500">
                <div className="w-16 h-10 bg-blue-600 rounded-sm border-b-4 border-blue-900" />
             </div>
             <div className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-white" /></div>
          </div>
          <div className="flex-1 bg-slate-800/50 rounded-2xl relative overflow-hidden flex items-center justify-center px-4">
             <div className="flex flex-col items-center gap-2">
                <Smartphone className="w-10 h-10 text-white opacity-40 mb-2" />
                <div className="w-20 h-1 bg-emerald-500/50 rounded-full animate-pulse" />
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                   <div className="grid grid-cols-2 gap-1 p-1"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"/><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"/></div>
                </div>
             </div>
             <div className="absolute top-2 left-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>
          </div>
        </div>
      )
    },
    {
      title: "5. Steady Shot",
      subtitle: "Avoid Motion",
      description: "Hold your phone steady until the scan is complete. Sharp images lead to much higher accuracy! Any blur will make it difficult for the AI to detect the studs.",
      renderVisual: () => (
        <div className="flex gap-4 w-full h-full p-4">
          <div className="flex-1 bg-slate-800/50 rounded-2xl relative overflow-hidden flex items-center justify-center px-4">
             <div className="w-12 h-8 bg-red-500 rounded-sm animate-pulse blur-[2px] transform translate-x-1" />
             <div className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-white" /></div>
          </div>
          <div className="flex-1 bg-slate-800/50 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center px-4">
             <div className="flex items-center gap-2 mb-2">
                <Move className="w-4 h-4 text-emerald-500 rotate-45" />
                <Move className="w-4 h-4 text-emerald-500 -rotate-45" />
             </div>
             <div className="w-12 h-8 bg-red-500 rounded-sm shadow-xl" />
             <div className="absolute top-2 left-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>
          </div>
        </div>
      )
    },
    {
      title: "6. Coverage",
      subtitle: "Fit the Frame",
      description: "Center the bricks in the frame and maximize the use of space. Make sure all edges of the pile are inside the camera's view before capturing.",
      renderVisual: () => (
        <div className="flex gap-4 w-full h-full p-4">
          <div className="flex-1 bg-slate-800/50 rounded-2xl relative overflow-hidden flex items-start justify-start p-2">
             <div className="w-10 h-10 bg-yellow-500 rounded-sm transform translate-x-12 -translate-y-4 shadow-lg" />
             <div className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-white" /></div>
          </div>
          <div className="flex-1 bg-slate-800/50 rounded-2xl relative overflow-hidden flex items-center justify-center">
             <div className="w-32 h-32 border border-emerald-500/30 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5" />
                <div className="grid grid-cols-2 gap-2">
                   <div className="w-8 h-8 bg-yellow-500 rounded-sm shadow-md" />
                   <div className="w-10 h-6 bg-blue-500 rounded-sm shadow-md mt-2" />
                </div>
             </div>
             <div className="absolute top-2 left-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onNavigate(Screen.HOME);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onNavigate(Screen.HOME);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A1A] text-white flex flex-col font-sans z-50 overflow-hidden">
      {/* Top Banner with Progress Indicators */}
      <div className="px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex flex-col gap-6">
        <div className="flex gap-1.5 w-full">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= currentStep ? 'bg-white' : 'bg-white/20'}`} 
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
            <Scan className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            How to <span className="text-emerald-500 font-black">scan</span>
          </h2>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 px-6 flex flex-col items-center justify-center py-6">
        <div className="w-full aspect-[4/3] bg-white/5 rounded-[40px] border border-white/5 mb-10 overflow-hidden shadow-2xl flex flex-col">
          {steps[currentStep].renderVisual()}
        </div>

        <div className="text-left w-full space-y-4 px-2">
          <h1 className="text-3xl font-black tracking-tight">{steps[currentStep].title}</h1>
          <p className="text-slate-400 font-bold text-lg leading-snug">
            {steps[currentStep].description}
          </p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="px-8 pb-[max(env(safe-area-inset-bottom),2rem)] pt-6 flex flex-col gap-4">
        <button
          onClick={nextStep}
          className="w-full bg-white text-slate-900 py-6 rounded-3xl font-black text-xl active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
        >
          {currentStep === steps.length - 1 ? 'Start Scanning' : 'Next'}
          {currentStep !== steps.length - 1 && <ChevronRight className="w-6 h-6" />}
        </button>

        <button 
          onClick={() => onNavigate(Screen.HOME)}
          className="text-slate-500 font-black text-sm uppercase tracking-[0.2em] py-2 hover:text-slate-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
