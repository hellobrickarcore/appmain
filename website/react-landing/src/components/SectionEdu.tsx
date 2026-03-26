import React from 'react';
import { Sparkles, Download, ArrowRight } from 'lucide-react';

export const SectionEdu: React.FC = () => {
  return (
    <section id="education" className="w-full pt-16 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto flex flex-col gap-20 text-white bg-brand-navy selection:bg-brand-orange selection:text-white">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
        <div className="md:col-span-6 space-y-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-navy-light rounded-full border border-white/10 shadow-xl">
             <Sparkles className="w-4 h-4 text-brand-yellow" />
             <span className="text-ui-body font-bold text-brand-text-dim">STEM learning redefined</span>
          </div>
          
          <h2 className="text-[4.5rem] md:text-ui-header font-black leading-none tracking-tighter">
            Built for educators
          </h2>
          
          {/* AEO Answer Block */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-lg backdrop-blur-md">
            <p className="text-ui-body text-white font-medium leading-relaxed">
              HelloBrick for Education is a <strong className="text-brand-yellow">STEM learning platform</strong> that uses computer vision to automate LEGO inventory and provide <strong className="text-brand-orange">NGSS-aligned</strong> engineering challenges. 
              It allows schools to revitalize aging brick collections and teach spatial literacy at scale.
            </p>
          </div>
          
          <p className="text-ui-body text-brand-text-dim font-medium leading-relaxed max-w-lg">
            Automate inventory, guide students through complex spatial reasoning, and track progress using the most advanced brick-recognition AI.
          </p>

          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-4 text-white">
              <div className="w-2 h-2 rounded-full bg-brand-yellow shadow-[0_0_10px_#FFCE4A]"></div>
              <span className="text-ui-body font-bold opacity-90">NGSS aligned curriculum</span>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_10px_#FF7A30]"></div>
              <span className="text-ui-body font-bold opacity-90">Multi-user lab management</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <button className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-ui-body hover:bg-brand-yellow transition-all shadow-2xl flex items-center justify-center gap-3 group">
              Get school license
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="md:col-span-6 relative">
          <div className="aspect-[4/5] bg-brand-navy-light rounded-[60px] border border-white/5 overflow-hidden shadow-2xl group/img">
            <img src="/screens/paywall.png" alt="Pro Features" className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover/img:scale-105 transition-transform duration-1000" />
            
            <div className="absolute top-12 left-12 right-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="text-ui-body font-bold text-brand-yellow">Scan bin alpha</div>
                <div className="px-3 py-1 bg-brand-orange/20 text-brand-orange rounded-full text-[12px] font-bold">Active</div>
              </div>
              <div className="text-[3.5rem] font-bold text-white leading-none mb-2">1,240+</div>
              <div className="text-ui-body font-medium text-brand-text-dim">Parts identified in 30s</div>
            </div>

            <div className="absolute bottom-12 left-12 right-12 bg-brand-navy/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex items-center gap-5">
               <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center text-black">
                 <Download className="w-6 h-6" />
               </div>
               <div>
                 <div className="text-ui-body font-bold text-white">Inventory updated</div>
                 <div className="text-[14px] font-medium text-brand-text-dim">Latest scan synced to cloud</div>
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
          <div key={i} className="p-10 rounded-[48px] bg-brand-navy-light border border-white/5 hover:border-brand-yellow/20 transition-all group">
            <div className="text-ui-body font-bold text-brand-yellow mb-6">Step {item.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
            <p className="text-brand-text-dim text-ui-body leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-brand-orange rounded-[60px] p-12 md:p-20 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]"></div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-10">
          <h2 className="text-[4rem] md:text-ui-header font-black text-white leading-none tracking-tighter">Ready to sort</h2>
          <p className="text-ui-body font-bold text-brand-navy max-w-xl mx-auto opacity-80 leading-relaxed">
            Join 500+ schools already using HelloBrick to revitalize their brick collections and engage students in advanced engineering.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
             <button className="bg-brand-navy text-white px-10 py-5 rounded-2xl font-bold text-ui-body hover:bg-black transition-all shadow-2xl">Contact sales</button>
             <button className="bg-transparent text-brand-navy px-10 py-5 rounded-2xl font-bold text-ui-body border border-brand-navy/20 hover:bg-brand-navy/5 transition-all">View curriculum</button>
          </div>
        </div>
      </div>
    </section>
  );
};
