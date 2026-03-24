import React from 'react';
import { Camera, Database, Lightbulb, ShieldCheck, Download, ChevronRight, Apple, ArrowRight, Play, CheckCircle2, Globe, GraduationCap, Building2, Layout } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';

const AppStoreButton = ({ primary = false }) => (
  <button className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all group shadow-2xl active:scale-95 ${primary ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white border border-white/10 hover:bg-slate-900'}`}>
    <Apple className="w-8 h-8 fill-current" />
    <div className="text-left leading-tight">
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Download on the</div>
      <div className="text-xl font-black">App Store</div>
    </div>
  </button>
);

const BenefitCard = ({ title, description, icon: Icon }: { title: string, description: string, icon: any }) => (
  <div className="p-10 rounded-[40px] bg-brand-navy-light/40 border border-white/5 hover:border-brand-orange/20 transition-all group">
    <div className="w-16 h-16 rounded-[20px] bg-brand-orange/10 flex items-center justify-center mb-8 border border-brand-orange/20 group-hover:scale-110 transition-transform">
      <Icon className="w-8 h-8 text-brand-orange" />
    </div>
    <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">{title}</h3>
    <p className="text-brand-text-dim leading-relaxed font-bold text-sm uppercase tracking-wide opacity-80">{description}</p>
  </div>
);

const ShowcaseSection = ({ title, description, image, align = 'left', annotations = [] }: { title: string, description: string, image: string, align?: 'left' | 'right', annotations?: string[] }) => (
  <div className={`flex flex-col ${align === 'right' ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-32 py-24`}>
    <div className="flex-1 space-y-8">
      <h2 className="text-4xl sm:text-6xl font-black uppercase leading-[0.9] tracking-tighter">{title}</h2>
      <p className="text-xl text-brand-text-dim font-medium leading-relaxed max-w-xl">{description}</p>
      <ul className="space-y-4 pt-4">
        {annotations.map((note, i) => (
          <li key={i} className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-white/50">
            <CheckCircle2 className="w-5 h-5 text-brand-orange" />
            {note}
          </li>
        ))}
      </ul>
    </div>
    <div className="flex-1 relative group">
       <div className="absolute inset-0 bg-brand-orange/5 blur-[120px] rounded-full group-hover:opacity-100 transition-opacity" />
       <img src={image} alt={title} className="w-full max-w-[500px] mx-auto relative z-10 transition-transform duration-1000 group-hover:scale-105" />
    </div>
  </div>
);

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-navy text-white font-sans selection:bg-brand-orange selection:text-white">
      {/* Tight Header */}
      <nav className="fixed top-0 z-50 w-full bg-brand-navy/90 backdrop-blur-2xl border-b border-white/5 h-24 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <Logo size="md" light={true} />
          
          <div className="hidden lg:flex items-center gap-12">
            <a href="#how-it-works" className="text-[10px] font-black text-brand-text-dim hover:text-white uppercase tracking-[0.2em] transition-colors">How it works</a>
            <a href="#features" className="text-[10px] font-black text-brand-text-dim hover:text-white uppercase tracking-[0.2em] transition-colors">Features</a>
            <a href="#business" className="text-[10px] font-black text-brand-text-dim hover:text-white uppercase tracking-[0.2em] transition-colors">Businesses</a>
            <Link to="/blog" className="text-[10px] font-black text-brand-text-dim hover:text-white uppercase tracking-[0.2em] transition-colors">Blog</Link>
          </div>

          <div className="flex items-center gap-6">
            <AppStoreButton primary={false} />
          </div>
        </div>
      </nav>

      <main>
        {/* SECTION 1 - HERO */}
        <section className="relative pt-48 pb-32 overflow-hidden">
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-orange/5 blur-[150px] rounded-full pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
            <div className="space-y-6 max-w-4xl mx-auto">
              <h1 className="text-6xl sm:text-8xl xl:text-9xl font-black leading-[0.85] tracking-tighter uppercase mb-2">
                Sort your bricks. <br />
                <span className="text-brand-orange">Build more.</span>
              </h1>
              <p className="text-xl sm:text-3xl text-brand-text-dim font-medium max-w-2xl mx-auto leading-relaxed">
                Scan your loose bricks, save what you own, and get build ideas based on your collection.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <AppStoreButton primary={true} />
              <button className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all py-4 px-8 border border-white/5 rounded-2xl hover:bg-white/5">
                <Play className="w-4 h-4" /> Watch Product Tour
              </button>
            </div>

            {/* Hero Mockups Container (Stacked iPhones Style) */}
            <div className="relative pt-20 flex justify-center items-end max-w-5xl mx-auto pointer-events-none">
                <img src="/mockups/vault.png" className="w-[30%] -rotate-6 translate-x-12 translate-y-8 z-10 brightness-75 scale-90" alt="Vault" />
                <img src="/mockups/scanner.png" className="w-[45%] z-20 shadow-[0_50px_100px_rgba(0,0,0,0.8)]" alt="Scanner" />
                <img src="/mockups/ideas.png" className="w-[30%] rotate-6 -translate-x-12 translate-y-8 z-10 brightness-75 scale-90" alt="Ideas" />
            </div>
          </div>
        </section>

        {/* SECTION 2 - HOW IT WORKS STRIP */}
        <section id="how-it-works" className="bg-brand-navy-light/30 border-y border-white/5 py-12">
           <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full border border-brand-orange/30 flex items-center justify-center font-black text-brand-orange">1</div>
                    <div>
                       <h4 className="text-sm font-black uppercase tracking-widest text-white">Scan your bricks</h4>
                       <p className="text-[10px] font-bold text-brand-text-dim uppercase tracking-wide">Detect any piece in seconds</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full border border-brand-yellow/30 flex items-center justify-center font-black text-brand-yellow">2</div>
                    <div>
                       <h4 className="text-sm font-black uppercase tracking-widest text-white">Review your vault</h4>
                       <p className="text-[10px] font-bold text-brand-text-dim uppercase tracking-wide">Save what you have found</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center font-black text-blue-400">3</div>
                    <div>
                       <h4 className="text-sm font-black uppercase tracking-widest text-white">Get build ideas</h4>
                       <p className="text-[10px] font-bold text-brand-text-dim uppercase tracking-wide">Find MOCs that fit your bricks</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* SECTION 3 - OUTCOME BENEFITS */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-40">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <BenefitCard 
                title="Know what you own"
                description="Save scanned bricks into your vault so your pile becomes usable again."
                icon={Database}
              />
              <BenefitCard 
                title="Find ideas faster"
                description="Get build suggestions based on the bricks already in your vault."
                icon={Lightbulb}
              />
              <BenefitCard 
                title="Unified Progress"
                description="Every scan improves your level, earns XP, and unlocks new MOC tiers."
                icon={Trophy}
              />
              <BenefitCard 
                title="Make it useful"
                description="Turn random leftover pieces into something worth building."
                icon={Layout}
              />
           </div>
        </section>

        {/* SECTION 4 - PRODUCT SHOWCASE (Scanner/Vault/Ideas) */}
        <section className="bg-brand-navy-light/20 py-20 border-y border-white/5">
           <div className="max-w-7xl mx-auto px-6">
              <ShowcaseSection 
                title="Scanner"
                description="HelloBrick helps you identify pieces in any mix. From random bins to legacy sets, our scanner picks out parts for your digital vault."
                image="/mockups/scanner.png"
                annotations={["Real-time part identification", "High-accuracy detection", "Adaptive lighting support"]}
              />
              <ShowcaseSection 
                title="The Vault"
                description="Once saved, your collection stays with you. Track your inventory across devices and never lose track of a rare part again."
                image="/mockups/vault.png"
                align="right"
                annotations={["Digital inventory management", "Progressive XP system", "Global builder rankings"]}
              />
              <ShowcaseSection 
                title="Build Ideas"
                description="Don't just collect—create. HelloBrick suggests models you can actually build from the bricks already in your vault."
                image="/mockups/ideas.png"
                annotations={["LEGO-only build suggestions", "Step-by-step instructions", "Difficulty level matching"]}
              />
           </div>
        </section>

        {/* SECTION 5 - BUSINESS / EDUCATION */}
        <section id="business" className="max-w-7xl mx-auto px-6 py-40">
           <div className="p-12 sm:p-24 rounded-[60px] bg-gradient-to-br from-brand-navy-light to-brand-navy border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                 <Building2 className="w-64 h-64 text-brand-orange" />
              </div>
              <div className="relative z-10 max-w-2xl space-y-10">
                 <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none">HelloBrick for <br /><span className="text-brand-yellow">Businesses & Schools</span></h2>
                 <p className="text-xl text-brand-text-dim font-medium leading-relaxed">
                   A simpler way to run brick-based activities at scale. From summer camps to retail activations, we help groups organize and engage.
                 </p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="flex gap-4">
                       <GraduationCap className="w-8 h-8 text-brand-orange flex-shrink-0" />
                       <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Schools & Workshops</div>
                    </div>
                    <div className="flex gap-4">
                       <Globe className="w-8 h-8 text-brand-orange flex-shrink-0" />
                       <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Events & Retail</div>
                    </div>
                 </div>
                 <button className="h-16 px-10 bg-white text-brand-navy rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-orange hover:text-white transition-all">
                    Enquire for business use
                 </button>
              </div>
           </div>
        </section>

        {/* SECTION 6 - FINAL CTA */}
        <section className="max-w-7xl mx-auto px-6 py-40 text-center space-y-12">
           <h2 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-none">Sort your bricks. <br /> Build more today.</h2>
           <p className="text-xl text-brand-text-dim max-w-xl mx-auto font-medium italic select-none opacity-40">HelloBrick helps you make more use of the bricks you already own.</p>
           <div className="flex justify-center">
              <AppStoreButton primary={true} />
           </div>
        </section>
      </main>

      <footer className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20 text-center md:text-left">
             <Logo size="md" light={true} />
             <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim">
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
                <Link to="/support" className="hover:text-white transition-colors">Support</Link>
                <Link to="/business" className="hover:text-white transition-colors">Business</Link>
             </div>
          </div>
          <p className="text-center text-[9px] text-white/10 font-black uppercase tracking-[0.5em] leading-relaxed max-w-2xl mx-auto">
             HelloBrick is an independent companion platform. LEGO is a trademark of the LEGO Group.
          </p>
        </div>
      </footer>
    </div>
  );
};
