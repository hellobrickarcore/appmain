import React from 'react';
import { Camera, Database, Lightbulb, ShieldCheck, Download, ChevronRight, Sparkles, Trophy, Users } from 'lucide-react';
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

const BlogCard = ({ category, title, date }: { category: string, title: string, date: string }) => (
  <div className="p-8 rounded-[2rem] bg-brand-navy-light border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-4">{category}</div>
    <h4 className="text-xl font-black text-white mb-6 group-hover:text-brand-yellow transition-colors leading-tight">{title}</h4>
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">{date}</span>
      <ChevronRight className="w-4 h-4 text-brand-text-dim group-hover:translate-x-1 transition-transform" />
    </div>
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
            <a href="#how-it-works" className="text-xs font-bold text-brand-text-dim hover:text-white uppercase tracking-widest transition-colors">How it works</a>
            <Link to="/blog" className="text-xs font-bold text-brand-text-dim hover:text-white uppercase tracking-widest transition-colors">Blog</Link>
            <a href="#community" className="text-xs font-bold text-brand-text-dim hover:text-white uppercase tracking-widest transition-colors">Community</a>
          </div>

          <button className="px-6 py-2.5 rounded-full bg-white/5 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">
            Download
          </button>
        </div>
      </nav>

      <main>
        {/* SECTION 1 - HERO */}
        <section className="relative pt-40 pb-20 overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-orange/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-white/5 rounded-full border border-white/10 animate-fade-in">
                <Sparkles className="w-4 h-4 text-brand-yellow" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Your Modern Brick Companion</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tighter uppercase">
                Sort your bricks. <br />
                <span className="text-brand-orange">Build more</span> <br />
                with what you have.
              </h1>
              
              <p className="text-xl text-brand-text-dim max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Turn loose bricks into an organized collection, smarter build ideas, and a better way to create with what you already own.
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
                className="transform rotate-2 hover:rotate-0 transition-all duration-700" 
                glow={true} 
              />
              <div className="absolute -bottom-6 -left-6 glass p-6 rounded-[2rem] border-brand-orange/20 animate-float">
                <div className="text-3xl font-black text-brand-yellow font-display">VAULT</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Collection Ready</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 - CORE BENEFITS */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Camera}
              title="Scan Bricks"
              description="Find and sort pieces in seconds. Turn loose bricks into a usable collection without manual logging."
              color="bg-brand-orange"
            />
            <FeatureCard 
              icon={Database}
              title="Build your collection"
              description="Keep track of what's in your vault. Every scan adds to a growing inventory you can actually build from."
              color="bg-brand-yellow"
            />
            <FeatureCard 
              icon={Lightbulb}
              title="Get build ideas"
              description="Discover builds that fit what you own. HelloBrick suggests ideas based on your real brick mix."
              color="bg-blue-500"
            />
          </div>
        </section>

        {/* SECTION 3 - APP SHOWCASE */}
        <section id="how-it-works" className="relative py-32 bg-brand-navy-light/30 border-y border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl sm:text-6xl font-black uppercase">Your Personal <span className="text-brand-yellow">Brick Vault</span></h2>
              <p className="text-xl text-brand-text-dim max-w-2xl mx-auto font-medium">From loose piles to build-ready collections. Keep track of every piece.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div className="space-y-4 mt-12">
                <PhoneMockup src="/screens/welcome.png" className="scale-90 opacity-80 hover:scale-100 hover:opacity-100 transition-all" />
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Connect</p>
              </div>
              <div className="space-y-4">
                <PhoneMockup src="/screens/onboarding_scan_bg_1773682593724.png" className="hover:scale-105 transition-all shadow-hover-orange" glow={true} />
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-brand-orange">Smart Detection</p>
              </div>
              <div className="space-y-4 mt-8">
                <PhoneMockup src="/screens/paywall.png" className="scale-95 opacity-90 hover:scale-100 hover:opacity-100 transition-all" />
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Pro Access</p>
              </div>
              <div className="space-y-4 mt-4">
                <PhoneMockup src="/screens/train.png" className="scale-95 opacity-90 hover:scale-100 hover:opacity-100 transition-all" />
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Community Lab</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 - COMMUNITY LAB */}
        <section id="community" className="max-w-7xl mx-auto px-6 py-40">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10">
              <h2 className="text-4xl sm:text-6xl font-black leading-tight uppercase">Built with the <br /><span className="text-brand-yellow">Community</span></h2>
              <p className="text-xl text-brand-text-dim font-medium leading-relaxed">
                HelloBrick goes beyond pile scanning. It helps brick owners organize what they have, discover what to build next, and improve the experience over time.
              </p>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-navy-light flex items-center justify-center flex-shrink-0 border border-white/10">
                    <Users className="w-6 h-6 text-brand-orange" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black mb-2 italic">Help Verify Bricks</h4>
                    <p className="text-brand-text-dim font-medium">Verify parts, upload examples, and earn progress. The more the community contributes, the smarter HelloBrick gets.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-navy-light flex items-center justify-center flex-shrink-0 border border-white/10">
                    <Trophy className="w-6 h-6 text-brand-yellow" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black mb-2 italic">Challenges & Progress</h4>
                    <p className="text-brand-text-dim font-medium">Earn XP, stay active, and make building feel more rewarding with daily quests and community milestones.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-brand-navy-light p-12 rounded-[4rem] border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 blur-3xl rounded-full" />
               <div className="relative z-10 space-y-8">
                  <div className="text-6xl font-black text-white/10 select-none">COMMUNITY LAB.</div>
                  <div className="bg-brand-navy/50 p-8 rounded-[2rem] border border-white/5">
                     <p className="text-2xl font-bold leading-relaxed italic text-white/80 mb-6">
                       "HelloBrick is not just for spotting bricks in a pile. It’s for organizing what you own and turning that into builds and progress."
                     </p>
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center font-black text-brand-navy text-xs">HB</div>
                       <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Product Mission</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 - BLOG PREVIEW */}
        <section id="blog" className="py-32 bg-brand-navy-light/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-black uppercase tracking-tight">More tips for <br /><span className="text-brand-orange">Builders</span></h2>
                <p className="text-brand-text-dim text-lg font-medium max-w-md">Explore guides on sorting, scanning, organizing and building with loose bricks.</p>
              </div>
              <Link to="/blog" className="px-8 py-3 rounded-full bg-white/5 text-white text-xs font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
                View All Guides
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <BlogCard 
                category="Sorting & Scanning"
                title="How to organize loose bricks without sorting for hours"
                date="Mar 19, 2026"
              />
              <BlogCard 
                category="Build Ideas"
                title="What to build with random bricks you already own"
                date="Mar 17, 2026"
              />
              <BlogCard 
                category="Collection Tips"
                title="How to track your brick collection digitally"
                date="Mar 15, 2026"
              />
            </div>
          </div>
        </section>

        {/* SECTION 6 - FINAL CTA */}
        <section className="max-w-7xl mx-auto px-6 py-40">
          <div className="bg-gradient-to-br from-brand-orange via-brand-orange to-red-600 p-1 rounded-[4rem]">
            <div className="bg-brand-navy rounded-[3.9rem] p-12 sm:p-24 text-center space-y-10 relative overflow-hidden">
               <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
               
               <h2 className="text-5xl sm:text-7xl font-black leading-none uppercase relative z-10">Sort your bricks. <br /> Build more.</h2>
               <p className="text-xl text-brand-text-dim max-w-xl mx-auto font-medium relative z-10 italic">Join thousands of builders already using HelloBrick to build their personal brick vault.</p>
               
               <div className="flex flex-col items-center gap-6 relative z-10">
                  <AppStoreBadge />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Now available on iOS</p>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <Logo size="md" className="justify-center" />
          <div className="flex justify-center gap-10 text-[10px] font-black uppercase tracking-widest text-brand-text-dim">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/support" className="hover:text-white">Support</Link>
          </div>
          <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] max-w-lg mx-auto leading-relaxed">
            Hellobrick is an independent companion platform. LEGO is a trademark of the LEGO Group.
          </p>
        </div>
      </footer>
    </div>
  );
};
