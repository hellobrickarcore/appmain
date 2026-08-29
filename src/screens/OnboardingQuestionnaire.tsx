import React, { useEffect, useState } from 'react';
import { Screen } from '../types';
import { appStateService } from '../services/appStateService';
import { Logo } from '../components/Logo';
import { ChevronRight, CheckCircle2, TrendingUp, Star, Camera } from 'lucide-react';

interface OnboardingProps {
  onNavigate?: (screen: Screen) => void;
}

const CATEGORIES = [
  { id: 'pokemon', label: 'Pokémon TCG', icon: '⚡', color: '#F59E0B' },
  { id: 'lego', label: 'LEGO Sets & Minifigs', icon: '🧱', color: '#10B981' },
  { id: 'mtg', label: 'Magic: The Gathering', icon: '🔥', color: '#EF4444' },
  { id: 'sports', label: 'Sports Cards', icon: '🏀', color: '#3B82F6' },
  { id: 'all', label: 'A bit of everything', icon: '✨', color: '#8B5CF6' },
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
  const [loadingText, setLoadingText] = useState('Analyzing collection data...');

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (step === 3) {
      const catName = CATEGORIES.find(c => c.id === selectedCategory)?.label || 'collectibles';
      
      const t1 = setTimeout(() => setLoadingText(`Loading ${catName} market prices...`), 800);
      const t2 = setTimeout(() => setLoadingText(`Configuring your personal vault...`), 1600);
      const t3 = setTimeout(() => {
        goTo(4, 'forward');
      }, 2600);
      
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
        onNavigate(Screen.SCANNER);
      } else {
        appStateService.navigate(Screen.SCANNER);
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
        .ob-content-in-fwd  { animation: ob-slide-in-fwd  0.35s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        .ob-content-in-bwd  { animation: ob-slide-in-bwd  0.35s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        .ob-content-out-fwd { animation: ob-slide-out-fwd 0.18s cubic-bezier(0.55,0,1,0.45) both; }
        .ob-content-out-bwd { animation: ob-slide-out-bwd 0.18s cubic-bezier(0.55,0,1,0.45) both; }
        .animate-pulse-soft { animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

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
          {/* STEP 0: Value Proposition */}
          {step === 0 && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h1 className="text-[36px] font-black text-white leading-[1.1] tracking-tight mb-4 mt-8">
                  Your Collection Is Worth Thousands
                </h1>
                <p className="text-zinc-400 text-[17px] font-medium leading-relaxed">
                  Discover the true market value of every item you own — automatically.
                </p>
              </div>

              {/* Fake visual of value */}
              <div className="relative h-[220px] w-full my-8 bg-[#1C1C1E] rounded-3xl border border-white/10 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-50" />
                <TrendingUp className="w-12 h-12 text-emerald-400 mb-3 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-1">Total Vault Value</span>
                <span className="text-4xl font-black text-white tracking-tighter">$14,295.00</span>
                <div className="mt-3 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                  +12.4% this year
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

          {/* STEP 1: Category Selection */}
          {step === 1 && (
            <div className="flex-1 flex flex-col">
              <div className="mt-4 mb-8">
                <span className="text-emerald-500 font-bold text-sm uppercase tracking-widest mb-2 block">Step 1 of 2</span>
                <h1 className="text-[32px] font-black text-white leading-tight mb-2">What do you collect?</h1>
                <p className="text-zinc-400 text-[16px]">We'll tailor your vault to your collection.</p>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pb-4">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setTimeout(() => goTo(2, 'forward'), 150);
                    }}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${
                      selectedCategory === cat.id 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-[#2C2C2E] bg-[#1C1C1E] hover:border-[#3C3C3E]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-black/50 flex items-center justify-center text-2xl border border-white/5">
                      {cat.icon}
                    </div>
                    <span className="text-white font-bold text-lg flex-1">{cat.label}</span>
                    <ChevronRight className={`w-5 h-5 ${selectedCategory === cat.id ? 'text-emerald-500' : 'text-zinc-600'}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Goal Selection */}
          {step === 2 && (
            <div className="flex-1 flex flex-col">
              <div className="mt-4 mb-8">
                <span className="text-emerald-500 font-bold text-sm uppercase tracking-widest mb-2 block">Step 2 of 2</span>
                <h1 className="text-[32px] font-black text-white leading-tight mb-2">What's your main goal?</h1>
                <p className="text-zinc-400 text-[16px]">This helps us set up your dashboard.</p>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pb-4">
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGoal(g.id);
                      setTimeout(() => goTo(3, 'forward'), 150);
                    }}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${
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
                <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-3xl">
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
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/40 relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-50" />
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                
                <h1 className="text-[34px] font-black text-white leading-tight mb-4">
                  Your Vault is Ready
                </h1>
                
                <p className="text-zinc-400 text-lg leading-relaxed max-w-[280px]">
                  We've customized your experience for <span className="text-white font-bold">{currentCategory?.label || 'collectibles'}</span> to help you <span className="text-white font-bold">{currentGoal?.label.toLowerCase() || 'track your collection'}</span>.
                </p>

                <div className="mt-8 p-4 bg-[#1C1C1E] border border-white/10 rounded-2xl flex items-center gap-4 w-full max-w-[300px]">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
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
