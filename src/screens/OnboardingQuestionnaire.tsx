import React, { useEffect, useState, useRef } from 'react';
import { Screen } from '../types';
import { appStateService } from '../services/appStateService';
import { Logo } from '../components/Logo';

interface OnboardingProps {
  onNavigate?: (screen: Screen) => void;
}

const slides = [
  {
    id: 'value',
    headline: 'Your LEGO Collection\nIs Worth Thousands',
    sub: 'Discover the true market value of every set you own — automatically.',
    accent: '#10B981',
    cards: [
      { img: 'https://cdn.rebrickable.com/media/sets/75192-1/1.jpg', label: 'Millennium Falcon', price: '$849', rot: -8, x: '5%', y: '0%', delay: '0s', size: 140 },
      { img: 'https://cdn.rebrickable.com/media/sets/10294-1/1.jpg', label: 'Titanic', price: '$679', rot: 6, x: '52%', y: '10%', delay: '0.4s', size: 148 },
    ]
  },
  {
    id: 'scan',
    headline: 'Scan Any Set\nin Seconds',
    sub: 'Point. Tap. Done. Our AI identifies any LEGO set or minifigure instantly.',
    accent: '#FF7A30',
    cards: [
      { img: 'https://cdn.rebrickable.com/media/sets/10300-1/1.jpg', label: 'Back to Future', price: '$234', rot: -5, x: '8%', y: '5%', delay: '0.1s', size: 136 },
      { img: 'https://cdn.rebrickable.com/media/sets/75313-1/1.jpg', label: 'AT-AT', price: '$549', rot: 7, x: '50%', y: '0%', delay: '0.5s', size: 152 },
    ]
  },
  {
    id: 'track',
    headline: 'Track, Wishlist\n& Invest Smarter',
    sub: 'Watch prices rise, get retirement alerts, and grow your collection like a portfolio.',
    accent: '#6366F1',
    cards: [
      { img: 'https://cdn.rebrickable.com/media/sets/10255-1/1.jpg', label: 'Assembly Square', price: '$412', rot: -6, x: '3%', y: '8%', delay: '0.2s', size: 138 },
      { img: 'https://cdn.rebrickable.com/media/sets/10270-1/1.jpg', label: 'Bookshop', price: '$339', rot: 8, x: '55%', y: '2%', delay: '0.6s', size: 144 },
    ]
  },
  {
    id: 'ready',
    headline: 'Ready to Discover\nYour Vault?',
    sub: 'Join thousands of LEGO collectors who track and grow their collections with HelloBrick.',
    accent: '#FFD600',
    cards: [
      { img: 'https://cdn.rebrickable.com/media/sets/21318-1/1.jpg', label: 'Tree House', price: '$297', rot: -7, x: '6%', y: '3%', delay: '0s', size: 142 },
      { img: 'https://cdn.rebrickable.com/media/sets/71040-1/1.jpg', label: 'Disney Castle', price: '$998', rot: 5, x: '53%', y: '8%', delay: '0.4s', size: 146 },
    ]
  }
];

export const OnboardingQuestionnaire: React.FC<OnboardingProps> = ({ onNavigate }) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    // Slight delay so mount animation fires
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const goTo = (idx: number, dir: 'forward' | 'back' = 'forward') => {
    if (transitioning || idx < 0 || idx >= slides.length) return;
    setTransitioning(true);
    setDirection(dir);
    // Small pause so exit animation plays, then swap slide
    setTimeout(() => {
      setSlideIdx(idx);
      setTimeout(() => setTransitioning(false), 350);
    }, 180);
  };

  const handleNext = () => {
    if (slideIdx < slides.length - 1) {
      goTo(slideIdx + 1, 'forward');
    } else {
      handleStart();
    }
  };

  const handleBack = () => {
    if (slideIdx > 0) goTo(slideIdx - 1, 'back');
  };

  const handleStart = () => {
    try {
      appStateService.navigate(Screen.AUTH);
    } catch (e) {}
  };

  // Swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - (touchStartY.current || 0));
    if (Math.abs(dx) > 50 && dy < 80) {
      if (dx < 0) handleNext();
      else handleBack();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const slide = slides[slideIdx];
  const isLast = slideIdx === slides.length - 1;

  return (
    <div
      className="flex-1 bg-[#111111] flex flex-col overflow-hidden relative select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ userSelect: 'none' }}
    >
      {/* Global CSS for the onboarding animations */}
      <style>{`
        @keyframes ob-float-a {
          0%, 100% { transform: translateY(0px) rotate(var(--ob-rot)) scale(1); }
          50%       { transform: translateY(-14px) rotate(var(--ob-rot)) scale(1.02); }
        }
        @keyframes ob-float-b {
          0%, 100% { transform: translateY(0px) rotate(var(--ob-rot)) scale(1); }
          50%       { transform: translateY(-10px) rotate(var(--ob-rot)) scale(1.015); }
        }
        @keyframes ob-slide-in-fwd {
          from { opacity: 0; transform: translateX(48px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes ob-slide-in-bwd {
          from { opacity: 0; transform: translateX(-48px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes ob-slide-out-fwd {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-48px); }
        }
        @keyframes ob-slide-out-bwd {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(48px); }
        }
        @keyframes ob-pulse-ring {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes ob-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .ob-card-a { animation: ob-float-a 5.5s ease-in-out infinite; }
        .ob-card-b { animation: ob-float-b 4.8s ease-in-out infinite; }
        .ob-content-in-fwd  { animation: ob-slide-in-fwd  0.35s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        .ob-content-in-bwd  { animation: ob-slide-in-bwd  0.35s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        .ob-content-out-fwd { animation: ob-slide-out-fwd 0.18s cubic-bezier(0.55,0,1,0.45) both; }
        .ob-content-out-bwd { animation: ob-slide-out-bwd 0.18s cubic-bezier(0.55,0,1,0.45) both; }
        .ob-pulse-ring { animation: ob-pulse-ring 1.8s ease-out infinite; }
        .ob-shimmer-btn {
          background: linear-gradient(90deg, var(--btn-from) 0%, var(--btn-mid) 50%, var(--btn-from) 100%);
          background-size: 200% auto;
          animation: ob-shimmer 2.2s linear infinite;
        }

        /* 📱 RESPONSIVE HEIGHTS FOR SMALL VIEWPORTS */
        @media (max-height: 740px) {
          .ob-card-container {
            height: 180px !important;
            margin-top: 8px !important;
          }
          .ob-card-item {
            width: calc(var(--card-size) * 0.8px) !important;
          }
          .ob-title-text {
            font-size: 24px !important;
            margin-bottom: 8px !important;
          }
          .ob-sub-text {
            font-size: 13px !important;
          }
          .ob-cta-container {
            padding-bottom: 12px !important;
            margin-top: 12px !important;
          }
          .ob-cta-btn {
            padding-top: 12px !important;
            padding-bottom: 12px !important;
            font-size: 14px !important;
          }
        }
      `}</style>

      {/* Radial glow behind everything — accent colour */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${slide.accent}22 0%, transparent 70%)`,
          marginTop: '-80px',
        }}
      />

      {/* ─── Header ─────────────────────────────────── */}
      <div className="relative z-20 pt-[max(env(safe-area-inset-top),2.5rem)] px-6 flex items-center justify-between">
        <Logo size="sm" light={true} />
        {slideIdx < slides.length - 1 && (
          <button
            onClick={handleStart}
            className="text-zinc-500 text-xs font-bold uppercase tracking-widest px-2 py-1 active:opacity-70 transition-opacity"
          >
            Skip
          </button>
        )}
      </div>

      {/* ─── Floating Preview Cards ──────────────────── */}
      <div className="relative z-10 h-[260px] w-full shrink-0 mt-4 overflow-visible ob-card-container">
        {slide.cards.map((card, i) => {
          const hasFailed = failedImages[`${slide.id}-${i}`];
          let fallbackEmoji = '🧱';
          if (card.label.includes('Falcon') || card.label.includes('AT-AT')) fallbackEmoji = '🚀';
          else if (card.label.includes('Titanic')) fallbackEmoji = '🚢';
          else if (card.label.includes('Future')) fallbackEmoji = '🚗';
          else if (card.label.includes('Square') || card.label.includes('Bookshop')) fallbackEmoji = '🏢';
          else if (card.label.includes('House')) fallbackEmoji = '🌳';
          else if (card.label.includes('Castle')) fallbackEmoji = '🏰';

          return (
            <div
              key={`${slide.id}-${i}`}
              className={`absolute bg-[#1C1C1E] rounded-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/8 overflow-hidden p-3 ob-card-item ${i === 0 ? 'ob-card-a' : 'ob-card-b'}`}
              style={{
                '--card-size': card.size,
                width: 'calc(var(--card-size) * 1px)',
                left: card.x,
                top: card.y,
                '--ob-rot': `${card.rot}deg`,
                transform: `rotate(${card.rot}deg)`,
                animationDelay: card.delay,
              } as React.CSSProperties}
            >
              <div className="w-full aspect-square bg-[#2C2C2E] rounded-[14px] mb-2.5 overflow-hidden flex items-center justify-center p-2 relative">
                {hasFailed ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] flex flex-col items-center justify-center text-center p-1.5 animate-fade-in">
                    <span className="text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] mb-1">{fallbackEmoji}</span>
                    <span className="text-[7.5px] uppercase font-black tracking-widest" style={{ color: slide.accent }}>Vault Item</span>
                  </div>
                ) : (
                  <img 
                    src={card.img} 
                    alt={card.label} 
                    onError={() => setFailedImages(prev => ({ ...prev, [`${slide.id}-${i}`]: true }))}
                    className="w-full h-full object-contain drop-shadow-xl" 
                    loading="lazy" 
                  />
                )}
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider text-center truncate">{card.label}</p>
              <p className="text-center font-black text-base mt-0.5" style={{ color: slide.accent }}>{card.price}</p>
            </div>
          );
        })}

        {/* Pulsing accent dot behind cards */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="ob-pulse-ring w-16 h-16 rounded-full border-2" style={{ borderColor: slide.accent + '66' }} />
        </div>
      </div>

      {/* ─── Text Content ────────────────────────────── */}
      <div className="flex-1 flex flex-col px-7 pt-6 z-20 relative overflow-hidden">
        <div
          key={`text-${slideIdx}`}
          className={
            transitioning
              ? direction === 'forward' ? 'ob-content-out-fwd' : 'ob-content-out-bwd'
              : mounted
                ? direction === 'forward' ? 'ob-content-in-fwd' : 'ob-content-in-bwd'
                : ''
          }
        >
          {/* Page indicator dots */}
          <div className="flex items-center gap-2 mb-5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > slideIdx ? 'forward' : 'back')}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === slideIdx ? 20 : 6,
                  height: 6,
                  background: i === slideIdx ? slide.accent : '#3A3A3C',
                }}
              />
            ))}
          </div>

          <h1 className="text-[34px] font-black text-white leading-[1.1] tracking-tight mb-3 whitespace-pre-line ob-title-text">
            {slide.headline}
          </h1>
          <p className="text-zinc-400 text-[16px] font-medium leading-relaxed ob-sub-text">
            {slide.sub}
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ─── CTA Buttons ─── */}
        <div className="pb-[max(env(safe-area-inset-bottom),2.5rem)] space-y-3 ob-cta-container">
          {/* Primary CTA */}
          <button
            onClick={handleNext}
            disabled={transitioning}
            className="w-full py-5 rounded-[18px] font-black text-[17px] text-white active:scale-[0.97] transition-transform shadow-lg relative overflow-hidden ob-cta-btn"
            style={{
              background: slide.accent,
              boxShadow: `0 8px 30px ${slide.accent}44`,
              '--btn-from': slide.accent,
              '--btn-mid': slide.accent + 'dd',
            } as React.CSSProperties}
          >
            {isLast ? 'Get Started' : 'Continue'}
          </button>

          {/* Back or Sign-in link */}
          {slideIdx > 0 ? (
            <button
              onClick={handleBack}
              className="w-full py-3 text-zinc-500 font-bold text-[13px] active:opacity-70 transition-opacity"
            >
              ← Back
            </button>
          ) : (
            <button
              onClick={() => appStateService.navigate(Screen.EMAIL_LOGIN)}
              className="w-full py-3 text-zinc-500 font-bold text-[13px] active:opacity-70 transition-opacity"
            >
              Already have an account? <span className="text-white font-black">Sign in</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
