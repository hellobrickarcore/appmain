import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2, Box, Wand2 } from 'lucide-react';
import { Screen, LegoSet } from '../types';

interface InstructionsScreenProps {
    onNavigate: (screen: Screen) => void;
    setDetails: LegoSet;
}

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ onNavigate, setDetails }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isGenerating, setIsGenerating] = useState(true);
    const [generatedSteps, setGeneratedSteps] = useState<any[]>([]);

    useEffect(() => {
        // Mock smart generation of instructions taking 1.5 seconds finding logical steps
        // In a real app, this would ping a generation service or load from DB.
        const timer = setTimeout(() => {
            const steps = [];
            
            // Generate basic step-by-step logic
            const buildableParts = setDetails.bricks.filter(b => (b.owned || 0) > 0);
            
            if (buildableParts.length === 0) {
                 steps.push({ text: "You don't have any parts to start building yet!", parts: [] });
            } else {
                 steps.push({ text: "Let's gather the foundational pieces first.", parts: buildableParts.slice(0, 2) });
                 if (buildableParts.length > 2) {
                     steps.push({ text: "Now add the structural elements to build height.", parts: buildableParts.slice(2, 4) });
                 }
                 steps.push({ text: "Finish off with the remaining details.", parts: buildableParts.slice(4) });
            }

            setGeneratedSteps(steps);
            setIsGenerating(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [setDetails]);

    if (isGenerating) {
        return (
            <div className="flex flex-col min-h-[100dvh] bg-slate-950 text-white items-center justify-center p-6 text-center">
                <Wand2 className="w-12 h-12 text-orange-500 animate-pulse mb-6" />
                <h2 className="text-2xl font-black mb-2">Generating Dynamic Steps</h2>
                <p className="text-slate-400 font-medium">Analyzing your available parts to create a custom build plan for {setDetails.name}...</p>
            </div>
        );
    }

    const currentInstruction = generatedSteps[currentStep];

    return (
        <div className="flex flex-col min-h-[100dvh] bg-slate-950 font-sans relative text-slate-100 pb-safe">
            <div className="absolute top-0 left-0 right-0 h-64 bg-slate-900 border-b border-white/10 flex flex-col justify-end p-6">
                <button 
                  onClick={() => onNavigate(Screen.COLLECTION)} 
                  className="absolute top-12 left-6 bg-black/50 backdrop-blur p-2 rounded-full z-20 hover:bg-black/70 border border-white/20">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black mb-1 leading-tight text-white shadow-sm">{setDetails.name}</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Step {currentStep + 1} of {generatedSteps.length}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 mt-64 p-6 overflow-y-auto">
                 <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl mb-6">
                     <h3 className="text-xl font-bold mb-6 text-orange-400">{currentInstruction?.text}</h3>
                     
                     <div className="space-y-4">
                         {currentInstruction?.parts.length > 0 ? currentInstruction.parts.map((p: any, i: number) => (
                             <div key={i} className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-white/5">
                                 <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                                    <Box className="w-6 h-6 text-slate-400" />
                                 </div>
                                 <div className="flex-1">
                                    <div className="font-bold text-white mb-1">{p.name || 'Accessory Part'}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{p.color} • x{p.owned}</div>
                                 </div>
                                 <CheckCircle2 className="w-6 h-6 text-green-500" />
                             </div>
                         )) : (
                            <div className="text-slate-500 font-medium text-center py-4">No parts required for this step.</div>
                         )}
                     </div>
                 </div>
            </div>

            <div className="p-6 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex gap-4">
                <button 
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                
                {currentStep < generatedSteps.length - 1 ? (
                    <button 
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        className="flex-1 bg-orange-500 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        Next Step <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button 
                        onClick={() => onNavigate(Screen.COLLECTION)}
                        className="flex-1 bg-green-500 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        Finish Build <CheckCircle2 className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};
