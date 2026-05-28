import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { Zap, Check, ArrowRight, Star, Loader2, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { appStateService } from '../services/appStateService';
import { Logo } from '../components/Logo';

const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FFD600', '#F97316', '#2563EB', '#FFFFFF']
    });
  } catch (e) {
    console.error('Confetti failed', e);
  }
};

const BrickButton = ({ label, selected, onClick }: any) => (
  <button
    onClick={onClick}
    className={`relative w-full text-left p-5 rounded-2xl font-black text-[15px] transition-all duration-200 transform active:scale-95 flex justify-between items-center ${
      selected 
        ? 'bg-orange-500 text-white shadow-[0_6px_0_#C2410C,0_15px_30px_rgba(249,115,22,0.4)] -translate-y-1 border-2 border-orange-400' 
        : 'bg-[#1E293B] text-slate-200 shadow-[0_6px_0_#0F172A] hover:-translate-y-1 hover:shadow-[0_6px_0_#0F172A,0_15px_30px_rgba(0,0,0,0.5)] border-2 border-[#334155]'
    }`}
    style={{ marginBottom: '6px' }}
  >
    {/* Studs decoration at the top */}
    <div className="absolute top-2 left-4 flex gap-2 pointer-events-none">
      <div className={`w-3 h-3 rounded-full shadow-inner opacity-20 ${selected ? 'bg-white' : 'bg-slate-400'}`} />
      <div className={`w-3 h-3 rounded-full shadow-inner opacity-20 ${selected ? 'bg-white' : 'bg-slate-400'}`} />
      <div className={`w-3 h-3 rounded-full shadow-inner opacity-20 hidden sm:block ${selected ? 'bg-white' : 'bg-slate-400'}`} />
    </div>
    
    <span className="relative z-10 pt-3">{label}</span>
    <div className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors pt-3 pb-3 mt-3 ${
      selected ? 'border-white bg-white' : 'border-slate-500 bg-transparent'
    }`}>
      {selected && <Check className="w-4 h-4 text-orange-600" strokeWidth={4} />}
    </div>
  </button>
);

const AnimatedMascot = () => (
  <div className="absolute top-[10%] -right-4 w-24 h-24 animate-[bounce_4s_ease-in-out_infinite] z-0 opacity-40 pointer-events-none filter drop-shadow-2xl">
    <div className="animate-[spin_12s_linear_infinite]">
       <Logo size="lg" showText={false} light />
    </div>
  </div>
);

export const OnboardingQuestionnaire: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showRatingsAlert, setShowRatingsAlert] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Questionnaire state
  const [answers, setAnswers] = useState<{
    source: string | null;
    mattersMost: string | null;
    knowWorth: string | null;
    collectionSize: string | null;
    buyFrequency: string | null;
  }>({
    source: null,
    mattersMost: null,
    knowWorth: null,
    collectionSize: null,
    buyFrequency: null,
  });

  // Dynamic plan builder state
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentSlide === 7) { 
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            try {
              confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 },
                colors: ['#FFD600', '#2563EB', '#FFFFFF', '#F97316']
              });
            } catch(e) {}
            return 100;
          }
          return prev + 3; // Smooth increment
        });
      }, 60);
      return () => clearInterval(interval);
    }
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < 7) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(c => c + 1);
        setIsTransitioning(false);
      }, 200);
    } else {
      setShowRatingsAlert(true);
    }
  };

  const handleSelectOption = (key: keyof typeof answers, val: string) => {
    setAnswers(prev => ({ ...prev, [key]: val }));
    triggerConfetti();
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(c => c + 1);
      setIsTransitioning(false);
    }, 400); // Wait for confetti pop
  };

  const skipOnboarding = () => {
    try {
      appStateService.navigate(Screen.SUBSCRIPTION);
    } catch(e) {
      console.error('Crash during skip:', e);
    }
  };

  const progressPercent = Math.min(progress, 100);

  return (
    <div className="fixed inset-0 bg-[#070A13] flex flex-col font-sans overflow-hidden text-white select-none">
      {/* Top Banner Accent */}
      <div className="h-[6px] bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 w-full relative z-30" />

      {/* Immersive Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-orange-600/15 blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-blue-600/15 blur-[100px]" />
      </div>

      {currentSlide > 1 && currentSlide < 7 && <AnimatedMascot />}

      {/* Header */}
      {currentSlide < 6 && (
        <div className="relative z-20 px-6 pt-[max(env(safe-area-inset-top),20px)] flex justify-between items-center shrink-0">
          <Logo size="sm" showText={true} light />
          <button 
            onClick={skipOnboarding}
            className="text-slate-400/80 hover:text-white text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all bg-white/5 px-4 py-2 rounded-full"
          >
            Skip
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className={`flex-1 relative z-10 flex flex-col px-8 justify-center min-h-0 overflow-y-auto no-scrollbar py-6 transition-opacity duration-200 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        
        {/* Step 0: Splash Slide 1 */}
        {currentSlide === 0 && (
          <div className="w-full flex flex-col items-center justify-center space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="w-[200px] h-[200px] rounded-[48px] bg-gradient-to-tr from-orange-500/20 to-orange-400/5 border-2 border-orange-500/30 flex items-center justify-center relative shadow-[0_0_80px_-10px_rgba(239,68,68,0.3)]">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-2xl" />
              
              <div className="absolute inset-4 rounded-[32px] overflow-hidden bg-slate-900/80 flex items-center justify-center backdrop-blur-md">
                <Zap className="w-20 h-20 text-orange-500 animate-pulse drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-[42px] font-black tracking-tight leading-[1.1] text-white">
                Scan any<br />minifigure
              </h1>
              <p className="text-slate-400 text-[16px] font-bold max-w-[280px] mx-auto leading-relaxed">
                Identify any LEGO minifigure instantly with your camera.
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Splash Slide 2 */}
        {currentSlide === 1 && (
          <div className="w-full flex flex-col items-center justify-center space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="w-[200px] h-[200px] rounded-[48px] bg-gradient-to-tr from-blue-500/20 to-blue-400/5 border-2 border-blue-500/30 flex items-center justify-center relative shadow-[0_0_80px_-10px_rgba(37,99,235,0.3)]">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />
              
              <div className="absolute inset-4 rounded-[32px] overflow-hidden bg-slate-900/80 flex items-center justify-center backdrop-blur-md">
                <MessageSquare className="w-20 h-20 text-blue-500 animate-bounce drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-[42px] font-black tracking-tight leading-[1.1] text-white">
                Discover what<br />you can build
              </h1>
              <p className="text-slate-400 text-[16px] font-bold max-w-[280px] mx-auto leading-relaxed">
                Get creative building suggestions based on your catalog.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Source Attribution */}
        {currentSlide === 2 && (
          <div className="w-full flex flex-col space-y-8">
            <div className="space-y-2 relative z-10">
              <h2 className="text-[34px] font-black leading-[1.1] text-white">Where did you hear about us?</h2>
              <p className="text-slate-400 text-[15px] font-bold">This helps us know where to focus our crew.</p>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              {[
                { label: 'TikTok 🎵', id: 'tiktok' },
                { label: 'Instagram 📸', id: 'instagram' },
                { label: 'App Store 🍏', id: 'appstore' },
                { label: 'Reddit 🤖', id: 'reddit' },
                { label: 'X (Twitter) 🐦', id: 'twitter' },
                { label: 'Other 🌍', id: 'other' }
              ].map((opt) => (
                <BrickButton key={opt.id} label={opt.label} selected={answers.source === opt.id} onClick={() => handleSelectOption('source', opt.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Question 2 */}
        {currentSlide === 3 && (
          <div className="w-full flex flex-col space-y-8">
            <div className="space-y-2 relative z-10">
              <h2 className="text-[34px] font-black leading-[1.1] text-white">What matters most to you?</h2>
              <p className="text-slate-400 text-[15px] font-bold">We'll tailor HelloBrick just for you.</p>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              {[
                { label: 'Discover what I can build', id: 'build' },
                { label: 'Identify pieces fast', id: 'scan' },
                { label: 'Organize everything in one place', id: 'catalog' },
                { label: 'Know what my collection is worth', id: 'worth' }
              ].map((opt) => (
                <BrickButton key={opt.id} label={opt.label} selected={answers.mattersMost === opt.id} onClick={() => handleSelectOption('mattersMost', opt.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Question 3 */}
        {currentSlide === 4 && (
          <div className="w-full flex flex-col space-y-8">
            <div className="space-y-2 relative z-10">
              <h2 className="text-[34px] font-black leading-[1.1] text-white">Do you know what your LEGO is worth?</h2>
              <p className="text-slate-400 text-[15px] font-bold">Most collectors are surprised.</p>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              {[
                { label: 'No idea 🤷‍♂️', val: 'none' },
                { label: 'A rough guess 🪙', val: 'guess' },
                { label: 'I track some of it 📊', val: 'some' },
                { label: 'Down to the dollar 💸', val: 'dollar' }
              ].map((opt) => (
                <BrickButton key={opt.val} label={opt.label} selected={answers.knowWorth === opt.val} onClick={() => handleSelectOption('knowWorth', opt.val)} />
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Question 4 */}
        {currentSlide === 5 && (
          <div className="w-full flex flex-col space-y-8">
            <div className="space-y-2 relative z-10">
              <h2 className="text-[34px] font-black leading-[1.1] text-white">How big is your collection?</h2>
              <p className="text-slate-400 text-[15px] font-bold">Let's check your vault size.</p>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              {[
                { label: 'Just starting out (1-5 sets) 🌟', val: 'small' },
                { label: 'Casual builder (6-20 sets) 🧱', val: 'medium' },
                { label: 'Serious collector (21-100 sets) 🏆', val: 'large' },
                { label: 'LEGO Master (100+ sets) 👑', val: 'master' }
              ].map((opt) => (
                <BrickButton key={opt.val} label={opt.label} selected={answers.collectionSize === opt.val} onClick={() => handleSelectOption('collectionSize', opt.val)} />
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Question 5 */}
        {currentSlide === 6 && (
          <div className="w-full flex flex-col space-y-8">
            <div className="space-y-2 relative z-10">
              <h2 className="text-[34px] font-black leading-[1.1] text-white">How often do you buy LEGO?</h2>
              <p className="text-slate-400 text-[15px] font-bold">We'll tailor alerts to your pace.</p>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              {[
                { label: 'Once a year or less 📅', val: 'rarely' },
                { label: 'A few times a year 🛍️', val: 'sometimes' },
                { label: 'Every month 🛒', val: 'monthly' },
                { label: 'Almost weekly 📦', val: 'weekly' }
              ].map((opt) => (
                <BrickButton key={opt.val} label={opt.label} selected={answers.buyFrequency === opt.val} onClick={() => handleSelectOption('buyFrequency', opt.val)} />
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Custom Loader Screen */}
        {currentSlide === 7 && (
          <div className="w-full flex flex-col items-center justify-center space-y-10">
            {/* Custom Circular Loader */}
            <div className="relative w-44 h-44 flex items-center justify-center drop-shadow-2xl">
              {/* Spinning background glow */}
              <div className="absolute inset-0 rounded-full border-[6px] border-slate-800 shadow-inner" />
              <div 
                className="absolute inset-0 rounded-full border-[6px] border-orange-500 border-t-transparent animate-spin" 
                style={{ animationDuration: '1.2s' }}
              />
              
              <div className="flex flex-col items-center justify-center z-10 bg-slate-900/60 rounded-full w-36 h-36 backdrop-blur-md border border-slate-700/50">
                <span className="text-4xl font-black text-white tracking-tight drop-shadow-md">{progressPercent}%</span>
                <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest mt-1">Planning</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white">Building your plan...</h2>
              <p className="text-slate-400 text-sm font-bold">This only takes a moment.</p>
            </div>

            {/* Checklist */}
            <div className="w-full max-w-[320px] bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-[32px] p-6 space-y-4 shadow-2xl">
              {[
                { label: 'Collector profile created', step: 25 },
                { label: '20,993 sets tracked', step: 50 },
                { label: '17,790 minifigs indexed', step: 75 },
                { label: '70,843 parts synced', step: 100 }
              ].map((item) => {
                const isDone = progressPercent >= item.step;
                return (
                  <div key={item.step} className="flex items-center justify-between">
                    <span className={`text-[14px] font-black transition-colors duration-300 ${isDone ? 'text-white' : 'text-slate-600'}`}>{item.label}</span>
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <span className="text-[12px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1 animate-in zoom-in duration-300">
                          <Check className="w-4 h-4 text-emerald-400" strokeWidth={4} /> Done
                        </span>
                      ) : (
                        <span className="text-[12px] font-black text-slate-700 uppercase tracking-wider">
                          Waiting
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Footer Area */}
      {currentSlide < 2 && (
        <div className="px-8 pb-[max(env(safe-area-inset-bottom),20px)] pt-4 shrink-0">
          <button
            onClick={handleNext}
            className="w-full bg-[#2563EB] text-white py-5 rounded-[22px] font-black text-[17px] shadow-[0_6px_0_#1E40AF,0_15px_30px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_0px_0_#1E40AF] transition-all flex items-center justify-center gap-3 border border-blue-400/30"
          >
            <span>Continue</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {currentSlide === 7 && (
        <div className="px-8 pb-[max(env(safe-area-inset-bottom),20px)] pt-4 shrink-0">
          <button
            onClick={handleNext}
            disabled={progressPercent < 100}
            className={`w-full py-5 rounded-[22px] font-black text-[17px] transition-all flex items-center justify-center gap-3 border ${progressPercent >= 100 ? 'bg-orange-500 text-white shadow-[0_6px_0_#C2410C,0_15px_30px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_0px_0_#C2410C] border-orange-400/50' : 'bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed'}`}
          >
            <span>See my plan</span>
            {progressPercent >= 100 ? <Zap className="w-6 h-6 text-white animate-pulse" /> : <Loader2 className="w-6 h-6 animate-spin" />}
          </button>
        </div>
      )}

      {/* 5-Star Ratings popup */}
      {showRatingsAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-slate-100">
            <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-orange-100">
              <Logo size="lg" showText={false} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">Enjoying HelloBrick?</h3>
            <p className="text-slate-500 text-sm font-bold px-2 mb-6 leading-relaxed">
              A quick App Store review helps us reach more fans and keeps the free updates coming!
            </p>
            
            {/* 5 glowing gold stars */}
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-10 h-10 text-amber-400 fill-current filter drop-shadow-[0_4px_8px_rgba(245,158,11,0.4)] hover:scale-110 transition-transform" />
              ))}
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowRatingsAlert(false);
                  try {
                    confetti({ particleCount: 100, spread: 80, zIndex: 9999 });
                    appStateService.navigate(Screen.SUBSCRIPTION);
                  } catch(e) {}
                }}
                className="w-full py-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-black rounded-2xl text-[15px] active:scale-95 transition-all shadow-[0_6px_0_#1E40AF,0_10px_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_0px_0_#1E40AF]"
              >
                Submit Review
              </button>
              <button
                onClick={() => {
                  setShowRatingsAlert(false);
                  try {
                    appStateService.navigate(Screen.SUBSCRIPTION);
                  } catch(e) {}
                }}
                className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs uppercase tracking-widest mt-2"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
