import React from 'react';

export const SectionHowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="relative w-full py-24 overflow-hidden text-white bg-brand-navy">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[-10%] top-[10%] w-[500px] h-[500px] bg-brand-orange opacity-[0.07] blur-[120px] rounded-full"></div>
        <div className="absolute right-[-10%] bottom-[10%] w-[600px] h-[600px] bg-brand-yellow opacity-[0.05] blur-[140px] rounded-full"></div>
        
        {/* Decorative Floating Brick */}
        <div className="absolute right-[5%] top-[15%] w-32 h-32 bg-brand-navy-light border border-white/5 rounded-[24px] rotate-12 opacity-40">
          <div className="grid grid-cols-2 gap-2 p-3 w-full h-full">
            <div className="rounded-full border-4 border-white/5 bg-brand-navy"></div>
            <div className="rounded-full border-4 border-white/5 bg-brand-navy"></div>
            <div className="rounded-full border-4 border-white/5 bg-brand-navy"></div>
            <div className="rounded-full border-4 border-white/5 bg-brand-navy"></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-12 flex flex-col items-center">
        <div className="text-center mb-24">
          <h2 className="font-serif text-[3.5rem] md:text-ui-l leading-[1.1] text-white tracking-[-0.03em] mb-6">
            Three steps to <span className="italic text-brand-yellow">infinite</span> play
          </h2>
          <p className="text-brand-text-dim text-ui-m max-w-2xl mx-auto font-medium">Our proprietary computer vision tech turns your messy bin into a library of creative possibilities.</p>
        </div>

        {/* Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl">
          
          {/* Step 1 */}
          <div className="group relative bg-brand-navy-light border border-white/5 p-8 rounded-[40px] hover:border-brand-yellow/30 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute -top-6 -left-2 w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center text-brand-navy font-serif italic text-3xl shadow-lg shadow-brand-yellow/20 group-hover:scale-110 transition-transform">1</div>
            
            <div className="aspect-square bg-brand-navy rounded-2xl mb-8 overflow-hidden relative border border-white/5">
              <img src="/screens/onboarding_scan_bg_1773682593724.png" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Scan" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent flex items-end p-6">
                <div className="bg-white/10 backdrop-blur-md text-white text-ui-s font-bold px-4 py-2 rounded-full border border-white/20">Point and scan...</div>
              </div>
            </div>
            
            <h3 className="text-[24px] font-bold text-white mb-3">Scatter & Scan</h3>
            <p className="text-brand-text-dim text-ui-m leading-relaxed">No sorting required. Just lay your bricks flat and take a single photo. Our CV identifies everything in seconds.</p>
          </div>

          {/* Step 2 */}
          <div className="group relative bg-brand-navy-light border border-white/5 p-8 rounded-[40px] hover:border-brand-yellow/30 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute -top-6 -left-2 w-16 h-16 bg-brand-navy rounded-2xl border border-white/10 flex items-center justify-center text-white font-serif italic text-3xl group-hover:scale-110 transition-transform">2</div>
            
            <div className="aspect-square bg-brand-navy rounded-2xl mb-8 overflow-hidden relative border border-white/5">
              <img src="/screens/onboarding_vault_bg_1773682607010.png" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Vault" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent flex items-end p-6">
                <div className="bg-brand-orange/20 backdrop-blur-md text-brand-orange text-ui-s font-bold px-4 py-2 rounded-full border border-brand-orange/20">Stored in your vault</div>
              </div>
            </div>
            
            <h3 className="text-[24px] font-bold text-white mb-3">Unlock Daily MOCs</h3>
            <p className="text-brand-text-dim text-ui-m leading-relaxed">Instantly see thousands of builds you can complete with the bricks you just scanned. New ideas every day.</p>
          </div>

          {/* Step 3 */}
          <div className="group relative bg-brand-navy-light border border-white/5 p-8 rounded-[40px] hover:border-brand-orange/30 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute -top-6 -left-2 w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center text-white font-serif italic text-3xl shadow-lg shadow-brand-orange/20 group-hover:scale-110 transition-transform">3</div>
            
            <div className="aspect-square bg-brand-navy rounded-2xl mb-8 overflow-hidden relative border border-white/5">
              <img src="/screens/onboarding_ideas_bg_1773682621185.png" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Build" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent flex items-end p-6">
                <div className="bg-brand-yellow text-black text-ui-s font-bold px-4 py-2 rounded-full shadow-lg">Build now →</div>
              </div>
            </div>
            
            <h3 className="text-[24px] font-bold text-white mb-3">Start Building</h3>
            <p className="text-brand-text-dim text-ui-m leading-relaxed">Choose from hundreds of compatible MOCs. Follow step-by-step instructions showing you exactly where each piece is.</p>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="mt-20 bg-brand-navy-light/90 backdrop-blur-xl border border-white/10 rounded-2xl px-12 py-6 shadow-2xl flex items-center gap-12">
          <p className="text-brand-text-dim text-ui-m font-medium">Ready to see what's hidden in your collection?</p>
          <div className="flex gap-4">
            <button className="bg-white text-black px-8 py-3 rounded-xl font-bold text-ui-s hover:bg-brand-yellow transition-colors uppercase tracking-widest text-[11px]">Get Started</button>
            <button className="bg-white/5 text-white px-8 py-3 rounded-xl font-bold text-ui-s hover:bg-white/10 transition-colors uppercase tracking-widest text-[11px]">View Samples</button>
          </div>
        </div>
      </div>
    </section>
  );
};
