import React from 'react';
import { SectionHero } from '../components/SectionHero';
import { SectionHowItWorks } from '../components/SectionHowItWorks';
import { SectionPricing } from '../components/SectionPricing';
import { SectionEdu } from '../components/SectionEdu';
import { Logo } from '../components/Logo';
import { Download, Instagram, Twitter, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-navy font-sans text-white">
      <SectionHero />
      <SectionHowItWorks />
      <SectionPricing />
      
      {/* Education Teaser */}
      <section className="py-40 bg-brand-navy-light/30">
        <div className="max-w-[1440px] mx-auto px-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <div className="relative aspect-video rounded-[48px] overflow-hidden border border-white/5 group">
                <img src="/screens/train.png" alt="Education" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy to-transparent"></div>
             </div>
             
             <div className="space-y-10">
                <h2 className="text-[3.5rem] md:text-ui-header font-black tracking-tighter leading-none">HelloBrick for schools</h2>
                <p className="text-ui-body text-brand-text-dim font-medium leading-relaxed max-w-lg">
                  Bring the power of AI scanning to your classroom. Automate inventory, manage student labs, and follow standards-aligned building guides.
                </p>
                <Link to="/education" className="inline-flex items-center gap-3 text-brand-yellow font-bold text-ui-body transition-all group">
                  Explore education <Download className="w-5 h-5 -rotate-90 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
           </div>
        </div>
      </section>

      <SectionEdu />

      {/* Blog Teaser */}
      <section className="py-40 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-12 text-center">
           <h2 className="text-[3.5rem] md:text-ui-header font-black tracking-tighter leading-none mb-10">Latest from the vault</h2>
           <p className="text-ui-body text-brand-text-dim font-medium max-w-xl mx-auto mb-16">
             Get the best tips on sorting, building, and maintaining your collection.
           </p>
           <Link to="/blog" className="inline-flex items-center gap-4 bg-brand-navy-light border border-white/10 px-10 py-5 rounded-3xl text-ui-body font-bold hover:bg-white hover:text-black transition-all">
             View all guides
           </Link>
        </div>
      </section>

      <footer className="footer-bg py-32 border-t border-white/5 relative overflow-hidden">
         <div className="max-w-[1440px] mx-auto px-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
               <div className="col-span-1 md:col-span-2 space-y-10">
                  <Logo size="lg" light={true} />
                  <p className="text-ui-body text-brand-text-dim font-medium max-w-sm">
                    The ultimate AI companion for brick builders. Scan, sort, and build anything from your existing collection.
                  </p>
                  <div className="flex gap-6">
                    <a href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-brand-yellow hover:text-black transition-all"><Instagram className="w-6 h-6" /></a>
                    <a href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-brand-yellow hover:text-black transition-all"><Twitter className="w-6 h-6" /></a>
                    <a href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-brand-yellow hover:text-black transition-all"><Mail className="w-6 h-6" /></a>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <h4 className="text-xl font-bold text-white mb-8">Navigation</h4>
                  <ul className="space-y-4 text-brand-text-dim text-ui-body font-bold">
                    <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                    <li><Link to="/education" className="hover:text-white transition-colors">Education</Link></li>
                    <li><Link to="/blog" className="hover:text-white transition-colors">Journal</Link></li>
                    <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  </ul>
               </div>

               <div className="space-y-6">
                  <h4 className="text-xl font-bold text-white mb-8">Legal</h4>
                  <ul className="space-y-4 text-brand-text-dim text-ui-body font-bold">
                    <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy policy</Link></li>
                    <li><Link to="/terms" className="hover:text-white transition-colors">Terms of service</Link></li>
                  </ul>
               </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-16 border-t border-white/5 relative z-10">
               <div className="flex items-center gap-8">
                  <Logo size="sm" light={true} showText={false} />
                  <p className="text-ui-body text-white/30 font-bold">© 2024 HelloBrick. All rights reserved.</p>
               </div>
               
               <div className="flex flex-col items-center gap-4">
                 <p className="text-ui-body text-white/20 font-bold max-w-sm text-center">HelloBrick is an independent application. LEGO is a trademark of the LEGO Group.</p>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
