import React from 'react';
import { motion } from 'framer-motion';
import { Apple, Camera, Cpu, Layers, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
};

const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={`py-20 md:py-32 px-6 ${className}`}>
    <div className="max-w-[1100px] mx-auto">
      {children}
    </div>
  </section>
);

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-[#111111] selection:bg-brand-orange selection:text-white overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="pt-24 pb-20 md:pt-40 md:pb-32 px-6">
        <div className="max-w-[1100px] mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h1 className="text-[48px] md:text-[64px] font-black tracking-tight leading-[1.05] mb-6">
              Turn your brick pile into <br className="hidden md:block" />
              something you can actually build
            </h1>
            <p className="text-[18px] md:text-[20px] text-[#64748B] font-medium mb-10 max-w-[600px] mx-auto">
              Scan your bricks and get real build ideas — instantly
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <a 
                href="https://apps.apple.com/app/hellobrick" 
                className="group flex items-center gap-3 bg-[#111111] text-white px-8 py-4 rounded-2xl font-black text-[17px] hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
              >
                <Apple className="w-6 h-6 fill-current" />
                Download on the App Store
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative max-w-[800px] mx-auto"
          >
            <div className="aspect-[16/10] bg-slate-50 rounded-[40px] overflow-hidden border border-slate-100 shadow-2xl relative">
              <img 
                src="/images/messy_pile.png" 
                className="absolute inset-0 w-full h-full object-cover" 
                alt="Messy brick pile" 
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                 <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 shadow-2xl animate-pulse">
                    <Camera className="w-10 h-10 text-white" />
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. VISUAL PROOF */}
      <section className="bg-[#111111] py-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="relative aspect-square md:aspect-auto h-full min-h-[400px]">
            <img src="/images/messy_pile.png" className="absolute inset-0 w-full h-full object-cover" alt="Before" />
            <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <span className="text-white font-black text-sm uppercase tracking-widest">From this 👇</span>
            </div>
          </div>
          <div className="relative aspect-square md:aspect-auto h-full min-h-[400px]">
            <img src="/images/build_result.png" className="absolute inset-0 w-full h-full object-cover" alt="After" />
            <div className="absolute top-8 right-8 bg-brand-orange backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <span className="text-white font-black text-sm uppercase tracking-widest">To this 👇</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM -> SOLUTION */}
      <Section className="text-center">
        <motion.div {...fadeInUp}>
          <h2 className="text-[32px] md:text-[48px] font-black tracking-tight mb-6 max-w-[800px] mx-auto">
            Most brick collections sit unused
          </h2>
          <p className="text-[18px] md:text-[22px] text-[#64748B] font-medium leading-relaxed max-w-[700px] mx-auto">
            HelloBrick shows you exactly what you can build — without sorting or guessing
          </p>
        </motion.div>
      </Section>

      {/* 4. HOW IT WORKS */}
      <Section className="bg-slate-50 rounded-[48px] my-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { icon: Camera, title: "Scan your bricks", desc: "Just point your camera at your messy pile." },
            { icon: Cpu, title: "We detect what you have", desc: "Our AI identifies every brick in seconds." },
            { icon: Zap, title: "Get builds you can make", desc: "Start building instantly with what's in front of you." }
          ].map((step, i) => (
            <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-black/5 flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8 text-brand-orange" />
              </div>
              <h3 className="text-[20px] font-black mb-2">{step.title}</h3>
              <p className="text-[#64748B] font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 5. DIFFERENTIATION */}
      <Section>
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <h2 className="text-[32px] md:text-[48px] font-black tracking-tight mb-6">
              Works with messy, <br /> mixed bricks
            </h2>
            <p className="text-[18px] md:text-[20px] text-[#64748B] font-medium leading-relaxed">
              No need to organise. No perfect sets required. Just throw them on the table and scan.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <div className="rounded-[32px] overflow-hidden border border-slate-100 shadow-2xl">
              <img src="/images/messy_pile.png" className="w-full aspect-video object-cover" alt="Messy pile" />
            </div>
          </div>
        </div>
      </Section>

      {/* 6. USE CASES */}
      <Section className="bg-[#111111] text-white rounded-[48px] my-10">
        <div className="text-center mb-16">
          <h2 className="text-[32px] md:text-[48px] font-black tracking-tight">Perfect for:</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Random Collections", desc: "Mixed bricks from years of building." },
            { title: "Bored Kids", desc: "When they don't know what to build next." },
            { title: "Anyone Else", desc: "Who wants to build something new today." }
          ].map((use, i) => (
            <div key={i} className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
              <h3 className="text-[18px] font-black mb-2">{use.title}</h3>
              <p className="text-white/60 font-medium">{use.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 7. SOCIAL PROOF */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { quote: "This saved me hours sorting", author: "Sarah, Parent of two" },
            { quote: "My kids actually use their bricks again", author: "Mark, LEGO Fan" },
            { quote: "So much easier than figuring it out myself", author: "James, Designer" }
          ].map((test, i) => (
            <motion.div 
              key={i} 
              {...fadeInUp} 
              className="p-10 bg-slate-50 rounded-[32px] border border-slate-100"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-brand-orange text-brand-orange" />)}
              </div>
              <p className="text-[18px] font-bold italic mb-6 leading-relaxed">"{test.quote}"</p>
              <p className="text-[#64748B] font-black text-sm uppercase tracking-widest">{test.author}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 8. PRODUCT UI SHOWCASE */}
      <section className="py-20 md:py-32 overflow-hidden bg-slate-50">
        <div className="max-w-[1100px] mx-auto px-6 mb-16 text-center">
          <h2 className="text-[32px] md:text-[48px] font-black tracking-tight mb-4">Simple. Fast. Works instantly.</h2>
        </div>
        <div className="flex gap-8 px-6 overflow-x-auto no-scrollbar pb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[280px] md:w-[320px] aspect-[9/19] bg-[#111111] rounded-[40px] border-[8px] border-[#111111] shadow-2xl overflow-hidden">
               <img src={`/screens/screen-${i}.png`} className="w-full h-full object-cover opacity-90" alt={`Screen ${i}`} onError={(e) => {
                 (e.target as HTMLImageElement).src = '/images/build_result.png';
               }} />
            </div>
          ))}
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <Section className="text-center py-40">
        <motion.div {...fadeInUp}>
          <h2 className="text-[40px] md:text-[64px] font-black tracking-tight mb-6">
            Find out what your <br /> bricks can build
          </h2>
          <p className="text-[18px] md:text-[20px] text-[#64748B] font-medium mb-12">
            Download HelloBrick and start building today
          </p>
          <a 
            href="https://apps.apple.com/app/hellobrick" 
            className="inline-flex items-center gap-3 bg-[#111111] text-white px-10 py-5 rounded-2xl font-black text-[20px] hover:scale-[1.03] active:scale-[0.98] transition-all shadow-2xl shadow-black/20"
          >
            <Apple className="w-7 h-7 fill-current" />
            Download Now
          </a>
        </motion.div>
      </Section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
             </div>
             <span className="font-black text-xl tracking-tighter text-[#111111]">HelloBrick</span>
          </div>
          <div className="flex gap-8 text-[#64748B] font-bold text-sm">
            <Link to="/privacy" className="hover:text-[#111111] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#111111] transition-colors">Terms</Link>
            <Link to="/support" className="hover:text-[#111111] transition-colors">Support</Link>
          </div>
          <p className="text-[#64748B] text-sm font-medium">© 2026 HelloBrick. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
