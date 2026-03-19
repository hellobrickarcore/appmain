import React from 'react';
import { Camera, Database, Lightbulb, ShieldCheck, Download, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import { PhoneMockup } from '../components/PhoneMockup';

const AppStoreBadge = () => (
  <button className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-2xl hover:bg-white/90 transition-all group shadow-xl hover:shadow-brand-orange/20">
    <Download className="w-6 h-6" />
    <div className="text-left">
      <div className="text-[10px] font-bold uppercase leading-tight opacity-60">Download on the</div>
      <div className="text-lg font-extrabold leading-tight">App Store</div>
    </div>
  </button>
);

const FeatureCard = ({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) => (
  <div className="p-8 rounded-[2.5rem] bg-brand-navy-light border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 group">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-2xl ${color}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-brand-text-dim leading-relaxed font-medium">{description}</p>
  </div>
);

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-navy text-white font-sans selection:bg-brand-orange selection:text-white">
      {/* Premium Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-brand-navy/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size="md" light={true} />
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-xs font-bold text-brand-text-dim hover:text-white uppercase tracking-widest transition-colors">Features</a>
            <a href="#showcase" className="text-xs font-bold text-brand-text-dim hover:text-white uppercase tracking-widest transition-colors">Showcase</a>
            <a href="#about" className="text-xs font-bold text-brand-text-dim hover:text-white uppercase tracking-widest transition-colors">About</a>
          </div>

          <button className="px-6 py-2.5 rounded-full bg-white/5 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">
            Get App
          </button>
        </div>
      </nav>

      <main>
        {/* SECTION 1 - HERO */}
        <section className="relative pt-40 pb-20 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-orange/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -top-40 right-0 w-[400px] h-[400px] bg-brand-yellow/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange/10 rounded-full border border-brand-orange/20 animate-fade-in">
                <Sparkles className="w-4 h-4 text-brand-orange" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">AI-Powered Detection</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tighter">
                SORT YOUR BRICKS. <br />
                <span className="text-brand-orange">DISCOVER</span> <br />
                WHAT TO BUILD.
              </h1>
              
              <p className="text-xl text-brand-text-dim max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                HelloBrick identifies your collection in real-time, matching what you have to thousands of building ideas. No more hunting for parts.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4">
                <AppStoreBadge />
                <button className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white hover:text-brand-orange transition-colors group">
                  Watch Demo <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="flex-1 relative">
              <PhoneMockup 
                src="/screens/onboarding_scan_bg_1773682593724.png" 
                className="transform rotate-3 hover:rotate-0 transition-all duration-700" 
                glow={true} 
              />
              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -left-6 glass p-6 rounded-[2rem] border-brand-orange/20 animate-float">
                <div className="text-3xl font-black text-brand-yellow font-display">0.2s</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Recognition Speed</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 - CORE FEATURES */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Camera}
              title="Scan Bricks Fast"
              description="Identify hundreds of parts in seconds. Our AI-powered scanner handles plates, bricks, and technic with sub-millimeter precision."
              color="bg-brand-orange"
            />
            <FeatureCard 
              icon={Database}
              title="Your Digital Vault"
              description="Automatically catalog your entire collection. Search by color, part number, or condition across all your devices."
              color="bg-brand-yellow"
            />
            <FeatureCard 
              icon={Lightbulb}
              title="Endless Ideas"
              description="Discover new builds based exactly on the parts you own. Follow high-fidelity step-by-step 3D instructions."
              color="bg-blue-500"
            />
          </div>
        </section>

        {/* SECTION 3 - APP SHOWCASE */}
        <section id="showcase" className="relative py-32 bg-brand-navy-light/30 border-y border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl sm:text-6xl font-black">THE FULL <span className="text-brand-yellow">EXPERIENCE</span></h2>
              <p className="text-xl text-brand-text-dim max-w-2xl mx-auto font-medium">Playful, modern, and mobile-first. Designed for every builder.</p>
            </div>

            {/* Tight Showcase Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div className="space-y-4 mt-12">
                <PhoneMockup src="/screens/welcome.png" className="scale-90 opacity-80 hover:scale-100 hover:opacity-100 transition-all" />
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Welcome</p>
              </div>
              <div className="space-y-4">
                <PhoneMockup src="/screens/onboarding_scan_bg_1773682593724.png" className="hover:scale-105 transition-all shadow-hover-orange" glow={true} />
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-brand-orange">Real-time ID</p>
              </div>
              <div className="space-y-4 mt-8">
                <PhoneMockup src="/screens/paywall.png" className="scale-95 opacity-90 hover:scale-100 hover:opacity-100 transition-all" />
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Premium Access</p>
              </div>
              <div className="space-y-4 mt-4">
                <PhoneMockup src="/screens/train.png" className="scale-95 opacity-90 hover:scale-100 hover:opacity-100 transition-all" />
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-brand-text-dim">AI Training</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 - WHY HELLOBRICK */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-40">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10">
              <h2 className="text-4xl sm:text-6xl font-black leading-tight">BUILT FOR THE <br /><span className="text-brand-yellow">NEXT GENERATION</span> OF BUILDERS</h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-navy-light flex items-center justify-center flex-shrink-0 border border-white/10">
                    <ShieldCheck className="w-6 h-6 text-brand-orange" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black mb-2 italic">On-Device Privacy</h4>
                    <p className="text-brand-text-dim font-medium">All vision processing stays on your phone. Your private collection data remains yours.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-navy-light flex items-center justify-center flex-shrink-0 border border-white/10">
                    <Trophy className="w-6 h-6 text-brand-yellow" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black mb-2 italic">Community XP Loop</h4>
                    <p className="text-brand-text-dim font-medium">Earn experience points while you scan, helping to improve brick detection for everyone.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-brand-navy-light p-12 rounded-[4rem] border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 blur-3xl rounded-full" />
               <div className="relative z-10 space-y-6">
                  <div className="text-6xl font-black text-white/10 select-none">TRUSTED AI.</div>
                  <blockquote className="text-2xl font-bold leading-relaxed italic text-white/80">
                    "The scan speed is absolutely game-changing. It identified bricks in my bin that I'd forgotten I even had."
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center font-black text-brand-navy">AJ</div>
                    <div>
                      <div className="font-black text-sm uppercase tracking-widest">Master Builder</div>
                      <div className="text-brand-text-dim text-xs">Verified User</div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 - FINAL CTA */}
        <section className="max-w-7xl mx-auto px-6 pb-40">
          <div className="bg-gradient-to-br from-brand-orange via-brand-orange to-red-600 p-1 rounded-[4rem]">
            <div className="bg-brand-navy rounded-[3.9rem] p-12 sm:p-24 text-center space-y-10 relative overflow-hidden">
               {/* Background Texture */}
               <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
               
               <h2 className="text-5xl sm:text-7xl font-black leading-none uppercase relative z-10">THE FUTURE OF <br /> BUILDING IS HERE.</h2>
               <p className="text-xl text-brand-text-dim max-w-xl mx-auto font-medium relative z-10">Join thousands of builders already using HelloBrick to supercharge their collection.</p>
               
               <div className="flex flex-col items-center gap-6 relative z-10">
                  <AppStoreBadge />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Compatible with all iOS devices</p>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <Logo size="md" className="justify-center" />
          <div className="flex justify-center gap-10 text-[10px] font-black uppercase tracking-widest text-brand-text-dim transition-all">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/support" className="hover:text-white">Support</Link>
          </div>
          <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] max-w-lg mx-auto leading-relaxed">
            Hellobrick is an independent AI platform. LEGO is a trademark of the LEGO Group.
          </p>
        </div>
      </footer>
    </div>
  );
};
