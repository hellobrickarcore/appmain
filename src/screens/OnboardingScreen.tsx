import React, { useEffect } from 'react';
import { Screen } from '../types';
import { Logo } from '../components/Logo';
import confetti from 'canvas-confetti';

interface OnboardingScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNavigate }) => {
  useEffect(() => {
    // Single subtle burst on mount
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFD600', '#FF7A30', '#2563EB', '#FFFFFF'],
      disableForReducedMotion: true
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0A1229] flex flex-col font-sans overflow-hidden">
        {/* Top Header Section */}
        <div className="h-4 bg-[#FF7A30] w-full relative z-30" />
        
        {/* Logo Centered */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-20">
            <div className="mb-12 transform scale-[2.5] opacity-90">
                <Logo size="lg" showText={false} inverted />
            </div>

            <div className="px-10 text-center">
                <h1 className="text-[48px] font-black text-white leading-[1.05] tracking-tight mb-8">
                    Let's build<br />
                    awesome <span className="text-[#FF7A30]">models</span><br />
                    <span className="text-[#FF7A30]">together.</span>
                </h1>
                
                <p className="text-slate-400 text-xl font-bold leading-snug max-w-[280px] mx-auto">
                    Your journey to becoming a master builder starts now.
                </p>
            </div>
        </div>

        {/* Dynamic Background with Bricks */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[10%] left-[10%] w-24 h-24 bg-white/20 rounded-[20px] rotate-12 blur-sm" />
            <div className="absolute top-[20%] right-[15%] w-16 h-16 bg-white/20 rounded-xl -rotate-12 blur-md" />
            <div className="absolute bottom-[25%] left-[20%] w-32 h-32 bg-white/10 rounded-[32px] rotate-[45deg] blur-lg" />
            <div className="absolute bottom-[10%] right-[10%] w-20 h-20 bg-white/20 rounded-2xl -rotate-[30deg] blur-sm" />
        </div>

        <div className="px-10 pb-[max(env(safe-area-inset-bottom),3rem)] pt-10">
            <button
                onClick={() => onNavigate(Screen.AUTH)}
                className="w-full bg-[#2563EB] text-white py-6 rounded-[32px] font-black text-2xl shadow-2xl active:scale-[0.98] transition-all"
            >
                Continue
            </button>
        </div>
    </div>
  );
};
