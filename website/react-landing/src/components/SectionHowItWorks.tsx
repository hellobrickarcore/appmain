import React from 'react';

export const SectionHowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="max-w-[1440px] mx-auto px-6 py-24 md:py-40 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
        <div className="space-y-6">
           <div className="inline-flex items-center gap-2 mb-2">
             <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
             <span className="text-[14px] uppercase tracking-widest font-black text-slate-500">The Process</span>
          </div>
          <h2 className="text-[2.5rem] md:text-ui-header font-black tracking-tight leading-[1.05] text-slate-900">How it works</h2>
          <p className="text-[18px] text-slate-500 font-medium max-w-lg">How HelloBrick turns your physical collection into a digital building vault.</p>
        </div>
        <div className="hidden lg:block w-32 h-[1px] bg-slate-100 mb-6 font-bold"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Step 1 */}
        <div className="group relative bg-white border border-slate-100 p-8 rounded-[40px] hover:border-brand-orange/30 transition-all duration-500 hover:shadow-2xl">
          <div className="absolute -top-6 -left-2 w-16 h-16 bg-slate-900 rounded-[22px] flex items-center justify-center text-white font-black text-3xl shadow-xl group-hover:scale-110 transition-transform">1</div>
          
          <div className="aspect-square bg-slate-50 rounded-[32px] mb-8 overflow-hidden relative border border-slate-100">
            <img src="/screens/onboarding_scan_bg_1773682593724.png" className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" alt="Scan" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent flex items-end p-6">
              <div className="bg-white/90 backdrop-blur-md text-slate-900 text-[14px] font-black px-6 py-2.5 rounded-full border border-white uppercase tracking-widest">Point and scan</div>
            </div>
          </div>
          
          <h3 className="text-[24px] font-black text-slate-900 mb-3">Dump your LEGO on the floor</h3>
          <p className="text-slate-500 text-[16px] leading-relaxed font-medium">No sorting required. Just clear some space and dump your collection. Real builds happen in real homes.</p>
        </div>

        {/* Step 2 */}
        <div className="group relative bg-white border border-slate-100 p-8 rounded-[40px] hover:border-brand-orange/30 transition-all duration-500 hover:shadow-2xl">
          <div className="absolute -top-6 -left-2 w-16 h-16 bg-brand-orange rounded-[22px] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-brand-orange/20 group-hover:scale-110 transition-transform">2</div>
          
          <div className="aspect-square bg-slate-50 rounded-[32px] mb-8 overflow-hidden relative border border-slate-100">
            <img src="/screens/onboarding_vault_bg_1773682607010.png" className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" alt="Vault" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent flex items-end p-6">
               <div className="bg-white/90 backdrop-blur-md text-brand-orange text-[14px] font-black px-6 py-2.5 rounded-full border border-white uppercase tracking-widest">Stored in your vault</div>
            </div>
          </div>
          
          <h3 className="text-[24px] font-black text-slate-900 mb-3">Scan it with your camera</h3>
          <p className="text-slate-500 text-[16px] leading-relaxed font-medium">Our AI identifies every brick instantly. No guesswork, no counting, no mistakes.</p>
        </div>

        {/* Step 3 */}
        <div className="group relative bg-white border border-slate-100 p-8 rounded-[40px] hover:border-brand-orange/30 transition-all duration-500 hover:shadow-2xl">
          <div className="absolute -top-6 -left-2 w-16 h-16 bg-slate-100 rounded-[22px] flex items-center justify-center text-slate-400 font-black text-3xl group-hover:scale-110 transition-transform">3</div>
          
          <div className="aspect-square bg-slate-50 rounded-[32px] mb-8 overflow-hidden relative border border-slate-100">
            <img src="/screens/onboarding_ideas_bg_1773682621185.png" className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" alt="Build" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent flex items-end p-6">
              <div className="bg-slate-900 text-white text-[14px] font-black px-8 py-3 rounded-full shadow-xl uppercase tracking-widest">Build now</div>
            </div>
          </div>
          
          <h3 className="text-[24px] font-black text-slate-900 mb-3">Get builds you can actually make</h3>
          <p className="text-slate-500 text-[16px] leading-relaxed font-medium">Instantly see thousands of builds you can complete with the bricks you just scanned. That’s it.</p>
        </div>
      </div>
    </section>
  );
};
