import React from 'react';
import { Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const SectionHero: React.FC = () => {
  return (
    <section className="w-full min-h-screen relative flex flex-col bg-white selection:bg-brand-orange selection:text-white">
        {/* Navigation / Header */}
        <header className="fixed top-0 left-0 right-0 z-[100] w-full bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <div className="max-w-[1440px] mx-auto h-20 md:h-24 flex items-center justify-between px-6 md:px-12">
            <Link to="/" className="hover:scale-105 transition-transform">
               <Logo size="md" light={false} />
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full border border-slate-100 bg-slate-50/50">
              <a href="#how-it-works" className="text-[14px] font-bold text-slate-500 hover:text-slate-900 px-6 py-2 rounded-full transition-colors">How it works</a>
              <a href="#pricing" className="text-[14px] font-bold text-slate-500 hover:text-slate-900 px-6 py-2 rounded-full transition-colors">Pricing</a>
              <Link to="/blog" className="text-[14px] font-bold text-slate-500 hover:text-slate-900 px-6 py-2 rounded-full transition-colors">Journal</Link>
            </nav>
            
            <a href="https://apps.apple.com/us/app/hellobrick/id6760016096" target="_blank" rel="noopener noreferrer" className="bg-brand-orange text-white px-7 py-3 rounded-2xl font-bold text-[15px] hover:shadow-lg hover:scale-105 transition-all duration-300">
              Try for free
            </a>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1440px] mx-auto grid grid-cols-12 gap-8 px-6 md:px-12 items-center pt-32 pb-20">
          {/* Content Section */}
          <div className="col-span-12 lg:col-span-7 pr-0 lg:pr-12 relative z-10 flex flex-col justify-center text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 mb-6 mx-auto lg:mx-0">
               <span className="bg-brand-orange/10 text-brand-orange text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">New in v1.6.1</span>
            </div>
            <h1 className="font-black text-[3rem] md:text-ui-header leading-[1.05] text-slate-900 tracking-tight mb-10">
              You don’t need more LEGO.<br />
              You need to know what<br />
              you can build.
            </h1>
            
            <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 md:p-8 mb-12 max-w-[580px] mx-auto lg:mx-0 text-left">
              <p className="text-[18px] text-slate-600 font-medium leading-relaxed">
                <strong className="text-slate-950">HelloBrick</strong> scans your pile and shows you <strong className="text-brand-orange">exactly what to make</strong>.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-0 mb-12">
              <a href="https://apps.apple.com/us/app/hellobrick/id6760016096" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-3xl font-bold hover:bg-brand-orange transition-all group shadow-xl" onClick={() => (window as any).trackConversion?.('Download')}>
                 <Download className="w-6 h-6" />
                 <div className="text-left leading-tight">
                    <div className="text-[12px] font-medium opacity-60">Get it on the</div>
                    <div className="text-lg font-black">App Store</div>
                 </div>
              </a>
              <Link to="/blog" className="text-[16px] font-bold text-slate-500 hover:text-slate-950 transition-colors px-4 py-2">
                Explore the Resource Hub
              </Link>
            </div>

            {/* Proof Strip */}
            <div className="border-t border-slate-100 pt-8 flex flex-col gap-6">
              <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest text-center lg:text-left">Loved by messy LEGO owners everywhere</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4">
                {[
                  "This saved me HOURS sorting",
                  "My kids actually use their LEGO again",
                  "Way faster than trying to figure it out myself"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-500 font-bold text-[15px]">
                    <span className="text-brand-orange text-lg">✔</span> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phone Mockup Section */}
          <div className="col-span-12 lg:col-span-5 flex justify-center lg:justify-end pl-0 lg:pl-12 relative h-full items-center order-1 lg:order-2 mb-12 lg:mb-0">
             <div className="relative group">
                <div className="absolute inset-0 bg-brand-orange/20 blur-[100px] rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="w-[280px] md:w-[320px] h-[580px] md:h-[640px] bg-slate-950 rounded-[48px] border-[8px] border-slate-900 shadow-2xl relative z-10 overflow-hidden flex flex-col group rotate-2 hover:rotate-0 transition-all duration-700">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-3xl z-30"></div>
                  <div className="flex-1 relative bg-slate-900 overflow-hidden">
                    <img src="/screens/welcome.png" alt="HelloBrick welcome" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-8">
                      <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <p className="text-[13px] font-black text-brand-yellow uppercase tracking-widest mb-1">Scanning Live</p>
                        <p className="text-[18px] font-black text-white">433 Bricks identified</p>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </main>
    </section>
  );
};
