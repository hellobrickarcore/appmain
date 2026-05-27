import * as React from 'react';
import { 
  Crown, 
  Search, 
  Settings, 
  ChevronRight, 
  ArrowUpRight, 
  Layers,
  ShoppingBag,
  TrendingUp,
  User,
  Star,
  Award,
  Compass
} from 'lucide-react';
import { Screen } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D111A] font-sans text-white relative overflow-hidden select-none">
      {/* Background spotlights */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-[#C9A84C]/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/[0.03] blur-[100px] rounded-full pointer-events-none" />

      {/* Sticky Header */}
      <div className="relative z-50 px-6 pt-[max(env(safe-area-inset-top),3.5rem)] pb-4 flex items-center justify-between bg-[#0D111A]/85 backdrop-blur-xl border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#C9A84C] to-[#E5C158] flex items-center justify-center shadow-lg">
            <Layers className="w-4 h-4 text-[#0D111A]" strokeWidth={2.5} />
          </div>
          <span className="font-sans font-black text-lg tracking-wider text-white">
            HELLO<span className="text-[#C9A84C]">BRICK</span>
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate(Screen.LEGO_MAP)}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
          >
            <Compass className="w-4 h-4 text-slate-300" />
          </button>
          <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto no-scrollbar pb-36 pt-4 px-6 space-y-6">
          
          {/* Dashboard Header */}
          <div className="flex justify-between items-center text-left">
            <div>
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">VAULT INTELLIGENCE</span>
              <h2 className="text-2xl font-black text-white mt-0.5 tracking-tight uppercase">DASHMIARY</h2>
            </div>
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">
              Recouce
            </button>
          </div>

          {/* 6-Card Values Summary Grid (exactly matching image 7) */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Card 1: Yellow Most Wanted */}
            <div 
              onClick={() => onNavigate(Screen.WISHLIST)}
              className="bg-gradient-to-tr from-[#C9A84C] to-[#E5C158] p-5 rounded-[28px] flex flex-col items-start justify-between min-h-[125px] active:scale-[0.98] transition-all shadow-xl text-left cursor-pointer border border-transparent"
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-[8px] font-black text-[#0D111A] uppercase tracking-widest">MOST WANTED</span>
                <span className="text-base">🧸</span>
              </div>
              <div className="font-mono text-2xl font-black text-[#0D111A] leading-none mt-4">609</div>
            </div>

            {/* Card 2: Your Collection */}
            <div 
              onClick={() => onNavigate(Screen.COLLECTION)}
              className="bg-[#161B26] border border-white/5 p-5 rounded-[28px] flex flex-col items-start justify-between min-h-[125px] active:scale-[0.98] transition-all shadow-xl text-left cursor-pointer"
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">YOUR COLLECTION</span>
                <span className="text-base">🏰</span>
              </div>
              <div className="font-mono text-2xl font-black text-white leading-none mt-4">1:25</div>
            </div>

            {/* Card 3: Lego VDOAD */}
            <div className="bg-[#161B26] border border-white/5 p-5 rounded-[28px] flex flex-col items-start justify-between min-h-[125px] text-left">
              <div className="flex justify-between items-start w-full">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">LEGO VDOAD</span>
                <span className="text-base">🏎️</span>
              </div>
              <div className="font-mono text-2xl font-black text-white leading-none mt-4">1.03</div>
            </div>

            {/* Card 4: Lego */}
            <div className="bg-[#161B26] border border-white/5 p-5 rounded-[28px] flex flex-col items-start justify-between min-h-[125px] text-left">
              <div className="flex justify-between items-start w-full">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">LEGO</span>
                <span className="text-base">🗓️</span>
              </div>
              <div className="font-mono text-2xl font-black text-white leading-none mt-4">4.30</div>
            </div>

            {/* Card 5: Marketplace */}
            <div className="bg-[#161B26] border border-white/5 p-5 rounded-[28px] flex flex-col items-start justify-between min-h-[125px] text-left">
              <div className="flex justify-between items-start w-full">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">MARKETPLACE</span>
                <span className="text-base">🧑‍🚒</span>
              </div>
              <div className="font-mono text-2xl font-black text-white leading-none mt-4">11</div>
            </div>

            {/* Card 6: Marketplace */}
            <div className="bg-[#161B26] border border-white/5 p-5 rounded-[28px] flex flex-col items-start justify-between min-h-[125px] text-left">
              <div className="flex justify-between items-start w-full">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">MARKETPLACE</span>
                <span className="text-base">🏗️</span>
              </div>
              <div className="font-mono text-2xl font-black text-white leading-none mt-4">279</div>
            </div>

          </div>

          {/* LEGO Value Kings widget (matching image 7 standings) */}
          <div className="bg-[#161B26] border border-white/5 rounded-[32px] p-5 shadow-xl text-left">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">STANDINGS</span>
                <h3 className="text-sm font-black text-white mt-0.5">LEGO Value Kings</h3>
              </div>
              <button 
                onClick={() => onNavigate(Screen.LEADERBOARD)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-wider flex items-center gap-1 text-slate-400"
              >
                1h <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {/* Leader #1 */}
              <div className="flex items-center justify-between p-2.5 bg-[#C9A84C]/5 border border-[#C9A84C]/25 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] font-black text-[#C9A84C]">#1</span>
                  <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Lello" className="w-full h-full p-0.5" alt="Lello" />
                  </div>
                  <span className="text-xs font-black text-white">LelloBrick</span>
                </div>
                <span className="font-mono text-xs font-black text-[#C9A84C]">#6.428</span>
              </div>

              {/* Leader #2 */}
              <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] font-black text-slate-600">#2</span>
                  <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Cani" className="w-full h-full p-0.5" alt="Cani" />
                  </div>
                  <span className="text-xs font-black text-white">Cani Kilt</span>
                </div>
                <span className="font-mono text-xs font-black text-slate-400">#3.366</span>
              </div>

              {/* Leader #3 */}
              <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] font-black text-slate-600">#3</span>
                  <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Kayay" className="w-full h-full p-0.5" alt="Kayay" />
                  </div>
                  <span className="text-xs font-black text-white">Kayay Minini</span>
                </div>
                <span className="font-mono text-xs font-black text-slate-400">#6.014</span>
              </div>

              {/* Leader #4 */}
              <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] font-black text-slate-600">#3</span>
                  <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Hello" className="w-full h-full p-0.5" alt="Hello" />
                  </div>
                  <span className="text-xs font-black text-white">HelloBrick</span>
                </div>
                <span className="font-mono text-xs font-black text-slate-400">#9.030</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
