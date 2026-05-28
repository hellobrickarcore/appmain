import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { appStateService } from '../services/appStateService';
import { Logo } from '../components/Logo';

export const OnboardingQuestionnaire: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (currentSlide === 2) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#34D399', '#FFFFFF', '#10B981']
      });
    } else if (currentSlide === 3) {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.7 },
        colors: ['#34D399', '#10B981', '#E2E8F0']
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
    if (distance > minSwipeDistance && currentSlide < 3) setCurrentSlide(c => c + 1);
    if (distance < -minSwipeDistance && currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  const handleNext = () => {
    if (currentSlide < 3) setCurrentSlide(c => c + 1);
    else activateTrial();
  };

  const activateTrial = () => {
    localStorage.setItem('hellobrick_onboarding_finished', 'true');
    localStorage.setItem('hellobrick_is_pro', 'true');
    appStateService.navigate(Screen.SCANNER);
  };

  const slides = [
    {
      tag: 'Scanner',
      headline: 'Visual.\nScanner.\nLive.',
      sub: 'Identify and value any LEGO set instantly using AI computer vision.',
      cta: 'Start Scanning Free',
      bgImage: 'https://cdn.rebrickable.com/media/sets/75192-1.jpg',
      content: (
        <div className="flex-1 flex flex-col items-center justify-center relative w-full py-4">
          <div className="w-full max-w-[280px] aspect-square rounded-[48px] border-[3px] border-emerald-400/30 relative flex items-center justify-center bg-emerald-500/5 backdrop-blur-sm shadow-[0_0_60px_-15px_rgba(52,211,153,0.3)]">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-400 shadow-[0_0_15px_2px_rgba(52,211,153,0.8)] animate-[bounce_3s_ease-in-out_infinite]" />
            <Zap className="w-20 h-20 text-emerald-400 opacity-90 filter drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
          </div>
        </div>
      )
    },
    {
      tag: 'Market',
      headline: 'Real-Time\nMarket\nPrices',
      sub: 'We track global secondary markets so you know exactly what your collection is worth.',
      cta: 'Continue',
      bgImage: 'https://cdn.rebrickable.com/media/sets/10305-1.jpg',
      content: (
        <div className="flex-1 flex flex-col justify-end w-full py-4">
          <div className="w-full bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/10 rounded-[36px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full" />
            <div className="flex justify-between items-end mb-8 relative z-10">
               <div>
                 <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block mb-1">Index Growth</span>
                 <span className="text-white font-black text-3xl tracking-tight">+8.4%</span>
               </div>
               <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-black">YoY</div>
            </div>
            
            <div className="relative h-32 w-full flex items-end gap-1.5 z-10">
              {[30, 45, 40, 60, 55, 75, 70, 90, 85, 100].map((height, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-400/90 rounded-t-sm transition-all duration-700" style={{ height: `${height}%` }} />
              ))}
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
      bgImage: 'https://cdn.rebrickable.com/media/sets/10294-1.jpg',
      content: (
        <div className="flex-1 flex flex-col justify-end w-full py-4">
          <div className="w-full bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/10 rounded-[36px] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-[#2A2A2A] to-[#3A3A3A] rounded-2xl flex items-center justify-center shadow-inner border border-white/5">
                 <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                 </svg>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Status</div>
                <div className="text-emerald-400 font-black text-xl tracking-tight">Encrypted</div>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Condition Tracking', icon: '✨' },
                { label: 'Cloud Sync', icon: '☁️' },
                { label: 'Offline Mode', icon: '🚀' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-[#222222]/80 border border-white/5 rounded-2xl p-4">
                  <div className="text-xl">{item.icon}</div>
                  <div className="text-white text-base font-bold">{item.label}</div>
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
      bgImage: 'https://cdn.rebrickable.com/media/sets/21309-1.jpg',
      content: (
        <div className="flex-1 flex flex-col justify-end w-full py-4">
          <div className="w-full bg-gradient-to-b from-emerald-900/40 to-[#1A1A1A]/90 backdrop-blur-xl border border-emerald-500/20 rounded-[36px] p-8 shadow-[0_0_50px_-12px_rgba(52,211,153,0.2)]">
            <div className="text-white font-black text-3xl mb-8 tracking-tighter">HelloBrick <span className="text-emerald-400">Core</span></div>
            <div className="space-y-6">
            {[
              'Unlimited AI object detection',
              'Live global price indexes',
              'Secure local vault sync',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                  <span className="text-emerald-400 text-sm font-black">✓</span>
                </div>
                <span className="text-slate-100 text-[17px] font-bold tracking-tight">{item}</span>
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
      className="fixed inset-0 bg-[#0D111A] flex flex-col font-sans overflow-hidden text-white select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Immersive Background Image */}
      {slide.bgImage && (
        <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ease-in-out">
          <img src={slide.bgImage} className="w-full h-full object-cover opacity-[0.25]" alt="background" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D111A] via-[#0D111A]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D111A]/60 to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="relative z-20 px-6 pt-[max(env(safe-area-inset-top),2.5rem)] flex justify-between items-center shrink-0">
        <Logo size="sm" showText={true} light />
        <div className="flex items-center gap-4">
          <button onClick={activateTrial} className="text-slate-400 text-xs font-bold uppercase tracking-widest active:scale-95 transition-transform">Skip</button>
        </div>
      </div>

      {/* Tag pill */}
      <div className="relative z-20 px-8 pt-8 shrink-0">
        <div className="inline-block bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-5 py-2">
          <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">{slide.tag}</span>
        </div>
      </div>

      {/* Headline */}
      <div className="relative z-20 px-8 pt-6 shrink-0">
        <h1 className="text-[44px] font-black tracking-tighter leading-[1.05] text-white whitespace-pre-line drop-shadow-2xl">
          {slide.headline}
        </h1>
      </div>

      {/* Content area */}
      <div className="relative z-20 flex-1 min-h-0 flex flex-col px-6">
        {slide.content}
      </div>

      {/* Subtitle */}
      <div className="relative z-20 px-8 pb-8 shrink-0">
        <p className="text-slate-300 text-[15px] leading-relaxed font-semibold">
          {slide.sub}
        </p>
      </div>

      {/* Dot indicators */}
      <div className="relative z-20 flex justify-start gap-2 px-8 pb-8 shrink-0">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-8 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'w-2 bg-white/20'}`}
          />
        ))}
      </div>

      {/* CTA Button */}
      <div className="relative z-20 px-6 pb-[max(env(safe-area-inset-bottom),2.5rem)] shrink-0">
        <button
          onClick={handleNext}
          className="w-full bg-white text-slate-900 font-black text-lg py-5 rounded-[24px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)]"
        >
          {slide.cta}
          {currentSlide === 3 && <Zap className="w-5 h-5 text-emerald-500" />}
        </button>
      </div>
    </div>
  );
};
