import React from 'react';
import { LucideIcon, Camera, Database, Lightbulb, Users, ShieldCheck, Plus, ArrowRight, Download } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import { PhoneMockup } from '../components/PhoneMockup';

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
  detailTitle?: string;
  detailText?: string;
  screenSrc: string;
  reverse?: boolean;
}

const FeatureSection: React.FC<FeatureProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  detailTitle, 
  detailText,
  screenSrc,
  reverse = false 
}) => {
  return (
    <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24 py-24 border-b border-slate-100 last:border-0`}>
      <div className="flex-1 space-y-8">
        <div className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-slate-200 border border-slate-100 group transition-all hover:shadow-brand-orange/20">
          <Icon className="w-7 h-7 text-brand-orange group-hover:scale-110 transition-transform" />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight uppercase font-display">
            {title}
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed font-medium font-sans">
            {description}
          </p>
        </div>
        
        {detailTitle && (
          <div className="pt-8 border-t border-slate-100">
            <div className="flex items-start gap-5 p-6 bg-slate-50 rounded-[2rem] group hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-default">
              <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 text-brand-orange" />
              </div>
              <div>
                <h4 className="font-extrabold font-display text-slate-900 mb-1 uppercase text-sm tracking-wide">{detailTitle}</h4>
                <p className="text-base text-slate-500 font-sans leading-relaxed">{detailText}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 w-full flex justify-center">
        <PhoneMockup src={screenSrc} glow={!reverse} />
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-orange selection:text-white overflow-x-hidden">
      {/* Premium Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size="md" />

          <div className="hidden md:flex items-center gap-12">
            <a href="#scanner" className="text-xs font-black text-slate-500 hover:text-brand-orange uppercase tracking-[0.2em] transition-colors font-display">Scanner</a>
            <a href="#inventory" className="text-xs font-black text-slate-500 hover:text-brand-orange uppercase tracking-[0.2em] transition-colors font-display">Vault</a>
            <a href="#ideas" className="text-xs font-black text-slate-500 hover:text-brand-orange uppercase tracking-[0.2em] transition-colors font-display">Builds</a>
            <a href="#multiplayer" className="text-xs font-black text-slate-500 hover:text-brand-orange uppercase tracking-[0.2em] transition-colors font-display">Battle</a>
          </div>

          <button className="px-8 py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-brand-orange transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-xl shadow-slate-900/10 font-display">
            Download
          </button>
        </div>
      </nav>

      <main className="pt-32">
        {/* Dynamic Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pb-24 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-full border border-slate-100 mb-10 transform hover:scale-105 transition-transform cursor-default">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] font-black font-display text-slate-500 uppercase tracking-[0.2em]">v1.1.8 Smart ID Active</span>
          </div>
          
          <h1 className="text-6xl sm:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-slate-900 mb-10 uppercase font-display">
            Every Brick <br />
            <span className="text-brand-orange">Explained.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-500 max-w-3xl mx-auto mb-16 font-semibold leading-relaxed font-sans">
            Point your camera at a pile of bricks. Watch as HelloBrick identifies every single piece in real-time.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-24">
            <button className="flex items-center gap-5 bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] hover:bg-brand-orange transition-all duration-300 group shadow-2xl shadow-slate-900/10">
              <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-[11px] uppercase font-black opacity-50 tracking-widest font-display">Get the app</div>
                <div className="text-xl font-black leading-none font-display">App Store</div>
              </div>
            </button>
            <button className="flex items-center gap-5 bg-white border-2 border-slate-100 text-slate-900 px-10 py-5 rounded-[2.5rem] hover:border-brand-orange transition-all duration-300 shadow-xl shadow-slate-100">
              <ArrowRight className="w-6 h-6" />
              <div className="text-left">
                <div className="text-[11px] uppercase font-black opacity-50 tracking-widest text-slate-400 font-display">Join the</div>
                <div className="text-xl font-black leading-none text-brand-orange font-display">Beta Test</div>
              </div>
            </button>
          </div>

          <div className="relative">
             <PhoneMockup 
               src="/screens/onboarding_scan_bg_1773682593724.png" 
               className="transform -rotate-2 hover:rotate-0 transition-all duration-700 scale-110"
               glow
             />
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white px-10 py-5 rounded-[2rem] shadow-2xl border border-slate-100 hidden sm:block">
                <div className="text-4xl font-black text-slate-900 font-display tracking-tight uppercase">0.2s ID Speed</div>
             </div>
          </div>
        </section>

        {/* Feature Narrative */}
        <section id="scanner" className="max-w-7xl mx-auto px-6 py-20">
          <FeatureSection 
            icon={Camera}
            title="The AI Scanner"
            description="Our custom vision engine identifies bricks with sub-millimeter precision. From standard plates to the rarest Technic elements, nothing is missed."
            screenSrc="/screens/onboarding_scan_bg_1773682593724.png"
            detailTitle="Mass Part Tracking"
            detailText="Scan up to 200 items in a single frame. HelloBrick instantly catalogs color, shape, and condition."
          />

          <FeatureSection 
            icon={Database}
            title="Your Digital Vault"
            description="Turn your physical bins into a searchable digital collection. Sync across all your devices and never wonder what you own again."
            screenSrc="/screens/onboarding_vault_bg_1773682607010.png"
            reverse
            detailTitle="Smart Storage Sync"
            detailText="Assign storage bins digitally. When it's time to build, we'll tell you exactly which drawer to open."
          />

          <FeatureSection 
            icon={Lightbulb}
            title="Endless Builds"
            description="We compare your digital inventory against thousands of instructions to show you exactly what you can build with the bricks you already have."
            screenSrc="/screens/onboarding_ideas_bg_1773682621185.png"
            detailTitle="Visual Build Guides"
            detailText="Follow interactive 3D tutorials. The app highlights where your parts are so you can build at lightning speed."
          />

          <FeatureSection 
            icon={Users}
            title="Building Battles"
            description="Challenge the world. Join real-time building speedruns and head-to-head creative prompts. AI-verified for fair competition."
            screenSrc="/screens/ios_simulator_screenshot.png"
            reverse
            detailTitle="Global Rankings"
            detailText="Climb the Master Builder leaderboard. Earn XP for every build you complete and every brick you scan."
          />
        </section>

        {/* Brand/Security Section */}
        <section className="bg-slate-900 py-32 rounded-[4rem] mx-6 mb-24 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-orange/10 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-12 text-center relative z-10">
             <div className="w-20 h-20 bg-brand-orange rounded-3xl mx-auto flex items-center justify-center mb-10 shadow-3xl shadow-brand-orange/40">
                <ShieldCheck className="w-10 h-10 text-white" />
             </div>
             <h2 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tight mb-8 font-display">On-Device Security</h2>
             <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-16 leading-relaxed font-sans font-medium">
               Vision processing happens on your local hardware. Your private collection data is encrypted and stays under your control.
             </p>
             <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-full">
                <span className="w-3 h-3 bg-brand-orange rounded-full shadow-[0_0_15px_rgba(255,122,48,0.8)]" />
                <span className="text-xs font-black text-white uppercase tracking-[0.2em] italic font-display">Neural Engine: Local Mode Active</span>
             </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
            <div className="space-y-8 max-w-sm">
              <Logo size="lg" />
              <p className="text-lg text-slate-400 leading-relaxed font-medium">
                The definitive AI toolkit for building enthusiasts. Organize, discover, and build like never before.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 sm:gap-32">
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 font-display">Product</h4>
                <div className="flex flex-col gap-4 text-sm font-extrabold text-slate-400 transition-all font-sans">
                  <a href="#scanner" className="hover:text-brand-orange">Scanner</a>
                  <a href="#inventory" className="hover:text-brand-orange">Vault</a>
                  <a href="#ideas" className="hover:text-brand-orange">Builds</a>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 font-display">Legal</h4>
                <div className="flex flex-col gap-4 text-sm font-extrabold text-slate-400 transition-all font-sans">
                  <Link to="/privacy" className="hover:text-brand-orange">Privacy Policy</Link>
                  <Link to="/terms" className="hover:text-brand-orange">Terms of Service</Link>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 font-display">Support</h4>
                <div className="flex flex-col gap-4 text-sm font-extrabold text-slate-400 transition-all font-sans">
                  <Link to="/support" className="hover:text-brand-orange">Help Center</Link>
                  <a href="#" className="hover:text-brand-orange">Press Kit</a>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-16 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] font-display">
              Hellobrick is an independent AI platform. LEGO is a trademark of the LEGO Group.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
