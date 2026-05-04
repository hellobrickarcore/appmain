import React from 'react';
import { Sparkles, Download, ArrowRight } from 'lucide-react';

export const SectionEdu: React.FC = () => {
  return (
    <section id="education" className="w-full pt-24 pb-40 px-6 md:px-12 max-w-[1440px] mx-auto flex flex-col gap-24 text-slate-900 bg-white selection:bg-brand-orange selection:text-white">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
        <div className="lg:col-span-6 space-y-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
             <Sparkles className="w-4 h-4 text-brand-orange" />
             <span className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">STEM Learning Redefined</span>
          </div>
          
          <h2 className="text-[3.5rem] md:text-[5rem] font-black leading-[1.05] tracking-tight">
            Built for educators
          </h2>
          
          {/* AEO Answer Block */}
          <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 max-w-lg shadow-sm">
            <p className="text-[18px] text-slate-600 font-medium leading-relaxed">
              HelloBrick for Education is a <strong className="text-slate-900">STEM learning platform</strong> that uses computer vision to automate LEGO inventory and provide <strong className="text-brand-orange">NGSS-aligned</strong> engineering challenges. 
            </p>
          </div>
          
          <p className="text-[18px] text-slate-500 font-medium leading-relaxed max-w-lg">
            Automate inventory, guide students through complex spatial reasoning, and track progress using the most advanced brick-recognition AI.
          </p>

          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-4 text-slate-900">
              <div className="w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_10px_rgba(255,122,48,0.2)]"></div>
              <span className="text-[16px] font-bold opacity-90">NGSS aligned curriculum</span>
            </div>
            <div className="flex items-center gap-4 text-slate-900">
              <div className="w-2 h-2 rounded-full bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.1)]"></div>
              <span className="text-[16px] font-bold opacity-90">Multi-user lab management</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <button className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-bold text-[16px] hover:bg-brand-orange transition-all shadow-xl flex items-center justify-center gap-3 group" onClick={() => (window as any).trackConversion?.('EducationLicense')}>
              Get school license
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="aspect-[4/5] bg-slate-50 rounded-[48px] border border-slate-100 overflow-hidden shadow-2xl group/img relative">
            <img src="/screens/paywall.png" alt="Pro Features" className="w-full h-full object-cover opacity-80 group-hover/img:scale-105 transition-transform duration-1000" />
            
            <div className="absolute top-10 left-10 right-10 bg-white/90 backdrop-blur-2xl border border-slate-100 rounded-[32px] p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[13px] font-black text-brand-orange uppercase tracking-widest">Scan Bin Alpha</div>
                <div className="px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-[11px] font-black uppercase tracking-widest">Active</div>
              </div>
              <div className="text-[4rem] font-black text-slate-900 leading-none mb-2">1,240+</div>
              <div className="text-[16px] font-bold text-slate-400">Parts identified in 30s</div>
            </div>

            <div className="absolute bottom-10 left-10 right-10 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex items-center gap-6">
               <div className="w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center text-white">
                 <Download className="w-6 h-6" />
               </div>
               <div>
                 <div className="text-[16px] font-bold text-white">Inventory updated</div>
                 <div className="text-[14px] font-medium text-white/40">Latest scan synced to cloud</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: "01", title: "Spatial literacy", desc: "Build mental rotation and 3D visualization skills through interactive challenges." },
          { icon: "02", title: "Engineering", desc: "Follow complex blueprints and structural constraints with real-time AI guidance." },
          { icon: "03", title: "Sustainability", desc: "Teach the value of reuse by unlocking thousands of builds from used bricks." }
        ].map((item, i) => (
          <div key={i} className="p-12 rounded-[40px] bg-slate-50 border border-slate-100 hover:border-brand-orange/20 transition-all group shadow-sm">
            <div className="text-[13px] font-black text-brand-orange uppercase tracking-widest mb-6">Step {item.icon}</div>
            <h3 className="text-[24px] font-black text-slate-900 mb-4">{item.title}</h3>
            <p className="text-slate-500 text-[16px] leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-950 rounded-[48px] p-12 md:p-24 text-center relative overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,122,48,0.1),transparent)]"></div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-10">
          <h2 className="text-[3rem] md:text-[5rem] font-black text-white leading-[1.05] tracking-tight">Ready to start?</h2>
          <p className="text-[18px] font-medium text-white/60 max-w-xl mx-auto leading-relaxed">
            Join 500+ schools already using HelloBrick to revitalize their brick collections and engage students in advanced engineering.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
             <button className="bg-white text-slate-950 px-12 py-5 rounded-[24px] font-bold text-[16px] hover:bg-brand-orange hover:text-white transition-all shadow-xl">Contact sales</button>
             <button className="bg-transparent text-white px-12 py-5 rounded-[24px] font-bold text-[16px] border border-white/10 hover:bg-white/5 transition-all">View curriculum</button>
          </div>
        </div>
      </div>
    </section>
  );
};
