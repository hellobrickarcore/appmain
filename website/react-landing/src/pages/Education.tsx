import React from 'react';
import { SectionEdu } from '../components/SectionEdu';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import { CheckCircle2, BookOpen, GraduationCap, Microscope, Layers, Users } from 'lucide-react';

export const Education: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-navy text-white font-sans selection:bg-brand-orange selection:text-white">
      {/* Education Header */}
      <nav className="fixed top-0 z-50 w-full bg-brand-navy/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-12 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size="md" light={true} showText={true} />
            <span className="text-brand-yellow font-serif italic text-ui-s ml-[-8px] mt-1 group-hover:translate-x-1 transition-transform">Edu</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-ui-s font-black uppercase tracking-widest text-brand-text-dim hover:text-white transition-colors">Home</Link>
            <a href="#curriculum" className="text-ui-s font-black uppercase tracking-widest text-brand-text-dim hover:text-white transition-colors">Curriculum</a>
            <a href="#plans" className="text-ui-s font-black uppercase tracking-widest text-brand-text-dim hover:text-white transition-colors">Plans</a>
          </div>

          <button className="px-6 py-2.5 rounded-xl bg-brand-yellow text-black text-ui-s font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(255,206,74,0.15)]">
            Request Demo
          </button>
        </div>
      </nav>

      <main className="pt-20">
        {/* Main Section */}
        <SectionEdu />
        
        {/* Value Props Section */}
        <section className="max-w-7xl mx-auto px-12 py-32 bg-brand-navy">
           <div className="text-center mb-24">
              <h2 className="font-serif text-[3.5rem] md:text-ui-l mb-8 leading-none">Designed for the <span className="italic text-brand-orange">modern</span> classroom.</h2>
              <p className="text-brand-text-dim text-ui-m max-w-2xl mx-auto font-medium">HelloBrick bridges the gap between physical building and digital engineering.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-6">
                 <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
                    <Microscope className="w-7 h-7" />
                 </div>
                 <h4 className="text-ui-m font-bold uppercase tracking-wide">Research-Backed</h4>
                 <p className="text-ui-s text-brand-text-dim font-bold uppercase tracking-widest opacity-70 leading-relaxed">Developed with educators to enhance spatial awareness and early engineering concepts through tactile play.</p>
              </div>
              <div className="space-y-6">
                 <div className="w-14 h-14 bg-brand-yellow/10 rounded-2xl flex items-center justify-center text-brand-yellow">
                    <Layers className="w-7 h-7" />
                 </div>
                 <h4 className="text-ui-m font-bold uppercase tracking-wide">Inventory Tools</h4>
                 <p className="text-ui-s text-brand-text-dim font-bold uppercase tracking-widest opacity-70 leading-relaxed">Instantly catalog shared brick collections. No more guessing what's in the bin or manual sorting lists.</p>
              </div>
              <div className="space-y-6">
                 <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white">
                    <Users className="w-7 h-7" />
                 </div>
                 <h4 className="text-ui-m font-bold uppercase tracking-wide">Collaboration</h4>
                 <p className="text-ui-s text-brand-text-dim font-bold uppercase tracking-widest opacity-70 leading-relaxed">Students work together on complex builds, with individual digital checklists showing where every part is located.</p>
              </div>
           </div>
        </section>

        {/* Curriculum Alignment */}
        <section id="curriculum" className="w-full bg-brand-navy-light/30 border-y border-white/5 py-32 group">
           <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy rounded-full border border-white/10 mb-8">
                     <GraduationCap className="w-4 h-4 text-brand-yellow" />
                     <span className="text-ui-s font-black uppercase tracking-widest text-brand-text-dim">Standards Aligned</span>
                  </div>
                  <h2 className="text-[3.5rem] md:text-ui-l font-black uppercase leading-[0.9] tracking-tighter mb-8">
                     Built for <span className="text-brand-yellow">NGSS</span> <br /> & Common Core.
                  </h2>
                  <p className="text-ui-m text-brand-text-dim font-medium leading-relaxed mb-10 max-w-lg">
                     Our platform is more than just a scanner. We provide a curriculum of building challenges that map directly to core STEM learning objectives.
                  </p>
                  <button className="flex items-center gap-4 text-white hover:text-brand-yellow transition-colors font-black uppercase tracking-widest text-ui-s group/btn">
                     Download Curriculum Map <BookOpen className="w-5 h-5 group-btn-hover:translate-x-2 transition-transform" />
                  </button>
               </div>
                            <div className="bg-brand-navy p-12 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-8 group-hover:border-brand-yellow/20 transition-all duration-700">
                  {[
                     { grade: "Grades K-2", goal: "ETS1-1: Problem Solving & Design Thinking" },
                     { grade: "Grades 3-5", goal: "ETS1-2: Identifying & Testing Solutions" },
                     { grade: "Middle School", goal: "ETS1-3: Iterative Design & Optimization" },
                     { grade: "High School", goal: "ETS1-4: Systems Engineering & Constraints" }
                  ].map((item, idx) => (
                     <div key={idx} className="flex gap-6 items-start pb-8 border-b border-white/5 last:border-0 last:pb-0">
                        <CheckCircle2 className="w-6 h-6 text-brand-yellow shrink-0 mt-1" />
                        <div>
                           <p className="text-ui-s font-black uppercase text-brand-orange tracking-[0.2em] mb-1">{item.grade}</p>
                           <p className="text-ui-m font-bold text-white uppercase tracking-tight">{item.goal}</p>
                        </div>
                     </div>
                  ))}
               </div>
           </div>
        </section>

        {/* Closing CTA */}
         <section id="plans" className="max-w-[1440px] mx-auto px-6 py-40">
            <div className="bg-brand-yellow rounded-[4rem] p-20 text-center space-y-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[120px] rounded-full pointer-events-none group-hover:bg-white/30 transition-all duration-1000" />
               <h2 className="text-[4rem] md:text-ui-l font-serif text-black leading-none mb-8 tracking-tighter">
                  Start <span className="italic text-white">inspiring</span> <br /> your students.
               </h2>
               <p className="text-black/70 text-ui-m font-bold max-w-2xl mx-auto italic uppercase tracking-widest">
                  Join 500+ schools using HelloBrick to revitalize their collections.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                  <a href="mailto:edu@hellobrick.app" className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-ui-s hover:scale-105 transition-all shadow-xl text-center">Contact School Sales</a>
                  <a href="https://apps.apple.com/us/app/hellobrick/id6760016096" target="_blank" rel="noopener noreferrer" className="bg-black/10 text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-ui-s hover:bg-black/20 transition-all text-center">Get Individual License</a>
               </div>
            </div>
         </section>
      </main>

      <footer className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-12 text-center space-y-12">
          <div className="flex items-center justify-center gap-3">
            <Logo size="sm" light={true} />
            <span className="font-black uppercase tracking-[0.3em] text-white/50 text-ui-s">HelloBrick Education</span>
          </div>
          <div className="flex flex-wrap justify-center gap-12 text-ui-s font-black uppercase tracking-[0.3em] text-brand-text-dim">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/support" className="hover:text-white transition-colors">Support</Link>
            <Link to="/" className="hover:text-white transition-colors text-brand-orange">Back to Core</Link>
          </div>
          <p className="text-ui-s text-white/10 font-black uppercase tracking-widest">© 2026 HelloBrick Education Inc.</p>
        </div>
      </footer>
    </div>
  );
};
