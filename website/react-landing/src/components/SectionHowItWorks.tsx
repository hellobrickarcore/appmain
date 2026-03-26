import React from 'react';

export const SectionHowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-40">
      <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
        <div className="space-y-4">
          <h2 className="text-[3.5rem] md:text-ui-header font-black tracking-tighter leading-none">The process</h2>
          <p className="text-ui-body text-brand-text-dim font-medium max-w-lg">How HelloBrick turns your physical collection into a digital building vault.</p>
        </div>
        <div className="hidden lg:block w-32 h-[1px] bg-white/10 mb-6"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Step 1 */}
        <div className="group relative bg-brand-navy-light border border-white/5 p-8 rounded-[40px] hover:border-brand-yellow/30 transition-all duration-500 hover:-translate-y-2">
          <div className="absolute -top-6 -left-2 w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center text-brand-navy font-bold text-3xl shadow-lg shadow-brand-yellow/20 group-hover:scale-110 transition-transform">1</div>
          
          <div className="aspect-square bg-brand-navy rounded-2xl mb-8 overflow-hidden relative border border-white/5">
            <img src="/screens/onboarding_scan_bg_1773682593724.png" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Scan" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent flex items-end p-6">
              <div className="bg-white/10 backdrop-blur-md text-white text-ui-body font-bold px-4 py-2 rounded-full border border-white/20">Point and scan</div>
            </div>
          </div>
          
          <h3 className="text-[24px] font-bold text-white mb-3">Scatter and scan</h3>
          <p className="text-brand-text-dim text-ui-body leading-relaxed">No sorting required. Just lay your bricks flat and take a single photo. Our app identifies everything in seconds.</p>
        </div>

        {/* Step 2 */}
        <div className="group relative bg-brand-navy-light border border-white/5 p-8 rounded-[40px] hover:border-brand-yellow/30 transition-all duration-500 hover:-translate-y-2">
          <div className="absolute -top-6 -left-2 w-16 h-16 bg-brand-navy rounded-2xl border border-white/10 flex items-center justify-center text-white font-bold text-3xl group-hover:scale-110 transition-transform">2</div>
          
          <div className="aspect-square bg-brand-navy rounded-2xl mb-8 overflow-hidden relative border border-white/5">
            <img src="/screens/onboarding_vault_bg_1773682607010.png" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Vault" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent flex items-end p-6">
               <div className="bg-brand-orange/20 backdrop-blur-md text-brand-orange text-ui-body font-bold px-4 py-2 rounded-full border border-brand-orange/20">Stored in your vault</div>
            </div>
          </div>
          
          <h3 className="text-[24px] font-bold text-white mb-3">Unlock daily builds</h3>
          <p className="text-brand-text-dim text-ui-body leading-relaxed">Instantly see thousands of builds you can complete with the bricks you just scanned. New ideas every day.</p>
        </div>

        {/* Step 3 */}
        <div className="group relative bg-brand-navy-light border border-white/5 p-8 rounded-[40px] hover:border-brand-orange/30 transition-all duration-500 hover:-translate-y-2">
          <div className="absolute -top-6 -left-2 w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-brand-orange/20 group-hover:scale-110 transition-transform">3</div>
          
          <div className="aspect-square bg-brand-navy rounded-2xl mb-8 overflow-hidden relative border border-white/5">
            <img src="/screens/onboarding_ideas_bg_1773682621185.png" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Build" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent flex items-end p-6">
              <div className="bg-brand-yellow text-black text-ui-body font-bold px-4 py-2 rounded-full shadow-lg">Build now</div>
            </div>
          </div>
          
          <h3 className="text-[24px] font-bold text-white mb-3">Start building</h3>
          <p className="text-brand-text-dim text-ui-body leading-relaxed">Choose from hundreds of compatible builds. Follow step-by-step instructions showing you exactly where each piece is.</p>
        </div>
      </div>
    </section>
  );
};
