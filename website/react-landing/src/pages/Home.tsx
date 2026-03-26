import React from 'react';
import { Camera, Database, Lightbulb, ChevronRight, Trophy, Users, Sparkles, ArrowRight, Download } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import { SectionHero } from '../components/SectionHero';
import { SectionHowItWorks } from '../components/SectionHowItWorks';

const BlogCard = ({ category, title, date }: { category: string, title: string, date: string }) => (
  <div className="p-8 rounded-[2.5rem] bg-brand-navy-light border border-white/5 hover:border-brand-orange/20 transition-all group cursor-pointer">
    <div className="text-ui-s font-black uppercase tracking-[0.2em] text-brand-orange mb-4">{category}</div>
    <h4 className="text-ui-m font-black text-white mb-6 group-hover:text-brand-yellow transition-colors leading-tight font-sans uppercase italic">{title}</h4>
    <div className="flex items-center justify-between">
      <span className="text-ui-s font-bold text-brand-text-dim uppercase tracking-widest">{date}</span>
      <ChevronRight className="w-4 h-4 text-brand-text-dim group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-navy text-white font-sans selection:bg-brand-orange selection:text-white">
      <main>
        {/* HERO SECTION */}
        <SectionHero />

        {/* HOW IT WORKS SECTION */}
        <SectionHowItWorks />

        {/* EDUCATION TEASER */}
        <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
           <div className="bg-gradient-to-br from-brand-orange/20 to-brand-yellow/5 rounded-[4rem] p-12 md:p-24 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-brand-yellow/20 transition-all duration-700" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
                 <div className="flex-1 space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy rounded-full border border-white/10">
                       <Sparkles className="w-4 h-4 text-brand-yellow" />
                       <span className="text-ui-s font-black uppercase tracking-widest text-brand-text-dim">HelloBrick for Schools</span>
                    </div>
                    <h2 className="text-[3.5rem] md:text-ui-l font-serif leading-[0.9] tracking-tight mb-8">
                       Build <span className="italic text-brand-yellow">future</span> engineers.
                    </h2>
                    <p className="text-ui-m text-brand-text-dim max-w-xl font-medium leading-relaxed">
                       Transform your classroom collections into structured STEM learning. Bulk scan thousands of bricks and guide students through complex builds.
                    </p>
                    <Link to="/education" className="inline-flex items-center gap-4 bg-brand-yellow text-black px-8 py-4 rounded-2xl font-bold hover:bg-white transition-all group shadow-xl uppercase tracking-widest text-ui-s">
                       Explore Edu Features <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                 </div>
                 <div className="flex-1">
                    <div className="relative aspect-video bg-brand-navy rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
                       <img src="/screens/train.png" alt="Students" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent" />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* COMMUNITY LAB */}
        <section id="community" className="max-w-7xl mx-auto px-6 py-40">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10">
              <h2 className="text-[3.5rem] md:text-ui-l font-black leading-[0.9] uppercase tracking-tighter">
                The <span className="text-brand-yellow">Community</span> <br />Lab
              </h2>
              <p className="text-ui-m text-brand-text-dim font-medium leading-relaxed max-w-lg">
                HelloBrick is powered by builders like you. Every verified scan and shared MOC makes the platform smarter for everyone.
              </p>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-navy-light flex items-center justify-center shrink-0 border border-white/10">
                    <Users className="w-6 h-6 text-brand-orange" />
                  </div>
                  <div>
                    <h4 className="text-ui-m font-bold mb-2 uppercase tracking-wide">Verify & Earn</h4>
                    <p className="text-ui-s text-brand-text-dim font-bold uppercase tracking-widest opacity-70">Earn XP and contribute to the world's most accurate detection engine.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-navy-light flex items-center justify-center shrink-0 border border-white/10">
                    <Trophy className="w-6 h-6 text-brand-yellow" />
                  </div>
                  <div>
                    <h4 className="text-ui-m font-bold mb-2 uppercase tracking-wide">Daily Quests</h4>
                    <p className="text-ui-s text-brand-text-dim font-bold uppercase tracking-widest opacity-70">Complete building challenges and unlock exclusive MOC guides.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-brand-navy-light p-12 rounded-[4rem] border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 blur-3xl rounded-full" />
               <div className="relative z-10 space-y-8">
                  <div className="text-[4rem] font-serif italic text-white/5 select-none leading-none">Our Mission.</div>
                  <div className="bg-brand-navy/50 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                     <p className="text-ui-m font-bold leading-relaxed italic text-white/90 mb-8 font-serif">
                       "We believe every brick has a second life. Our goal is to make sure no piece is ever truly lost in the pile."
                     </p>
                     <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center font-black text-brand-navy text-ui-s shadow-lg">HB</div>
                       <div className="text-ui-s font-black uppercase tracking-[0.2em] text-brand-text-dim">HelloBrick Founders</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* BLOG PREVIEW */}
        <section id="blog" className="py-32 bg-brand-navy-light/20 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="space-y-4">
                <h2 className="text-[3.5rem] font-bold uppercase tracking-tight leading-none mb-4">Tips for <br /><span className="text-brand-orange font-serif italic lowercase">Builders</span></h2>
                <p className="text-brand-text-dim text-ui-m font-medium max-w-md italic">Expert guides on sorting, scanning, and organizing your vault.</p>
              </div>
              <Link to="/blog" className="px-8 py-3 rounded-full bg-white/5 text-white text-ui-s font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
                View All Guides
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <BlogCard 
                category="Sorting & Scanning"
                title="Organize loose bricks without sorting for hours"
                date="Mar 19, 2026"
              />
              <BlogCard 
                category="Build Ideas"
                title="What to build with random bricks you already own"
                date="Mar 17, 2026"
              />
              <BlogCard 
                category="Collection Tips"
                title="How to track your brick collection digitally"
                date="Mar 15, 2026"
              />
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-7xl mx-auto px-6 py-40">
          <div className="bg-gradient-to-br from-brand-orange via-brand-orange to-red-600 p-1 rounded-[4rem] shadow-[0_0_80px_rgba(255,122,48,0.2)]">
            <div className="bg-brand-navy rounded-[3.9rem] p-16 md:p-32 text-center space-y-12 relative overflow-hidden">
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />
               
               <h2 className="text-[4rem] md:text-ui-l font-black leading-[0.8] uppercase tracking-tighter relative z-10 mb-8">
                 Sort your bricks. <br /> <span className="text-brand-orange font-serif italic lowercase">Build</span> more.
               </h2>
               <p className="text-ui-m text-brand-text-dim max-w-2xl mx-auto font-medium relative z-10 italic">
                 Join thousands of builders already reclaiming their collections with HelloBrick.
               </p>
               
               <div className="flex flex-col items-center gap-8 relative z-10">
                  <a href="https://apps.apple.com/us/app/hellobrick/id6760016096" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white text-black px-10 py-5 rounded-[2rem] hover:bg-brand-yellow hover:scale-105 transition-all group shadow-2xl">
                    <Download className="w-8 h-8" />
                    <div className="text-left leading-tight">
                       <div className="text-ui-s font-bold uppercase opacity-60 mb-1">Download on the</div>
                       <div className="text-[24px] font-black">App Store</div>
                    </div>
                  </a>
                  <p className="text-ui-s font-black uppercase tracking-[0.5em] text-white/30 italic">Now live on iOS & iPadOS</p>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <Logo size="md" className="justify-center" />
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-ui-s font-black uppercase tracking-[0.3em] text-brand-text-dim">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/support" className="hover:text-white transition-colors">Support</Link>
            <Link to="/education" className="hover:text-brand-yellow transition-colors">Education</Link>
          </div>
          <div className="space-y-4">
             <p className="text-ui-s text-white/20 font-black uppercase tracking-[0.4em] max-w-xl mx-auto leading-relaxed italic">
               Hellobrick is an independent companion platform. <br /> LEGO® is a trademark of the LEGO Group.
             </p>
             <p className="text-ui-s text-white/10 font-bold uppercase tracking-widest">© 2026 HelloBrick Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
