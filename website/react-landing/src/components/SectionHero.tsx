import { Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const SectionHero: React.FC = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden text-white bg-brand-navy selection:bg-brand-yellow selection:text-black">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Abstract orange brick shape */}
        <div className="absolute left-[-2%] top-[12%] w-[42vw] h-[35vh] bg-brand-orange rounded-r-[48px] -rotate-[4deg] shadow-[20px_20px_80px_rgba(255,122,48,0.2)]">
          <div className="absolute -top-[45px] left-[15%] w-[90px] h-[45px] bg-brand-orange rounded-t-[24px]"></div>
          <div className="absolute -top-[45px] left-[40%] w-[90px] h-[45px] bg-brand-orange rounded-t-[24px]"></div>
          <div className="absolute -top-[45px] left-[65%] w-[90px] h-[45px] bg-brand-orange rounded-t-[24px]"></div>
        </div>
        
        {/* Abstract yellow brick shape */}
        <div className="absolute left-[15%] bottom-[-10vh] w-[20vw] h-[60vh] bg-brand-yellow rounded-t-[48px] rotate-[8deg] shadow-[20px_-20px_80px_rgba(255,206,74,0.15)]">
          <div className="absolute top-[20%] -left-[45px] w-[45px] h-[90px] bg-brand-yellow rounded-l-[24px]"></div>
          <div className="absolute top-[50%] -left-[45px] w-[45px] h-[90px] bg-brand-yellow rounded-l-[24px]"></div>
        </div>

        {/* Small floating dark brick */}
        <div className="absolute right-[6%] bottom-[12%] w-[160px] h-[160px] bg-brand-navy-light rounded-[36px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] -rotate-12">
          <div className="grid grid-cols-2 gap-4 p-4 w-full h-full">
            <div className="rounded-full border-[6px] border-white/5 bg-brand-navy shadow-inner"></div>
            <div className="rounded-full border-[6px] border-white/5 bg-brand-navy shadow-inner"></div>
            <div className="rounded-full border-[6px] border-white/5 bg-brand-navy shadow-inner"></div>
            <div className="rounded-full border-[6px] border-white/5 bg-brand-navy shadow-inner"></div>
          </div>
        </div>
        
        {/* Large floating dark brick */}
        <div className="absolute right-[18%] bottom-[-5%] w-[220px] h-[220px] bg-brand-navy rounded-[48px] border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.9)] rotate-6">
          <div className="grid grid-cols-2 gap-6 p-6 w-full h-full">
            <div className="rounded-full border-[8px] border-white/5 bg-brand-navy shadow-inner"></div>
            <div className="rounded-full border-[8px] border-white/5 bg-brand-navy shadow-inner"></div>
            <div className="rounded-full border-[8px] border-white/5 bg-brand-navy shadow-inner"></div>
            <div className="rounded-full border-[8px] border-white/5 bg-brand-navy shadow-inner"></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col">
        <header className="flex items-center justify-between px-12 py-8 w-full shrink-0 max-w-[1440px] mx-auto">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <Logo size="md" light={true} showText={true} />
          </Link>
          
          <nav className="hidden lg:flex items-center gap-1.5 bg-brand-navy-light/80 backdrop-blur-xl p-1.5 rounded-full border border-white/5 shadow-2xl">
            <a href="#how-it-works" className="text-ui-s font-bold text-white bg-white/10 px-6 py-2.5 rounded-full transition-colors">How it works</a>
            <Link to="/education" className="text-ui-s font-medium text-brand-text-dim hover:text-white px-6 py-2.5 rounded-full transition-colors">For classes</Link>
            <Link to="/blog" className="text-ui-s font-medium text-brand-text-dim hover:text-white px-6 py-2.5 rounded-full transition-colors">Blog</Link>
          </nav>
          
          <a href="https://apps.apple.com/us/app/hellobrick/id6760016096" target="_blank" rel="noopener noreferrer" className="bg-brand-yellow text-black px-7 py-3 rounded-xl font-bold text-ui-s hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,206,74,0.15)]">
            Download App
          </a>
        </header>

        <main className="flex-1 w-full max-w-[1440px] mx-auto grid grid-cols-12 gap-8 px-12 items-center pb-12">
          {/* Phone Mockup Section */}
          <div className="col-span-12 lg:col-span-5 flex justify-center lg:justify-end pr-0 lg:pr-12 relative h-full items-center">
            <div className="w-[320px] h-[640px] bg-black rounded-[44px] border-[12px] border-brand-navy-light shadow-[0_30px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(255,122,48,0.2)] relative z-10 -rotate-2 hover:rotate-0 transition-transform duration-700 overflow-hidden flex flex-col group">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-brand-navy-light rounded-b-3xl z-30"></div>
              
              <div className="flex-1 relative bg-brand-navy-light overflow-hidden">
                <img src="/screens/welcome.png" alt="HelloBrick App Welcome Screen" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                
                {/* Real-time scanning overlay simulation */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent flex items-end p-8">
                  <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 animate-f">
                    <p className="text-ui-s font-bold text-brand-yellow mb-1">Scanning Live...</p>
                    <p className="text-ui-m font-bold text-white">433 Bricks Identified</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Secondary floating screen */}
            <div className="absolute -right-4 top-1/4 w-[240px] h-[480px] bg-black rounded-[32px] border-[8px] border-brand-navy-light shadow-2xl z-20 rotate-6 hidden lg:block overflow-hidden group/sub">
                <img src="/screens/ios_simulator_screenshot.png" alt="App Feature" className="w-full h-full object-cover group-hover/sub:scale-110 transition-transform duration-1000" />
            </div>
          </div>
          
          {/* Hero Content Section */}
          <div className="col-span-12 lg:col-span-7 pl-0 lg:pl-12 relative z-10 flex flex-col justify-center text-center lg:text-left mt-12 lg:mt-[-20px]">
            <h1 className="font-serif text-[4rem] md:text-ui-l leading-[0.92] text-white tracking-[-0.03em] mb-10 drop-shadow-2xl">
              Build <span className="italic text-brand-yellow">new</span><br />
              creations<br />
              from your<br />
              old bricks
            </h1>
            
            <p className="text-ui-m text-brand-text-dim max-w-[520px] mb-12 font-medium mx-auto lg:mx-0">
              Just scatter your bricks and take a photo. HelloBrick will show you hundreds of ideas for what to build with them, along with the exact location of each piece you'll need.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-8">
              <a href="https://apps.apple.com/us/app/hellobrick/id6760016096" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-brand-yellow text-brand-navy px-8 py-4 rounded-2xl font-bold hover:bg-white transition-all group shadow-xl">
                 <Download className="w-6 h-6" />
                 <div className="text-left leading-tight">
                    <div className="text-ui-s font-medium opacity-60">Get it on the</div>
                    <div className="text-xl font-black">App Store</div>
                 </div>
              </a>
            </div>
          </div>
        </main>

        {/* Cookie Banner / Bottom CTA */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-brand-navy-light/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 flex items-center justify-between gap-12 w-max max-w-3xl">
          <div className="flex items-center gap-5 pl-3">
            <div className="w-11 h-11 bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-white/5">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="text-brand-text-dim text-[14px] font-medium leading-relaxed">
              We use cookies for you to have a better experience here. <br />
              See <Link to="/privacy" className="text-white underline decoration-white/30 hover:decoration-white underline-offset-4 transition-colors">Privacy policy</Link> for details.
            </p>
          </div>
          <div className="flex gap-3 shrink-0 pr-1">
            <button className="bg-brand-yellow text-black px-7 py-3 rounded-xl font-bold text-[14px] hover:bg-white hover:scale-105 transition-all duration-300">Got it</button>
            <button className="bg-transparent text-brand-text-dim px-5 py-3 rounded-xl font-semibold text-[14px] hover:text-white hover:bg-white/5 transition-all duration-300">No, thanks</button>
          </div>
        </div>
      </div>
    </section>
  );
};
