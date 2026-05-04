import React from 'react';
import { SectionHero } from '../components/SectionHero';
import { SectionHowItWorks } from '../components/SectionHowItWorks';
import { SectionPricing } from '../components/SectionPricing';
import { SectionEdu } from '../components/SectionEdu';
import { Logo } from '../components/Logo';
import { Download, Instagram, Twitter, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-brand-orange selection:text-white">
      <SectionHero />
      
      {/* REAL Differentiator Section */}
      <section className="py-20 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-orange blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-orange blur-[120px] rounded-full"></div>
        </div>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 text-center">
           <h2 className="text-[2rem] md:text-[3.5rem] font-black tracking-tight leading-tight text-white mb-8">
             Built for real homes — <br className="hidden md:block" />
             not perfect collections
           </h2>
           <p className="text-[18px] md:text-[22px] text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
             HelloBrick works with messy piles, mixed sets, and random bricks. 
             <span className="text-brand-orange font-bold"> No need to organise first.</span>
           </p>
        </div>
      </section>

      <div id="how-it-works">
        <SectionHowItWorks />
      </div>

      {/* TikTok-style hook section */}
      <section className="py-24 md:py-32 bg-brand-orange/5 border-y border-brand-orange/10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
           <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
              <div className="w-full md:w-1/2 space-y-8">
                 <h2 className="text-[2.5rem] md:text-[4rem] font-black tracking-tight leading-[1] text-slate-900">
                    What can <span className="text-brand-orange italic underline decoration-8 underline-offset-4">YOU</span> build with your LEGO?
                 </h2>
                 <p className="text-[20px] text-slate-600 font-bold leading-relaxed">
                    Most people have £100+ of unused LEGO sitting at home. 
                    HelloBrick turns that into something fun again.
                 </p>
              </div>
              <div className="w-full md:w-1/2">
                 <div className="aspect-[9/16] max-w-[320px] mx-auto bg-slate-900 rounded-[40px] border-[8px] border-slate-900 shadow-2xl relative overflow-hidden group">
                    <img src="/screens/missions.png" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="TikTok Hook" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent flex items-end p-8">
                       <div className="space-y-2">
                          <p className="text-brand-orange font-black text-sm uppercase tracking-widest">Trending Now</p>
                          <p className="text-white text-xl font-black">"I found 400 pieces I forgot I had!"</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <div id="pricing">
        <SectionPricing />
      </div>
      
      {/* Education Teaser */}
      <section className="py-24 md:py-40 bg-slate-50/50">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
             <div className="relative aspect-square md:aspect-video rounded-[32px] md:rounded-[48px] overflow-hidden border border-slate-100 group shadow-lg">
                <img src="/screens/train.png" alt="Education" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
             </div>
             
             <div className="space-y-8 md:space-y-10">
                <div className="inline-flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                   <span className="text-[14px] uppercase tracking-widest font-black text-slate-500">Education</span>
                </div>
                <h2 className="text-[2.5rem] md:text-ui-header font-black tracking-tight leading-[1.1] text-slate-900">HelloBrick for schools</h2>
                <p className="text-[18px] text-slate-500 font-medium leading-relaxed max-w-lg">
                  Bring the power of AI scanning to your classroom. Automate inventory, manage student labs, and follow standards-aligned building guides.
                </p>
                <Link to="/education" className="inline-flex items-center gap-3 text-brand-orange font-bold text-[16px] transition-all group">
                  Explore education <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
           </div>
        </div>
      </section>

      {/* Blog Teaser */}
      <section className="py-24 md:py-40 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
           <h2 className="text-[2.5rem] md:text-ui-header font-black tracking-tight leading-[1.1] text-slate-900 mb-10">Latest from the vault</h2>
           <p className="text-[18px] text-slate-500 font-medium max-w-xl mx-auto mb-16">
             Get the best tips on sorting, building, and maintaining your collection in our daily AI-generated journal.
           </p>
           <Link to="/blog" className="inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-[24px] text-[16px] font-bold hover:bg-brand-orange hover:shadow-xl transition-all">
             View all guides
           </Link>
        </div>
      </section>

      <footer className="py-24 md:py-32 border-t border-slate-100 bg-white relative overflow-hidden">
         <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-20 mb-24">
               <div className="col-span-1 md:col-span-2 space-y-10">
                  <Logo size="lg" light={false} />
                  <p className="text-[16px] text-slate-500 font-medium max-w-sm">
                    The ultimate AI companion for brick builders. Scan, sort, and build anything from your existing collection.
                  </p>
                  <div className="flex gap-4">
                    <a href="#" className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-brand-orange hover:text-white transition-all"><Instagram className="w-6 h-6" /></a>
                    <a href="#" className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-brand-orange hover:text-white transition-all"><Twitter className="w-6 h-6" /></a>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <h4 className="text-[14px] uppercase tracking-widest font-black text-slate-900 mb-8">Navigation</h4>
                  <ul className="space-y-4 text-slate-500 text-[15px] font-bold">
                    <li><Link to="/" className="hover:text-brand-orange transition-colors">Home</Link></li>
                    <li><Link to="/education" className="hover:text-brand-orange transition-colors">Education</Link></li>
                    <li><Link to="/blog" className="hover:text-brand-orange transition-colors">Journal</Link></li>
                    <li><a href="#pricing" className="hover:text-brand-orange transition-colors">Pricing</a></li>
                  </ul>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[14px] uppercase tracking-widest font-black text-slate-900 mb-8">Legal</h4>
                  <ul className="space-y-4 text-slate-500 text-[15px] font-bold">
                    <li><Link to="/privacy" className="hover:text-brand-orange transition-colors">Privacy policy</Link></li>
                    <li><Link to="/terms" className="hover:text-brand-orange transition-colors">Terms of service</Link></li>
                  </ul>
               </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-16 border-t border-slate-100">
               <div className="flex items-center gap-6">
                  <Logo size="sm" light={false} showText={false} />
                  <p className="text-[14px] text-slate-400 font-bold">© 2024 HelloBrick. All rights reserved.</p>
               </div>
               
               <p className="text-[13px] text-slate-300 font-bold max-w-sm text-center md:text-right">HelloBrick is an independent application. LEGO is a trademark of the LEGO Group.</p>
            </div>
         </div>
      </footer>
    </div>
  );
};
