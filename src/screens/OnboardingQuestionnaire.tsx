import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Box, 
  Sparkles, 
  Star, 
  Zap, 
  Check, 
  TrendingUp, 
  Lock, 
  Shield, 
  DollarSign, 
  Camera, 
  Compass, 
  Award,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { appStateService } from '../services/appStateService';

export const OnboardingQuestionnaire: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [scanPulse, setScanPulse] = useState(true);

  // Auto-pulse scan effects on Slide 2
  useEffect(() => {
    if (currentSlide === 1) {
      const interval = setInterval(() => {
        setScanPulse(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentSlide]);

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
    
    if (isLeftSwipe && currentSlide < 4) {
      setCurrentSlide(curr => curr + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(curr => curr - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < 4) {
      setCurrentSlide(curr => curr + 1);
    } else {
      activateTrial();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(curr => curr - 1);
    }
  };

  const activateTrial = () => {
    console.log('[Onboarding] Activating 14-day free trial...');
    // Lock in Pro status and complete onboarding
    localStorage.setItem('hellobrick_onboarding_finished', 'true');
    localStorage.setItem('hellobrick_is_pro', 'true');
    
    // Automatically drop them into the scanner screen immediately
    appStateService.navigate(Screen.SCANNER);
  };

  return (
    <div 
      className="fixed inset-0 bg-[#0D111A] flex flex-col font-sans overflow-hidden text-white select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Premium ambient backdrop radial lights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/[0.04] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C9A84C]/[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-20 px-6 pt-[max(env(safe-area-inset-top),2rem)] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#C9A84C] to-[#E5C158] flex items-center justify-center shadow-lg shadow-[#C9A84C]/10">
            <Layers className="w-4 h-4 text-[#0D111A]" strokeWidth={2.5} />
          </div>
          <span className="font-sans font-black text-lg tracking-wider text-white">
            HELLO<span className="text-[#C9A84C]">BRICK</span>
          </span>
        </div>
        {currentSlide < 4 && (
          <button 
            onClick={activateTrial}
            className="text-slate-400 font-bold text-xs uppercase tracking-widest px-4 py-2 bg-white/5 rounded-full border border-white/10 active:scale-95 transition-all"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Slide Carousel viewport */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 relative z-10 min-h-0 py-4">
        
        {/* Carousel Transition Area */}
        <div className="w-full max-w-sm flex-1 flex flex-col justify-center items-center transition-all duration-500 ease-out">
          
          {/* SLIDE 1: Hero Welcome (Emotional Hook) */}
          {currentSlide === 0 && (
            <div className="w-full flex-1 flex flex-col justify-between items-center py-2 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center w-full mt-2">
                <h1 className="text-3xl font-black tracking-tight leading-[1.1] text-white">
                  Your LEGO Collection <br />
                  Is Secretly Worth <span className="text-[#C9A84C]">Thousands</span>
                </h1>
                <p className="text-slate-400 font-semibold text-sm mt-3 px-4 leading-snug">
                  Unlock hidden financial value in your sets and minifigures instantly.
                </p>
              </div>

              {/* Phone Mockup Frame */}
              <div className="w-[230px] h-[370px] bg-[#161B26] border-[6px] border-[#2A303F] rounded-[38px] relative overflow-hidden shadow-2xl flex flex-col items-center justify-center p-3 my-4">
                {/* Simulated Phone Camera Notch */}
                <div className="absolute top-2 w-20 h-4 bg-[#2A303F] rounded-full z-30" />
                
                {/* Simulated Background */}
                <div className="absolute inset-0 bg-[#0A0D14]" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[40px] rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#C9A84C]/5 blur-[40px] rounded-full" />

                {/* Floating assets inside phone */}
                <div className="w-full h-full relative flex flex-col justify-center items-center z-10">
                  {/* Fiat Red Car */}
                  <div className="absolute top-8 left-2 w-[120px] transition-all hover:scale-105 duration-300">
                    <img 
                      src="https://cdn.rebrickable.com/media/sets/10271-1.jpg" 
                      alt="Lego Fiat 500" 
                      className="w-full h-auto rounded-xl shadow-lg border border-white/5"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#C9A84C]/50 shadow-md">
                      <span className="font-mono text-xs font-black text-[#C9A84C]">$150</span>
                    </div>
                  </div>

                  {/* Passenger Train */}
                  <div className="absolute bottom-8 right-2 w-[120px] transition-all hover:scale-105 duration-300">
                    <img 
                      src="https://cdn.rebrickable.com/media/sets/60197-1.jpg" 
                      alt="Lego Train" 
                      className="w-full h-auto rounded-xl shadow-lg border border-white/5"
                    />
                    <div className="absolute -bottom-2 -left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#C9A84C]/50 shadow-md">
                      <span className="font-mono text-xs font-black text-[#C9A84C]">$100</span>
                    </div>
                  </div>

                  {/* Airplane (Centered overlap) */}
                  <div className="absolute top-[120px] right-2 w-[120px] transition-all hover:scale-105 duration-300 z-20">
                    <img 
                      src="https://cdn.rebrickable.com/media/sets/60262-1.jpg" 
                      alt="Lego Plane" 
                      className="w-full h-auto rounded-xl shadow-lg border border-white/5"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-400/50 shadow-md">
                      <span className="font-mono text-xs font-black text-emerald-400">$200</span>
                    </div>
                  </div>

                  {/* Brand Tag Overlay */}
                  <div className="absolute bottom-3 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Collector Portfolio</span>
                  </div>
                </div>
              </div>

              <div className="w-full text-center mt-2 px-4">
                <span className="text-xs text-slate-500 font-bold">Swipe left to proceed</span>
              </div>
            </div>
          )}

          {/* SLIDE 2: Instant Scan Teaser (Magic Scan) */}
          {currentSlide === 1 && (
            <div className="w-full flex-1 flex flex-col justify-between items-center py-2 animate-in slide-in-from-right-12 duration-500">
              <div className="text-center w-full mt-2">
                <h1 className="text-3xl font-black tracking-tight leading-[1.1] text-white">
                  Scan Any Set → See <br />
                  Its <span className="text-emerald-400">Real Value</span> Instantly
                </h1>
                <p className="text-slate-400 font-semibold text-sm mt-3 px-4 leading-snug">
                  Point the camera at any LEGO box. Our AI scanner catalogs and values it in seconds.
                </p>
              </div>

              {/* Phone Mockup Frame containing Simulated Viewfinder */}
              <div className="w-[230px] h-[370px] bg-[#161B26] border-[6px] border-[#2A303F] rounded-[38px] relative overflow-hidden shadow-2xl flex flex-col items-center justify-center p-3 my-4">
                {/* Phone Notch */}
                <div className="absolute top-2 w-20 h-4 bg-[#2A303F] rounded-full z-30" />
                
                {/* Viewfinder Background (Razor Crest Box Photo) */}
                <div className="absolute inset-0 z-0 bg-slate-900">
                  <img 
                    src="https://cdn.rebrickable.com/media/sets/75292-1.jpg" 
                    alt="Lego Razor Crest Box" 
                    className="w-full h-full object-cover opacity-70 filter brightness-[0.7] contrast-125"
                  />
                  {/* Sweep Laser animation overlay */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400 animate-scan-sweep" />
                </div>

                {/* Viewfinder crop bracket highlights */}
                <div className="absolute inset-x-8 inset-y-16 border-2 border-dashed border-emerald-400/40 rounded-2xl pointer-events-none z-10">
                  {/* Crop corners */}
                  <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-4 border-l-4 border-emerald-400" />
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-4 border-r-4 border-emerald-400" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-4 border-l-4 border-emerald-400" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-4 border-r-4 border-emerald-400" />
                </div>

                {/* Dynamic scan card reveal */}
                <div className={`absolute bottom-6 left-3 right-3 bg-[#111622]/90 border border-white/10 rounded-2xl p-3 backdrop-blur-md z-20 shadow-xl transition-all duration-700 ${scanPulse ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'}`}>
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">SEALED</span>
                    <span className="font-mono text-xs font-black text-emerald-400 leading-none">$280.00</span>
                  </div>
                  <h3 className="font-black text-[10px] text-white mt-1 leading-tight truncate">LEGO Star Wars</h3>
                  <p className="text-slate-400 text-[8px] font-bold leading-tight truncate">The Razor Crest (75292)</p>
                </div>
              </div>

              <div className="w-full text-center mt-2 px-4">
                <span className="text-xs text-slate-500 font-bold">Try swiping left to see the dashboard</span>
              </div>
            </div>
          )}

          {/* SLIDE 3: Magic Value Reveal & Portfolio Tease */}
          {currentSlide === 2 && (
            <div className="w-full flex-1 flex flex-col justify-between items-center py-2 animate-in slide-in-from-right-12 duration-500">
              <div className="text-center w-full mt-2">
                <h1 className="text-3xl font-black tracking-tight leading-[1.1] text-white">
                  Watch Your <br />
                  Collection <span className="text-[#C9A84C]">Come Alive</span>
                </h1>
                <p className="text-slate-400 font-semibold text-sm mt-3 px-4 leading-snug">
                  Your sets assemble into an active investment portfolio. Live appreciation, cost-basis, and total return.
                </p>
              </div>

              {/* Phone Mockup Dashboard */}
              <div className="w-[230px] h-[370px] bg-[#161B26] border-[6px] border-[#2A303F] rounded-[38px] relative overflow-hidden shadow-2xl flex flex-col p-2 my-4 justify-between">
                {/* Phone Notch */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-[#2A303F] rounded-full z-30" />
                
                {/* Content background */}
                <div className="absolute inset-0 bg-[#0A0D14]" />

                {/* Dashboard layout */}
                <div className="relative z-10 flex-1 flex flex-col pt-6 px-1.5 justify-between">
                  {/* Title card */}
                  <div>
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">PORTFOLIO BALANCE</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono text-xl font-black text-white leading-none">$18,740</span>
                      <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm animate-pulse">
                        <TrendingUp className="w-2.5 h-2.5" />
                        +4.2%
                      </span>
                    </div>
                  </div>

                  {/* Seeded cards list */}
                  <div className="flex-1 flex flex-col gap-1.5 justify-center py-2">
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block text-left">RECENT GAINERS</span>
                    
                    {/* Item Row 1 */}
                    <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-xl">
                      <img src="https://cdn.rebrickable.com/media/sets/10270-1.jpg" className="w-7 h-7 rounded-md object-cover" alt="Bookshop" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] font-black text-white truncate leading-tight">Creator Bookshop</div>
                        <div className="text-[7px] font-bold text-slate-500 truncate leading-none">10270 • $1,200</div>
                      </div>
                      <span className="font-mono text-[9px] font-black text-emerald-400 leading-none">+25%</span>
                    </div>

                    {/* Item Row 2 */}
                    <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-xl">
                      <img src="https://cdn.rebrickable.com/media/sets/75292-1.jpg" className="w-7 h-7 rounded-md object-cover" alt="Razor Crest" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] font-black text-white truncate leading-tight">Star Wars Crest</div>
                        <div className="text-[7px] font-bold text-slate-500 truncate leading-none">75292 • $1,700</div>
                      </div>
                      <span className="font-mono text-[9px] font-black text-[#C9A84C] leading-none">+12%</span>
                    </div>

                    {/* Item Row 3 */}
                    <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-xl opacity-60">
                      <img src="https://cdn.rebrickable.com/media/sets/42083-1.jpg" className="w-7 h-7 rounded-md object-cover" alt="Bugatti" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] font-black text-white truncate leading-tight">Bugatti Chiron</div>
                        <div className="text-[7px] font-bold text-slate-500 truncate leading-none">42083 • $800</div>
                      </div>
                      <span className="font-mono text-[9px] font-black text-slate-400 leading-none">0.0%</span>
                    </div>
                  </div>

                  {/* Graph preview */}
                  <div className="h-10 bg-[#C9A84C]/5 border border-[#C9A84C]/10 rounded-xl flex items-center justify-center p-1.5">
                    <svg viewBox="0 0 100 30" className="w-full h-full stroke-[#C9A84C]" fill="none" strokeWidth="2">
                      <path d="M0,25 C20,25 40,15 60,18 C80,21 90,5 100,2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="w-full text-center mt-2 px-4">
                <span className="text-xs text-slate-500 font-bold">Discover our gamification leaderboard next</span>
              </div>
            </div>
          )}

          {/* SLIDE 4: Fun Leaderboard Preview (Stickiness Booster) */}
          {currentSlide === 3 && (
            <div className="w-full flex-1 flex flex-col justify-between items-center py-2 animate-in slide-in-from-right-12 duration-500">
              <div className="text-center w-full mt-2">
                <h1 className="text-3xl font-black tracking-tight leading-[1.1] text-white">
                  LEGO <span className="text-[#C9A84C]">Value Kings</span>
                </h1>
                <p className="text-slate-400 font-semibold text-sm mt-3 px-4 leading-snug">
                  See how you rank among serious collectors worldwide. Rotates categories weekly for ultimate bragging rights.
                </p>
              </div>

              {/* Phone Mockup Leaderboard */}
              <div className="w-[230px] h-[370px] bg-[#161B26] border-[6px] border-[#2A303F] rounded-[38px] relative overflow-hidden shadow-2xl flex flex-col p-2 my-4 justify-between">
                {/* Phone Notch */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-[#2A303F] rounded-full z-30" />
                
                {/* Content background */}
                <div className="absolute inset-0 bg-[#0A0D14]" />

                {/* Dashboard layout */}
                <div className="relative z-10 flex-1 flex flex-col pt-6 px-1.5 justify-between">
                  <div>
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">LEADERBOARD TOP</span>
                    <h2 className="font-sans font-black text-sm text-[#C9A84C] mt-0.5">LEGO VALUE KINGS</h2>
                  </div>

                  {/* Leaderboard Table */}
                  <div className="flex-1 flex flex-col gap-1 justify-center py-2">
                    {/* Rank 1 */}
                    <div className="flex items-center gap-2 p-1.5 bg-[#C9A84C]/5 border border-[#C9A84C]/25 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-[#C9A84C] text-[#0D111A] text-[6px] font-black px-1.5 py-0.5 rounded-bl-lg uppercase tracking-wide">#1 Gainer</div>
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#C9A84C] to-yellow-300 flex items-center justify-center font-black text-[9px] text-[#0D111A]">1</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] font-black text-white truncate leading-tight">BrickBaron87</div>
                        <div className="text-[6px] font-semibold text-slate-500 leading-none">Rarity Score: 98</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[8px] font-black text-[#C9A84C]">$12,450</div>
                        <div className="font-mono text-[6px] font-bold text-emerald-400">+5.2%</div>
                      </div>
                    </div>

                    {/* Rank 2 */}
                    <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center font-black text-[9px] text-[#0D111A]">2</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] font-black text-white truncate leading-tight">ModularMaster42</div>
                        <div className="text-[6px] font-semibold text-slate-500 leading-none">Rarity Score: 94</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[8px] font-black text-white">$12,450</div>
                        <div className="font-mono text-[6px] font-bold text-emerald-400">+5.2%</div>
                      </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-amber-700 flex items-center justify-center font-black text-[9px] text-white">3</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] font-black text-white truncate leading-tight">MiniFigureFanatic</div>
                        <div className="text-[6px] font-semibold text-slate-500 leading-none">Rarity Score: 89</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[8px] font-black text-white">$10,230</div>
                        <div className="font-mono text-[6px] font-bold text-emerald-400">+1.2%</div>
                      </div>
                    </div>
                  </div>

                  {/* Foot badge */}
                  <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-center">
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">YOUR POSITION</span>
                    <span className="text-[8px] text-white font-bold block mt-0.5">Beat the average collector to enter Top 10</span>
                  </div>
                </div>
              </div>

              <div className="w-full text-center mt-2 px-4">
                <span className="text-xs text-slate-500 font-bold">One slide remaining to start scanning</span>
              </div>
            </div>
          )}

          {/* SLIDE 5: Final Trial Push */}
          {currentSlide === 4 && (
            <div className="w-full flex-1 flex flex-col justify-between items-center py-2 animate-in zoom-in-95 duration-500">
              <div className="text-center w-full mt-2">
                <h1 className="text-3xl font-black tracking-tight leading-[1.1] text-white">
                  Discover Your Collection's <br />
                  <span className="text-[#C9A84C]">True Value Today</span>
                </h1>
                <p className="text-slate-400 font-semibold text-sm mt-3 px-4 leading-snug">
                  Join serious collectors. Start scanning and build your portfolio now.
                </p>
              </div>

              {/* High-Impact Glass Card */}
              <div className="w-full bg-[#161B26]/80 border-2 border-white/5 rounded-3xl p-6 relative overflow-hidden my-4 shadow-xl">
                {/* Confetti icon absolute placement */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#C9A84C]/10 rounded-full flex items-center justify-center blur-md" />
                
                <h2 className="text-xl font-black text-[#C9A84C] mb-4">HelloBrick Premium</h2>
                
                <ul className="space-y-3.5 mb-2">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-emerald-400" strokeWidth={3} />
                    </div>
                    <span className="text-slate-200 text-sm font-semibold">⚡ **Unlimited instant AI scanning**</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-emerald-400" strokeWidth={3} />
                    </div>
                    <span className="text-slate-200 text-sm font-semibold">📈 **Live BrickEconomy price index**</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-[#C9A84C]" strokeWidth={3} />
                    </div>
                    <span className="text-slate-200 text-sm font-semibold">🏆 **LEGO Value Kings leaderboard**</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-[#C9A84C]" strokeWidth={3} />
                    </div>
                    <span className="text-slate-200 text-sm font-semibold">🔒 **Secure cloud portfolio vault**</span>
                  </li>
                </ul>
              </div>

              <div className="w-full text-center mt-2 px-4">
                <span className="text-xs text-slate-500 font-bold">14 days free • Cancel anytime in settings</span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Dot Indicators Footer */}
      <div className="pb-4 flex flex-col items-center justify-end shrink-0 gap-4 relative z-20">
        
        {/* Carousel pagination dots */}
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-[#C9A84C]' : 'w-2 bg-white/20'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* CTA Button at the bottom */}
        <div className="w-full max-w-sm px-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E5C158] text-[#0D111A] py-5 rounded-[24px] font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group border border-yellow-300/30"
          >
            {currentSlide === 4 ? (
              <>
                Start 14-Day Free Trial
                <Zap className="w-5 h-5 fill-current animate-pulse text-[#0D111A]" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
