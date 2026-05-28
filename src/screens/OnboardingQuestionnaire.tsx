import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { Zap, Check, ArrowRight, Star, Loader2, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { appStateService } from '../services/appStateService';
import { Logo } from '../components/Logo';

export const OnboardingQuestionnaire: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showRatingsAlert, setShowRatingsAlert] = useState(false);
  
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
    if (currentSlide === 7) { // Step 7 is the loading screen
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Play a small celebratory sound fallback or just confetti splash
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#FFD600', '#2563EB', '#FFFFFF']
            });
            return 100;
          }
          return prev + 4; // Faster increment for smooth feel
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < 7) {
      setCurrentSlide(c => c + 1);
    } else {
      // Trigger review popup after they see their plan built
      setShowRatingsAlert(true);
    }
  };

  const handleSelectOption = (key: keyof typeof answers, val: string) => {
    setAnswers(prev => ({ ...prev, [key]: val }));
    // Wait a brief 250ms for visual feedback then auto-proceed
    setTimeout(() => {
      setCurrentSlide(c => c + 1);
    }, 250);
  };

  const skipOnboarding = () => {
    // Skip goes directly to the Subscription/Paywall to remain high-converting
    appStateService.navigate(Screen.SUBSCRIPTION);
  };

  const progressPercent = Math.min(progress, 100);

  return (
    <div className="fixed inset-0 bg-[#070A13] flex flex-col font-sans overflow-hidden text-white select-none">
      {/* Top Banner Accent */}
      <div className="h-[6px] bg-[#FF7A30] w-full relative z-30" />

      {/* Immersive Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-orange-600/10 blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      {/* Header */}
      {currentSlide < 6 && (
        <div className="relative z-20 px-6 pt-[max(env(safe-area-inset-top),20px)] flex justify-between items-center shrink-0">
          <Logo size="sm" showText={true} light />
          <button 
            onClick={skipOnboarding}
            className="text-slate-400/80 hover:text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Skip
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 relative z-10 flex flex-col px-8 justify-center min-h-0 overflow-y-auto no-scrollbar py-6">
        
        {/* Step 0: Splash Slide 1 */}
        {currentSlide === 0 && (
          <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="w-[200px] h-[200px] rounded-[48px] bg-gradient-to-tr from-orange-500/20 to-orange-400/5 border-2 border-orange-500/30 flex items-center justify-center relative shadow-[0_0_60px_-10px_rgba(239,68,68,0.2)]">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-2xl" />
              
              <div className="absolute inset-4 rounded-[32px] overflow-hidden bg-slate-900/80 flex items-center justify-center">
                <Zap className="w-16 h-16 text-orange-500 animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-[38px] font-black tracking-tight leading-none text-white">
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
          <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="w-[200px] h-[200px] rounded-[48px] bg-gradient-to-tr from-blue-500/20 to-blue-400/5 border-2 border-blue-500/30 flex items-center justify-center relative shadow-[0_0_60px_-10px_rgba(37,99,235,0.2)]">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />
              
              <div className="absolute inset-4 rounded-[32px] overflow-hidden bg-slate-900/80 flex items-center justify-center">
                <MessageSquare className="w-16 h-16 text-blue-500 animate-bounce" />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-[38px] font-black tracking-tight leading-none text-white">
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
          <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Question 1 of 5</span>
              <h2 className="text-[28px] font-black leading-tight text-white">Where did you hear about us?</h2>
              <p className="text-slate-400 text-sm font-bold">This helps us know where to focus our crew.</p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: 'TikTok 🎵', id: 'tiktok' },
                { label: 'Instagram 📸', id: 'instagram' },
                { label: 'App Store 🍏', id: 'appstore' },
                { label: 'Reddit 🤖', id: 'reddit' },
                { label: 'X (Twitter) 🐦', id: 'twitter' },
                { label: 'Other 🌍', id: 'other' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption('source', opt.id)}
                  className={`w-full text-left p-5 rounded-[20px] font-bold text-sm transition-all border flex justify-between items-center ${answers.source === opt.id ? 'bg-white text-slate-950 border-white shadow-xl shadow-white/5' : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/10'}`}
                >
                  <span>{opt.label}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers.source === opt.id ? 'bg-orange-500 border-orange-500' : 'border-slate-700'}`}>
                    {answers.source === opt.id && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Question 2 */}
        {currentSlide === 3 && (
          <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Question 2 of 5</span>
              <h2 className="text-[28px] font-black leading-tight text-white">What matters most to you?</h2>
              <p className="text-slate-400 text-sm font-bold">We'll tailor HelloBrick just for you.</p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: 'Discover what I can build', id: 'build' },
                { label: 'Identify pieces fast', id: 'scan' },
                { label: 'Organize everything in one place', id: 'catalog' },
                { label: 'Know what my collection is worth', id: 'worth' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption('mattersMost', opt.id)}
                  className={`w-full text-left p-5 rounded-[20px] font-bold text-sm transition-all border flex justify-between items-center ${answers.mattersMost === opt.id ? 'bg-white text-slate-950 border-white shadow-xl shadow-white/5' : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/10'}`}
                >
                  <span>{opt.label}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers.mattersMost === opt.id ? 'bg-orange-500 border-orange-500' : 'border-slate-700'}`}>
                    {answers.mattersMost === opt.id && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Question 3 */}
        {currentSlide === 4 && (
          <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Question 3 of 5</span>
              <h2 className="text-[28px] font-black leading-tight text-white">Do you know what your LEGO is worth?</h2>
              <p className="text-slate-400 text-sm font-bold">Most collectors are surprised.</p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: 'No idea 🤷‍♂️', val: 'none' },
                { label: 'A rough guess 🪙', val: 'guess' },
                { label: 'I track some of it 📊', val: 'some' },
                { label: 'Down to the dollar 💸', val: 'dollar' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleSelectOption('knowWorth', opt.val)}
                  className={`w-full text-left p-5 rounded-[20px] font-bold text-sm transition-all border flex justify-between items-center ${answers.knowWorth === opt.val ? 'bg-white text-slate-950 border-white shadow-xl' : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/10'}`}
                >
                  <span>{opt.label}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers.knowWorth === opt.val ? 'bg-orange-500 border-orange-500' : 'border-slate-700'}`}>
                    {answers.knowWorth === opt.val && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Question 4 */}
        {currentSlide === 5 && (
          <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Question 4 of 5</span>
              <h2 className="text-[28px] font-black leading-tight text-white">How big is your collection?</h2>
              <p className="text-slate-400 text-sm font-bold">Let's check your vault size.</p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: 'Just starting out (1-5 sets) 🌟', val: 'small' },
                { label: 'Casual builder (6-20 sets) 🧱', val: 'medium' },
                { label: 'Serious collector (21-100 sets) 🏆', val: 'large' },
                { label: 'LEGO Master (100+ sets) 👑', val: 'master' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleSelectOption('collectionSize', opt.val)}
                  className={`w-full text-left p-5 rounded-[20px] font-bold text-sm transition-all border flex justify-between items-center ${answers.collectionSize === opt.val ? 'bg-white text-slate-950 border-white shadow-xl' : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/10'}`}
                >
                  <span>{opt.label}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers.collectionSize === opt.val ? 'bg-orange-500 border-orange-500' : 'border-slate-700'}`}>
                    {answers.collectionSize === opt.val && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Question 5 */}
        {currentSlide === 6 && (
          <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Question 5 of 5</span>
              <h2 className="text-[28px] font-black leading-tight text-white">How often do you buy LEGO?</h2>
              <p className="text-slate-400 text-sm font-bold">We'll tailor alerts to your pace.</p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: 'Once a year or less 📅', val: 'rarely' },
                { label: 'A few times a year 🛍️', val: 'sometimes' },
                { label: 'Every month 🛒', val: 'monthly' },
                { label: 'Almost weekly 📦', val: 'weekly' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleSelectOption('buyFrequency', opt.val)}
                  className={`w-full text-left p-5 rounded-[20px] font-bold text-sm transition-all border flex justify-between items-center ${answers.buyFrequency === opt.val ? 'bg-white text-slate-950 border-white shadow-xl' : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/10'}`}
                >
                  <span>{opt.label}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers.buyFrequency === opt.val ? 'bg-orange-500 border-orange-500' : 'border-slate-700'}`}>
                    {answers.buyFrequency === opt.val && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Custom Loader Screen */}
        {currentSlide === 7 && (
          <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
            {/* Custom Circular Loader */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Spinning background glow */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div 
                className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" 
                style={{ animationDuration: '1.2s' }}
              />
              
              <div className="flex flex-col items-center justify-center z-10">
                <span className="text-3xl font-black text-white tracking-tight">{progressPercent}%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Planning</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white">Building your plan...</h2>
              <p className="text-slate-500 text-xs font-semibold">This only takes a moment.</p>
            </div>

            {/* Checklist */}
            <div className="w-full max-w-[280px] bg-white/5 border border-white/5 rounded-3xl p-5 space-y-3">
              {[
                { label: 'Collector profile', step: 25 },
                { label: '20,993 sets tracked', step: 50 },
                { label: '17,790 minifigs tracked', step: 75 },
                { label: '70,843 parts tracked', step: 100 }
              ].map((item) => {
                const isDone = progressPercent >= item.step;
                return (
                  <div key={item.step} className="flex items-center justify-between">
                    <span className={`text-xs font-bold transition-colors ${isDone ? 'text-slate-200' : 'text-slate-500'}`}>{item.label}</span>
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1 animate-in zoom-in duration-200">
                          <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} /> Done
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                          Waiting...
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
            className="w-full bg-[#2563EB] text-white py-5 rounded-[22px] font-black text-base shadow-[0_8px_30px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {currentSlide === 7 && (
        <div className="px-8 pb-[max(env(safe-area-inset-bottom),20px)] pt-4 shrink-0">
          <button
            onClick={handleNext}
            disabled={progressPercent < 100}
            className={`w-full py-5 rounded-[22px] font-black text-base transition-all flex items-center justify-center gap-3 ${progressPercent >= 100 ? 'bg-[#FF7A30] text-white shadow-[0_8px_30px_rgba(255,122,48,0.3)] active:scale-[0.98]' : 'bg-slate-900 text-slate-600 border border-slate-800/80 opacity-50 cursor-not-allowed'}`}
          >
            <span>See my plan</span>
            {progressPercent >= 100 ? <Zap className="w-5 h-5 text-white animate-pulse" /> : <Loader2 className="w-5 h-5 animate-spin" />}
          </button>
        </div>
      )}

      {/* 5-Star Ratings popup */}
      {showRatingsAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Logo size="md" showText={false} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Enjoying HelloBrick?</h3>
            <p className="text-slate-500 text-xs font-semibold px-4 mb-4 leading-relaxed">
              A quick App Store review helps us reach more fans and keeps the free updates coming!
            </p>
            
            {/* 5 glowing gold stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-8 h-8 text-amber-400 fill-current filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.3)]" />
              ))}
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowRatingsAlert(false);
                  appStateService.navigate(Screen.SUBSCRIPTION);
                  confetti({ particleCount: 60, spread: 40 });
                }}
                className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-black rounded-2xl text-sm uppercase tracking-wider active:scale-95 transition-all shadow-lg"
              >
                Submit Review
              </button>
              <button
                onClick={() => {
                  setShowRatingsAlert(false);
                  appStateService.navigate(Screen.SUBSCRIPTION);
                }}
                className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs uppercase tracking-wider"
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
