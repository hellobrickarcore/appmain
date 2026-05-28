import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { ChevronRight, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { appStateService } from '../services/appStateService';
import { Logo } from '../components/Logo';

export const OnboardingQuestionnaire: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Trigger confetti on slide 3 (portfolio reveal) and slide 5 (final push)
  useEffect(() => {
    if (currentSlide === 2) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#C9A84C', '#FF7A30', '#2563EB', '#FFFFFF']
      });
    } else if (currentSlide === 4) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#C9A84C', '#E2E8F0', '#F59E0B']
      });
    }
  }, [currentSlide]);

  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && currentSlide < 4) setCurrentSlide(c => c + 1);
    if (distance < -minSwipeDistance && currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  const handleNext = () => {
    if (currentSlide < 4) setCurrentSlide(c => c + 1);
    else activateTrial();
  };

  const activateTrial = () => {
    localStorage.setItem('hellobrick_onboarding_finished', 'true');
    localStorage.setItem('hellobrick_is_pro', 'true');
    appStateService.navigate(Screen.SCANNER);
  };

  const slides = [
    {
      tag: 'Onboarding',
      headline: 'Visual.\nScanner.\nLive.',
      sub: 'HelloBrick — Identify and value any LEGO brick or set in seconds.',
      cta: 'Start Scanning Free',
      content: (
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <div className="w-48 h-48 bg-gradient-to-tr from-[#1A1A1A] to-[#2A2A2A] rounded-[40px] shadow-2xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <Zap className="w-16 h-16 text-emerald-400 opacity-80" />
            
            {/* Minimalist scanner corner markers */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-500/50" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-500/50" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-emerald-500/50" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-500/50" />
          </div>
        </div>
      )
    },
    {
      tag: 'Scanner',
      headline: 'Real-Time\nMarket\nPrices',
      sub: 'We track global secondary markets so you know exactly what your collection is worth.',
      cta: 'Continue',
      content: (
        <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-4">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
               <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Market Index</span>
               <span className="text-emerald-400 font-black text-sm">+8.4% YoY</span>
            </div>
            
            <div className="h-24 flex items-end gap-2 px-2">
              {[40, 60, 45, 80, 65, 100].map((height, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-400/80 rounded-t-lg" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
               <span className="text-white font-black text-xl tracking-tight">Accurate Appraisals</span>
            </div>
          </div>
        </div>
      )
    },
    {
      tag: 'Portfolio',
      headline: 'Build Your\nDigital Vault',
      sub: 'Safely store your entire collection in the cloud, track condition, and get price alerts.',
      cta: 'Continue',
      content: (
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Your Portfolio</div>
                <div className="text-white font-black text-4xl tracking-tighter">Secure</div>
              </div>
              <div className="w-12 h-12 bg-[#2A2A2A] rounded-2xl flex items-center justify-center">
                 <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                 </svg>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { label: 'Condition Tracking', color: 'bg-emerald-400' },
                { label: 'Cloud Sync', color: 'bg-blue-400' },
                { label: 'Offline Mode', color: 'bg-purple-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#222222] border border-white/5 rounded-xl p-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <div className="text-slate-300 text-sm font-semibold">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      tag: 'Get Started',
      headline: 'Discover Your\nCollection\'s\nTrue Value',
      sub: 'Join serious collectors. Start scanning and build your portfolio now.',
      cta: 'Initialize Scanner',
      content: (
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />
            <div className="text-white font-black text-2xl mb-6 tracking-tight relative z-10">HelloBrick Core</div>
            <div className="space-y-5 relative z-10">
            {[
              '⚡ Unlimited AI object detection',
              '📈 Live global price indexes',
              '🔒 Secure local vault sync',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <span className="text-emerald-400 text-xs font-black">✓</span>
                </div>
                <span className="text-slate-200 text-[15px] font-semibold">{item}</span>
              </div>
            ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div
      className="fixed inset-0 bg-[#131313] flex flex-col font-sans overflow-hidden text-white select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="relative z-20 px-6 pt-[max(env(safe-area-inset-top),2.5rem)] flex justify-between items-center shrink-0">
        <Logo size="sm" showText={true} light />
        <div className="flex items-center gap-4">
          <button onClick={activateTrial} className="text-slate-400 text-sm font-semibold">Skip</button>
        </div>
      </div>

      {/* Tag pill */}
      <div className="px-6 pt-4 shrink-0">
        <div className="inline-block bg-[#2A2A2A] border border-white/10 rounded-full px-4 py-1.5">
          <span className="text-white text-xs font-semibold">{slide.tag}</span>
        </div>
      </div>

      {/* Headline */}
      <div className="px-6 pt-4 shrink-0">
        <h1 className="text-4xl font-black tracking-tight leading-[1.08] text-white whitespace-pre-line">
          {slide.headline}
        </h1>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 flex flex-col px-6">
        {slide.content}
      </div>

      {/* Subtitle */}
      <div className="px-6 pb-4 shrink-0">
        <p className="text-slate-400 text-sm text-center leading-snug font-medium">
          {slide.sub}
        </p>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 pb-4 shrink-0">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/25'}`}
          />
        ))}
      </div>

      {/* CTA Button */}
      <div className="px-6 pb-[max(env(safe-area-inset-bottom),2rem)] shrink-0">
        <button
          onClick={handleNext}
          className="w-full bg-white text-black font-black text-base py-5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-2xl"
        >
          {slide.cta}
          {currentSlide === 4 && <Zap className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
