import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { Logo } from '../components/Logo';
import { ChevronRight, Search, Box, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingScreenProps {
  onNavigate: (screen: Screen) => void;
}

const ONBOARDING_STEPS = [
  {
    title: "Identify Instantly",
    description: "Scan thousands of bricks in seconds. Our AI lens identifies parts with industrial precision.",
    icon: <Search className="w-8 h-8 text-blue-400" />,
    image: "/onboarding_scan_bg_1773682593724.png",
    accent: "bg-blue-600"
  },
  {
    title: "Secure Your Vault",
    description: "Track every piece you own. See your build potential grow as you scan your collection.",
    icon: <Box className="w-8 h-8 text-orange-500" />,
    image: "/onboarding_vault_bg_1773682607010.png",
    accent: "bg-orange-500"
  },
  {
    title: "Infinite Ideas",
    description: "Get custom build ideas based on your exact bricks. Fuel your creativity with AI-powered prompts.",
    icon: <Sparkles className="w-8 h-8 text-yellow-500" />,
    image: "/onboarding_ideas_bg_1773682621185.png",
    accent: "bg-yellow-500"
  }
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNavigate }) => {
  console.log('[Onboarding] Initializing...');
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Swipe logic
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    }
    if (isRightSwipe && currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      localStorage.setItem('hellobrick_onboarding_finished', 'true');
      onNavigate(Screen.AUTH);
    }
  };

  useEffect(() => {
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD600', '#FF7A30', '#2563EB', '#FFFFFF']
      });
    }
  }, [currentStep]);

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div 
      className="fixed inset-0 bg-[#050A18] flex flex-col font-sans overflow-hidden text-white"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src={step.image} 
            alt="background" 
            className="w-full h-full object-cover opacity-50 transition-all duration-1000 transform scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050A18]/20 via-[#050A18]/60 to-[#050A18]" />
        </div>

        {/* Top Header */}
        <div className="relative z-20 px-8 pt-[max(env(safe-area-inset-top),3rem)] flex justify-between items-center">
            <Logo size="md" showText={false} light />
            <button 
              onClick={() => onNavigate(Screen.AUTH)}
              className="text-slate-400 font-black text-xs uppercase tracking-widest px-4 py-2 bg-white/5 rounded-full border border-white/10"
            >
              Skip
            </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-end px-8 pb-12 relative z-10">
            <div className={`w-16 h-16 ${step.accent}/20 rounded-[24px] flex items-center justify-center mb-8 border border-white/10 backdrop-blur-md`}>
                {step.icon}
            </div>

            <h1 className="text-[42px] font-black leading-[1.1] tracking-tight mb-4 animate-in slide-in-from-bottom-4 duration-500">
                {step.title.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? "text-orange-500 block" : ""}>{word} </span>
                ))}
            </h1>
            
            <p className="text-slate-300 text-lg font-bold leading-snug max-w-[320px] mb-12 animate-in slide-in-from-bottom-6 duration-700 opacity-80">
                {step.description}
            </p>

            {/* Pagination Dots */}
            <div className="flex gap-2 mb-10">
              {ONBOARDING_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-blue-500' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>

            {/* CTA Button */}
            <button
                onClick={nextStep}
                className={`w-full ${currentStep === 2 ? 'bg-orange-600' : 'bg-blue-600'} text-white py-5 rounded-[28px] font-black text-xl shadow-2xl active:scale-[0.98] transition-all hover:brightness-110 flex items-center justify-center gap-3 group`}
            >
                {currentStep === 2 ? "Get Started" : "Continue"}
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/10 blur-[120px] rounded-full -ml-32 -mb-32" />
    </div>
  );
};
