import React from 'react';
import { Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SectionHero: React.FC = () => {
  return (
    <section className="w-full min-h-screen relative flex flex-col bg-brand-navy selection:bg-brand-orange selection:text-white">
        {/* Navigation / Header */}
        <header className="w-full max-w-[1440px] mx-auto h-24 flex items-center justify-between px-6 md:px-12 relative z-50">
          <Link to="/" className="hover:scale-105 transition-transform">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center text-black font-black rotate-[-3deg]">H</div>
               <span className="text-[20px] font-bold text-white tracking-tight">Hello<span className="text-brand-orange">Brick</span></span>
             </div>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-1.5 bg-brand-navy-light/80 backdrop-blur-xl p-1.5 rounded-full border border-white/5 shadow-2xl">
            <a href="#pricing" className="text-ui-body font-bold text-white bg-white/10 px-6 py-2.5 rounded-full transition-colors">Pricing</a>
            <Link to="/education" className="text-ui-body font-medium text-brand-text-dim hover:text-white px-6 py-2.5 rounded-full transition-colors">For classes</Link>
            <Link to="/blog" className="text-ui-body font-medium text-brand-text-dim hover:text-white px-6 py-2.5 rounded-full transition-colors">Blog</Link>
          </nav>
          
          <a href="https://apps.apple.com/us/app/hellobrick/id6760016096" target="_blank" rel="noopener noreferrer" className="bg-brand-yellow text-black px-7 py-3 rounded-xl font-bold text-ui-body hover:bg-white hover:scale-105 transition-all duration-300">
            Download app
          </a>
        </header>

        <main className="flex-1 w-full max-w-[1440px] mx-auto grid grid-cols-12 gap-8 px-12 items-center pb-12">
          {/* Phone Mockup Section */}
          <div className="col-span-12 lg:col-span-5 flex justify-center lg:justify-end pr-0 lg:pr-12 relative h-full items-center">
            <div className="w-[320px] h-[640px] bg-black rounded-[44px] border-[12px] border-brand-navy-light shadow-[0_30px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(255,122,48,0.2)] relative z-10 -rotate-2 hover:rotate-0 transition-transform duration-700 overflow-hidden flex flex-col group">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-brand-navy-light rounded-b-3xl z-30"></div>
              <div className="flex-1 relative bg-brand-navy-light overflow-hidden">
                <img src="/screens/welcome.png" alt="HelloBrick welcome" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent flex items-end p-8">
                  <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-ui-body font-bold text-brand-yellow mb-1">Scanning live</p>
                    <p className="text-ui-body font-bold text-white">433 Bricks identified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="col-span-12 lg:col-span-7 pl-0 lg:pl-12 relative z-10 flex flex-col justify-center text-center lg:text-left">
            <h1 className="font-black text-[4rem] md:text-ui-header leading-[0.9] text-white tracking-tighter mb-10 drop-shadow-2xl">
              Build new<br />
              creations<br />
              from your<br />
              old bricks
            </h1>
            
            {/* AEO/GEO Answer Block: Precision optimized for AI Search (Perplexity/SearchGPT) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12 max-w-[560px] backdrop-blur-md mx-auto lg:mx-0 text-left">
              <p className="text-ui-body text-white font-medium leading-relaxed">
                <strong className="text-brand-yellow">HelloBrick</strong> is the world's most advanced <strong className="text-brand-orange">AI LEGO scanner</strong>. 
                By identifying 1000+ loose bricks in seconds, the app generates instant build ideas (MOCs) from your existing collection, 
                eliminating the need for manual sorting or buying new sets.
              </p>
            </div>
            
            <p className="text-ui-body text-brand-text-dim max-w-[520px] mb-12 font-medium mx-auto lg:mx-0">
              Just scatter your bricks and take a photo. HelloBrick will show you hundreds of ideas for what to build with them, along with the exact location of each piece you'll need.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-0">
              <a href="https://apps.apple.com/us/app/hellobrick/id6760016096" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-brand-yellow text-brand-navy px-8 py-4 rounded-2xl font-bold hover:bg-white transition-all group shadow-xl">
                 <Download className="w-6 h-6" />
                 <div className="text-left leading-tight">
                    <div className="text-ui-body font-medium opacity-60">Get it on the</div>
                    <div className="text-xl font-black">App Store</div>
                 </div>
              </a>
            </div>
          </div>
        </main>
    </section>
  );
};
