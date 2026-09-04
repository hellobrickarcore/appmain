import React, { useEffect, useState } from 'react';
import { Screen } from '../types';
import { appStateService } from '../services/appStateService';
import { Logo } from '../components/Logo';
import { liveCollectibleService } from '../services/liveCollectibleService';
import { ChevronRight, CheckCircle2, TrendingUp, Star, Camera } from 'lucide-react';

interface OnboardingProps {
  onNavigate?: (screen: Screen) => void;
}

const WELCOME_CARDS = [
  { img: 'https://images.pokemontcg.io/swsh7/215_hires.png', label: 'Umbreon VMAX', price: '$850', rot: -8, x: '5%', y: '10%', delay: '0s', size: 135 },
  { img: 'https://images.pokemontcg.io/base1/4_hires.png', label: 'Charizard 1st Ed', price: '$4,500', rot: 6, x: '48%', y: '15%', delay: '0.4s', size: 145 },
];

const CATEGORIES = [
  { id: 'pokemon', label: 'Pokémon TCG', icon: '⚡', img: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=800&auto=format&fit=crop' },
  { id: 'lego', label: 'LEGO Sets', icon: '🧱', img: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=800&auto=format&fit=crop' },
  { id: 'mtg', label: 'Magic TCG', icon: '🔥', img: 'https://cards.scryfall.io/art_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg' },
  { id: 'yugioh', label: 'Yu-Gi-Oh!', icon: '👁️', img: 'https://images.unsplash.com/photo-1620336655055-088d06e36bf0?q=80&w=800&auto=format&fit=crop' },
];

const GOALS = [
  { id: 'track', label: 'Track portfolio value', icon: <TrendingUp className="w-6 h-6" /> },
  { id: 'scan', label: 'Quickly scan & identify', icon: <Camera className="w-6 h-6" /> },
  { id: 'wishlist', label: 'Build a wishlist', icon: <Star className="w-6 h-6" /> },
];

export const OnboardingQuestionnaire: React.FC<OnboardingProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  // State for Magic onboarding image
  const [magicImg, setMagicImg] = useState<string | null>('https://cards.scryfall.io/art_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg');

  // Fetch Magic sample image on mount and when category changes
  useEffect(() => {
    liveCollectibleService.fetchMagicSampleImage().then(url => {
      if (url) setMagicImg(url);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (step === 3) {
      const catName = CATEGORIES.find(c => c.id === selectedCategory)?.label || 'collectibles';
      
      const t1 = setTimeout(() => setLoadingText(`Loading ${catName} market prices...`), 400);
      const t2 = setTimeout(() => setLoadingText(`Configuring your personal vault...`), 800);
      const t3 = setTimeout(() => {
        setTransitioning(true);
        setDirection('forward');
        setTimeout(() => {
          setStep(4);
          setTimeout(() => setTransitioning(false), 350);
        }, 180);
      }, 1200);
      
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [step, selectedCategory]);

  const goTo = (newStep: number, dir: 'forward' | 'back' = 'forward') => {
    if (transitioning) return;
    setTransitioning(true);
    setDirection(dir);
    setTimeout(() => {
      setStep(newStep);
      setTimeout(() => setTransitioning(false), 350);
    }, 180);
  };

  const handleFinish = () => {
    try {
      localStorage.setItem('hellobrick_onboarding_finished', 'true');
      if (selectedCategory) localStorage.setItem('hellobrick_pref_category', selectedCategory);
      if (selectedGoal) localStorage.setItem('hellobrick_pref_goal', selectedGoal);
      
      if (onNavigate) {
        onNavigate(Screen.AUTH);
      } else {
        appStateService.navigate(Screen.AUTH);
      }
    } catch (e) {}
  };

  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory);
  const currentGoal = GOALS.find(c => c.id === selectedGoal);

  return (
    <div className="h-full w-full bg-[#111111] flex flex-col overflow-hidden relative select-none">
      <style>{`
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
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes ob-float-a {
          0%, 100% { transform: translateY(0px) rotate(var(--ob-rot)) scale(1); }
          50%       { transform: translateY(-14px) rotate(var(--ob-rot)) scale(1.02); }
        }
        @keyframes ob-float-b {
          0%, 100% { transform: translateY(0px) rotate(var(--ob-rot)) scale(1); }
          50%       { transform: translateY(-10px) rotate(var(--ob-rot)) scale(1.015); }
        }
        @keyframes ob-pulse-ring {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .ob-content-in-fwd  { animation: ob-slide-in-fwd  0.35s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        .ob-content-in-bwd  { animation: ob-slide-in-bwd  0.35s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        .ob-content-out-fwd { animation: ob-slide-out-fwd 0.18s cubic-bezier(0.55,0,1,0.45) both; }
        .ob-content-out-bwd { animation: ob-slide-out-bwd 0.18s cubic-bezier(0.55,0,1,0.45) both; }
        .animate-pulse-soft { animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        
        .ob-card-a { animation: ob-float-a 5.5s ease-in-out infinite; }
        .ob-card-b { animation: ob-float-b 4.8s ease-in-out infinite; }
        .ob-pulse-ring { animation: ob-pulse-ring 1.8s ease-out infinite; }
      `}</style>

      {/* Radial glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none transition-all duration-700"
           style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', marginTop: '-80px' }} />

      {/* Header */}
      <div className="relative z-20 pt-[max(env(safe-area-inset-top),2.5rem)] px-6 flex items-center justify-between">
        <Logo size="sm" light={true} />
        {step < 3 && (
          <button
            onClick={handleFinish}
            className="text-zinc-500 text-xs font-bold uppercase tracking-widest px-2 py-1 active:opacity-70 transition-opacity"
          >
            Skip
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col px-7 pt-6 z-20 relative overflow-hidden pb-[max(env(safe-area-inset-bottom),2.5rem)]">
        <div
          className={`flex-1 flex flex-col ${
            transitioning
              ? direction === 'forward' ? 'ob-content-out-fwd' : 'ob-content-out-bwd'
              : mounted
                ? direction === 'forward' ? 'ob-content-in-fwd' : 'ob-content-in-bwd'
                : 'opacity-0'
          }`}
        >
          {/* STEP 0: Value Proposition with Floating Image Cards */}
          {step === 0 && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h1 className="text-[36px] font-black text-white leading-[1.1] tracking-tight mb-4 mt-2">
                  Your Collection Is Worth Thousands
                </h1>
                <p className="text-zinc-400 text-[17px] font-medium leading-relaxed">
                  Discover the true market value of every item you own — automatically.
                </p>
              </div>

              {/* Animated Floating Image Cards */}
              <div className="relative z-10 h-[260px] w-full shrink-0 mt-8 overflow-visible">
                {WELCOME_CARDS.map((card, i) => (
                  <div
                    key={i}
                    className={`absolute bg-[#1C1C1E] rounded-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden p-3 ${i === 0 ? 'ob-card-a z-20' : 'ob-card-b z-10'}`}
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
                      <img referrerPolicy="no-referrer" src={card.img} alt={card.label} className="w-full h-full object-contain drop-shadow-xl" loading="lazy" />
                    </div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider text-center truncate">{card.label}</p>
                    <p className="text-center font-black text-base mt-0.5 text-emerald-400">{card.price}</p>
                  </div>
                ))}
                
                {/* Pulsing accent dot behind cards */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="ob-pulse-ring w-16 h-16 rounded-full border-2 border-emerald-500/40" />
                </div>
              </div>

              <div className="mt-auto pt-4 space-y-4">
                <button
                  onClick={() => goTo(1, 'forward')}
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg active:scale-[0.98] transition-transform shadow-[0_8px_30px_rgba(16,185,129,0.3)]"
                >
                  Continue
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate(Screen.EMAIL_LOGIN);
                    else appStateService.navigate(Screen.EMAIL_LOGIN);
                  }}
                  className="w-full py-3 text-zinc-500 font-bold text-[14px] active:opacity-70 transition-opacity"
                >
                  Already have an account? <span className="text-white">Sign in</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Category Selection (Image Cards Grid) */}
          {step === 1 && (
            <div className="flex-1 flex flex-col">
              <div className="mt-2 mb-6">
                <span className="text-emerald-500 font-bold text-sm uppercase tracking-widest mb-1 block">Step 1 of 2</span>
                <h1 className="text-[32px] font-black text-white leading-tight mb-2">What do you collect?</h1>
                <p className="text-zinc-400 text-[16px]">We'll tailor your vault to your collection.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto no-scrollbar pb-4 px-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setTimeout(() => goTo(2, 'forward'), 250);
                    }}
                    className={`relative rounded-3xl overflow-hidden aspect-[4/5] border-2 transition-all duration-300 shadow-xl ${
                      selectedCategory === cat.id 
                        ? 'border-emerald-500 scale-[0.96] shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                        : 'border-[#2C2C2E] hover:border-white/20'
                    }`}
                  >
                    <img referrerPolicy="no-referrer" src={cat.id === 'mtg' ? (magicImg || cat.img) : cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    {selectedCategory === cat.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 left-4 right-4 text-left">
                      <div className="text-2xl mb-1 filter drop-shadow-md">{cat.icon}</div>
                      <div className="text-white font-black text-lg leading-tight filter drop-shadow-md">{cat.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Goal Selection */}
          {step === 2 && (
            <div className="flex-1 flex flex-col">
              <div className="mt-2 mb-6">
                <span className="text-emerald-500 font-bold text-sm uppercase tracking-widest mb-1 block">Step 2 of 2</span>
                <h1 className="text-[32px] font-black text-white leading-tight mb-2">What's your main goal?</h1>
                <p className="text-zinc-400 text-[16px]">This helps us set up your dashboard.</p>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pb-4">
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGoal(g.id);
                      setTimeout(() => goTo(3, 'forward'), 200);
                    }}
                    className={`w-full p-5 rounded-[20px] border-2 flex items-center gap-4 transition-all text-left shadow-lg ${
                      selectedGoal === g.id 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-[#2C2C2E] bg-[#1C1C1E] hover:border-[#3C3C3E]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-black/50 flex items-center justify-center border border-white/5 ${
                      selectedGoal === g.id ? 'text-emerald-500' : 'text-zinc-400'
                    }`}>
                      {g.icon}
                    </div>
                    <span className="text-white font-bold text-lg flex-1">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Loading / Analyzing */}
          {step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-[#2C2C2E] rounded-full" />
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-4xl filter drop-shadow-lg">
                  {currentCategory?.icon || '✨'}
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Personalizing your vault</h2>
              <p className="text-emerald-400 font-medium animate-pulse-soft">{loadingText}</p>
            </div>
          )}

          {/* STEP 4: Ready / Activation Moment */}
          {step === 4 && (
            <div className="flex-1 flex flex-col justify-between pt-12 pb-4">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-500/40 relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-50" />
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                
                <h1 className="text-[34px] font-black text-white leading-tight mb-4">
                  Your Vault is Ready
                </h1>
                
                <p className="text-zinc-400 text-[17px] leading-relaxed max-w-[280px]">
                  We've customized your experience for <span className="text-white font-bold">{currentCategory?.label || 'collectibles'}</span> to help you <span className="text-white font-bold">{currentGoal?.label.toLowerCase() || 'track your collection'}</span>.
                </p>

                <div className="mt-10 p-5 bg-[#1C1C1E] border border-white/10 rounded-2xl flex items-center gap-4 w-full max-w-[320px] shadow-2xl">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                    <Camera className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-bold">Try it now</div>
                    <div className="text-zinc-400 text-sm">Scan an item to see its value</div>
                  </div>
                </div>
              </div>

              <div className="pt-8 w-full">
                <button
                  onClick={handleFinish}
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg active:scale-[0.98] transition-transform shadow-[0_8px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Scan Your First Item
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
