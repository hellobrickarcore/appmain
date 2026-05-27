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
      headline: 'Your LEGO\nCollection Is\nSecretly Worth\nThousands',
      sub: 'HelloBrick — a collector\'s premium dark character mode',
      cta: 'Start Scanning Free',
      content: (
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Price tags floating */}
            <div className="absolute top-0 left-4 rotate-[-20deg] bg-[#2A2A2A] border border-white/10 rounded-xl px-3 py-1.5 shadow-xl">
              <span className="text-white font-black text-sm">Y29</span>
            </div>
            <div className="absolute top-8 right-2 rotate-[15deg] bg-[#2A2A2A] border border-white/10 rounded-xl px-3 py-1.5 shadow-xl">
              <span className="text-white font-black text-sm">Y29</span>
            </div>
            <div className="absolute bottom-4 left-0 rotate-[-10deg] bg-[#2A2A2A] border border-white/10 rounded-xl px-3 py-1.5 shadow-xl opacity-70">
              <span className="text-white font-black text-sm">Y20</span>
            </div>
            <div className="absolute top-16 left-0 rotate-[5deg] bg-[#2A2A2A] border border-white/10 rounded-xl px-3 py-1.5 shadow-xl opacity-50">
              <span className="text-white font-black text-sm">Y20</span>
            </div>
            {/* Minifigs from Rebrickable */}
            <img
              src="https://cdn.rebrickable.com/media/sets/71394-12.jpg"
              alt="LEGO Minifigs"
              className="w-56 h-40 object-contain drop-shadow-2xl"
              onError={e => { e.currentTarget.src = 'https://cdn.rebrickable.com/media/sets/71396-9.jpg'; }}
            />
          </div>
        </div>
      )
    },
    {
      tag: 'Scanner',
      headline: 'Scan Any Set\nSee Its Real\nValue Instantly',
      sub: 'Point the camera at any LEGO box. Our AI scanner catalogs and values it in seconds.',
      cta: 'Continue',
      content: (
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="relative w-56 h-56 rounded-3xl overflow-hidden border-2 border-dashed border-emerald-400/40 bg-slate-900/50 flex items-center justify-center shadow-2xl">
            <img
              src="https://cdn.rebrickable.com/media/sets/75292-1.jpg"
              alt="Lego Razor Crest"
              className="w-full h-full object-cover opacity-70"
            />
            {/* Scan line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce" style={{ top: '50%' }} />
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-emerald-400" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-emerald-400" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-emerald-400" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-emerald-400" />
            {/* Value card */}
            <div className="absolute bottom-4 left-3 right-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Sealed</div>
                  <div className="text-white font-black text-sm">The Razor Crest</div>
                </div>
                <div className="text-emerald-400 font-mono font-black text-lg">$280</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      tag: 'Portfolio',
      headline: 'Watch Your\nCollection\nCome Alive',
      sub: 'Your sets assemble into an active investment portfolio with live appreciation and total return.',
      cta: 'Continue',
      content: (
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-slate-400 text-xs font-semibold">Total Value</div>
                <div className="text-white font-black text-3xl">$18,740</div>
              </div>
              <div className="bg-[#2A2A2A] border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-1">
                <span className="text-emerald-400 font-black text-base">+4.2%</span>
              </div>
            </div>
            <div className="text-slate-500 text-xs mb-3 font-semibold">Duo Portfolio Preview</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { img: 'https://cdn.rebrickable.com/media/sets/10270-1.jpg', name: 'Creator Expert', price: '$1,200', up: true },
                { img: 'https://cdn.rebrickable.com/media/sets/75309-1.jpg', name: 'Star Wars', price: '$1,700', up: true },
                { img: 'https://cdn.rebrickable.com/media/sets/75290-1.jpg', name: 'Lego Wars', price: '$800', up: false },
                { img: 'https://cdn.rebrickable.com/media/sets/10277-1.jpg', name: 'Lego Icons', price: '$600', up: false },
              ].map((item, i) => (
                <div key={i} className="bg-[#222222] border border-white/5 rounded-2xl p-3">
                  <img src={item.img} alt={item.name} className="w-full h-14 object-contain mb-2 rounded-lg"
                    onError={e => { e.currentTarget.src = `https://cdn.rebrickable.com/media/sets/10270-1.jpg`; }} />
                  <div className="text-slate-400 text-[10px] font-semibold truncate">{item.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white font-black text-sm">{item.price}</span>
                    <svg viewBox="0 0 40 20" className={`w-8 h-4 ${item.up ? 'stroke-emerald-400' : 'stroke-slate-500'}`} fill="none" strokeWidth="2">
                      {item.up
                        ? <path d="M0,18 C10,18 15,8 20,10 C25,12 30,4 40,2" />
                        : <path d="M0,4 C10,4 15,12 20,10 C25,8 30,14 40,16" />
                      }
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      tag: 'Leaderboard',
      headline: 'LEGO Value\nKings',
      sub: 'See how you rank among serious collectors worldwide.',
      cta: 'Continue',
      content: (
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="w-full max-w-sm space-y-3">
            {[
              { name: 'BrickBaron87', rank: 1, badge: null, gain: null, lego: true },
              { name: 'Anonymous', rank: 2, badge: null, gain: null, lego: true },
              { name: 'Anonymous', rank: 3, badge: null, gain: null, lego: false },
              { name: 'Anonymous', rank: 4, badge: 'Biggest Gainer', gain: null, lego: false },
              { name: 'BrickBaron87', rank: 5, badge: null, gain: '+12%', lego: false },
            ].map((user, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#1A1A1A] border border-white/5 rounded-2xl p-3">
                <img
                  src={`https://api.dicebear.com/7.x/personas/svg?seed=${user.name}${user.rank}`}
                  className="w-10 h-10 rounded-full object-cover bg-slate-700"
                  alt={user.name}
                  onError={e => { e.currentTarget.style.display='none'; }}
                />
                <div className="w-5 h-5 bg-[#333] rounded-full flex items-center justify-center flex-shrink-0 -ml-2">
                  <span className="text-white font-black text-[9px]">{user.rank}</span>
                </div>
                <span className="flex-1 text-white font-semibold text-sm">{user.name}</span>
                {user.lego && (
                  <div className="bg-red-600 rounded-lg px-1.5 py-1">
                    <span className="text-white text-[8px] font-black">LEGO</span>
                  </div>
                )}
                {user.badge && (
                  <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-full px-3 py-1">
                    <span className="text-emerald-400 font-black text-[10px]">{user.badge}</span>
                  </div>
                )}
                {user.gain && (
                  <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-full px-3 py-1">
                    <span className="text-emerald-400 font-black text-[10px]">{user.gain}</span>
                  </div>
                )}
              </div>
            ))}
            <p className="text-center text-slate-400 text-sm font-semibold pt-2">
              See how you rank among serious collectors.
            </p>
          </div>
        </div>
      )
    },
    {
      tag: 'Get Started',
      headline: 'Discover Your\nCollection\'s\nTrue Value\nToday',
      sub: 'Join serious collectors. Start scanning and build your portfolio now. 14 days free.',
      cta: 'Start 14-Day Free Trial',
      content: (
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="text-white font-black text-lg">HelloBrick Premium</div>
            {[
              '⚡ Unlimited instant AI scanning',
              '📈 Live BrickEconomy price index',
              '🏆 LEGO Value Kings leaderboard',
              '🔒 Secure cloud portfolio vault',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <span className="text-emerald-400 text-[10px] font-black">✓</span>
                </div>
                <span className="text-slate-200 text-sm font-semibold">{item}</span>
              </div>
            ))}
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
