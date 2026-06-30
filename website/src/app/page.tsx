"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Apple, Camera, Cpu, Layers, Star, Zap } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

function Section({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <section className={`py-20 md:py-32 px-6 ${className}`} style={style}>
      <div className="max-w-[1100px] mx-auto">{children}</div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-white font-sans overflow-x-hidden"
      style={{ color: "#111111" }}
    >
      {/* NAV */}
      <nav
        className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100"
      >
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#FF7A30" }}
            >
              <Layers className="text-white w-5 h-5" />
            </div>
            HelloBrick
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/blog"
              className="text-sm font-bold text-slate-500 hover:text-black transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/login"
              className="text-sm font-bold text-slate-500 hover:text-black transition-colors"
            >
              Sign In
            </Link>
            <a
              href="https://apps.apple.com/app/hellobrick"
              className="flex items-center gap-2 text-white text-sm font-black px-4 py-2 rounded-xl hover:scale-[1.03] active:scale-[0.98] transition-all"
              style={{ background: "#111111" }}
            >
              <Apple className="w-4 h-4 fill-current" />
              Download
            </a>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="pt-36 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-[1100px] mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h1 className="text-[48px] md:text-[64px] font-black tracking-tight leading-[1.05] mb-6">
              Turn your brick pile into <br className="hidden md:block" />
              something you can actually build
            </h1>
            <p className="text-[18px] md:text-[20px] font-medium mb-10 max-w-[600px] mx-auto" style={{ color: "#64748B" }}>
              Scan your bricks and get real build ideas — instantly
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <a
                href="https://apps.apple.com/app/hellobrick"
                className="group flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-black text-[17px] hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl"
                style={{ background: "#111111", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
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
            <div
              className="aspect-[16/10] rounded-[40px] overflow-hidden border border-slate-100 shadow-2xl relative"
              style={{ background: "#F8FAFC" }}
            >
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
      <section className="overflow-hidden" style={{ background: "#111111", paddingTop: 0, paddingBottom: 0 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="relative aspect-square md:aspect-auto min-h-[400px] flex items-center justify-center" style={{ background: "#1a1a1a" }}>
            <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <span className="text-white font-black text-sm uppercase tracking-widest">From this 👇</span>
            </div>
            <Camera className="w-20 h-20 text-white/20" />
          </div>
          <div className="relative aspect-square md:aspect-auto min-h-[400px] flex items-center justify-center" style={{ background: "#222" }}>
            <div className="absolute top-8 right-8 px-4 py-2 rounded-full border border-white/20" style={{ background: "#FF7A30" }}>
              <span className="text-white font-black text-sm uppercase tracking-widest">To this 👇</span>
            </div>
            <Zap className="w-20 h-20 text-white/20" />
          </div>
        </div>
      </section>

      {/* 3. PROBLEM → SOLUTION */}
      <Section className="text-center">
        <motion.div {...fadeInUp}>
          <h2 className="text-[32px] md:text-[48px] font-black tracking-tight mb-6 max-w-[800px] mx-auto">
            Most brick collections sit unused
          </h2>
          <p className="text-[18px] md:text-[22px] font-medium leading-relaxed max-w-[700px] mx-auto" style={{ color: "#64748B" }}>
            HelloBrick shows you exactly what you can build — without sorting or guessing
          </p>
        </motion.div>
      </Section>

      {/* 4. HOW IT WORKS */}
      <Section className="rounded-[48px] my-10" style={{ background: "#F8FAFC" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { icon: Camera, title: "Scan your bricks", desc: "Just point your camera at your messy pile." },
            { icon: Cpu, title: "Detect what you have", desc: "Identify every brick in seconds." },
            { icon: Zap, title: "Get build ideas", desc: "Start building instantly with what&apos;s in front of you." },
          ].map((step, i) => (
            <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <step.icon className="w-8 h-8" style={{ color: "#FF7A30" }} />
              </div>
              <h3 className="text-[20px] font-black mb-2">{step.title}</h3>
              <p className="font-medium" style={{ color: "#64748B" }}>{step.desc}</p>
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
            <p className="text-[18px] md:text-[20px] font-medium leading-relaxed" style={{ color: "#64748B" }}>
              No need to organise. No perfect sets required. Just throw them on the table and scan.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <div className="rounded-[32px] overflow-hidden border border-slate-100 shadow-2xl aspect-video flex items-center justify-center" style={{ background: "#F8FAFC" }}>
              <Camera className="w-16 h-16 text-slate-300" />
            </div>
          </div>
        </div>
      </Section>

      {/* 6. USE CASES */}
      <Section className="rounded-[48px] my-10 text-white" style={{ background: "#111111" }}>
        <div className="text-center mb-16">
          <h2 className="text-[32px] md:text-[48px] font-black tracking-tight">Perfect for:</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Random Collections", desc: "Mixed bricks from years of building." },
            { title: "Bored Kids", desc: "When they don't know what to build next." },
            { title: "Anyone Else", desc: "Who wants to build something new today." },
          ].map((use, i) => (
            <div key={i} className="p-8 rounded-3xl text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 className="text-[18px] font-black mb-2">{use.title}</h3>
              <p className="font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{use.desc}</p>
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
            { quote: "So much easier than figuring it out myself", author: "James, Designer" },
          ].map((test, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              className="p-10 rounded-[32px] border border-slate-100"
              style={{ background: "#F8FAFC" }}
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5" style={{ fill: "#FF7A30", color: "#FF7A30" }} />
                ))}
              </div>
              <p className="text-[18px] font-bold italic mb-6 leading-relaxed">&ldquo;{test.quote}&rdquo;</p>
              <p className="font-black text-sm uppercase tracking-widest" style={{ color: "#64748B" }}>{test.author}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 8. PRODUCT UI SHOWCASE */}
      <section className="py-20 md:py-32 overflow-hidden" style={{ background: "#F8FAFC" }}>
        <div className="max-w-[1100px] mx-auto px-6 mb-16 text-center">
          <h2 className="text-[32px] md:text-[48px] font-black tracking-tight mb-4">
            Simple. Fast. Works instantly.
          </h2>
        </div>
        <div className="flex gap-8 px-6 overflow-x-auto pb-10" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] md:w-[320px] aspect-[9/19] rounded-[40px] overflow-hidden flex items-center justify-center"
              style={{ background: "#111111", border: "8px solid #111111" }}
            >
              <Camera className="w-12 h-12 text-white/20" />
            </div>
          ))}
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <Section className="text-center" style={{ paddingTop: "10rem", paddingBottom: "10rem" }}>
        <motion.div {...fadeInUp}>
          <h2 className="text-[40px] md:text-[64px] font-black tracking-tight mb-6">
            Find out what your <br /> bricks can build
          </h2>
          <p className="text-[18px] md:text-[20px] font-medium mb-12" style={{ color: "#64748B" }}>
            Download HelloBrick and start building today
          </p>
          <a
            href="https://apps.apple.com/app/hellobrick"
            className="inline-flex items-center gap-3 text-white px-10 py-5 rounded-2xl font-black text-[20px] hover:scale-[1.03] active:scale-[0.98] transition-all shadow-2xl"
            style={{ background: "#111111", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}
          >
            <Apple className="w-7 h-7 fill-current" />
            Download Now
          </a>
        </motion.div>
      </Section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FF7A30" }}>
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter" style={{ color: "#111111" }}>HelloBrick</span>
          </div>
          <div className="flex gap-8 font-bold text-sm" style={{ color: "#64748B" }}>
            <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-black transition-colors">Support</Link>
          </div>
          <p className="text-sm font-medium" style={{ color: "#64748B" }}>© 2026 HelloBrick. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
