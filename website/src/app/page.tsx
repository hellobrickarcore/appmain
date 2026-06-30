"use client";

import { motion } from "framer-motion";
import { Menu, Globe, Scan, Shield, Search, Check, ArrowRight, Calendar, User, Twitter, Disc } from "lucide-react";

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#FFCE4A] rounded-xl flex items-center justify-center p-1.5 shadow-md">
          <div className="w-full h-full bg-[#FF7A30] rounded-lg flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-black/20 rounded-full" />
            <div className="w-1.5 h-1.5 bg-black/20 rounded-full" />
          </div>
        </div>
        <span className="font-display font-bold text-2xl tracking-tighter text-[#050A18]">HelloBrick</span>
      </div>

      <div className="hidden md:flex flex-1 justify-center items-center gap-8 text-[15px] font-bold text-gray-700">
        <a href="#features" className="hover:text-[#FF7A30] transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-[#FF7A30] transition-colors">How it Works</a>
        <a href="#pro" className="hover:text-[#FF7A30] transition-colors">HelloBrick Pro</a>
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-gray-50">
          <Globe className="w-4 h-4 text-[#FF7A30]" />
          <span>EN</span>
        </button>
        <a
          href="https://apps.apple.com/app/id6760016096"
          className="bg-[#FF7A30] text-white px-6 py-3 rounded-full font-bold hover:bg-[#E66620] transition-colors shadow-lg"
          style={{ boxShadow: "0 8px 20px rgba(255,122,48,0.2)" }}
        >
          Get App
        </a>
        <button className="md:hidden">
          <Menu className="w-6 h-6 text-[#050A18]" />
        </button>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function BrickCluster({ color, style, studs = 2 }: { color: string; style?: React.CSSProperties; studs?: number }) {
  return (
    <motion.div
      className="absolute flex items-center justify-center rounded-full px-4 py-2"
      style={{ backgroundColor: color, ...style }}
      animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
      transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="flex gap-2">
        {Array.from({ length: studs }).map((_, i) => (
          <div key={i} className="w-4 h-4 bg-black/10 rounded-full border border-white/10 shadow-inner" />
        ))}
      </div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="relative pt-40 pb-24 px-6 min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 md:opacity-100">
        <BrickCluster color="#FFCE4A" studs={3} style={{ top: "12%", left: "8%", transform: "rotate(-15deg)" }} />
        <BrickCluster color="#FF4D80" studs={2} style={{ top: "22%", left: "22%", transform: "scale(1.4) rotate(10deg)" }} />
        <BrickCluster color="#00C2FF" studs={2} style={{ top: "28%", right: "12%", transform: "scale(1.6) rotate(-5deg)" }} />
        <BrickCluster color="#FF7A30" studs={1} style={{ top: "58%", left: "12%", transform: "scale(1.2)" }} />
        <BrickCluster color="#22D35A" studs={2} style={{ top: "68%", right: "18%", transform: "scale(1.3) rotate(20deg)" }} />
        <BrickCluster color="#0F4CFF" studs={2} style={{ top: "8%", right: "32%", transform: "scale(0.9) rotate(45deg)" }} />
        <BrickCluster color="#FFCE4A" studs={2} style={{ top: "78%", left: "32%", transform: "scale(1.5) rotate(-10deg)" }} />
        <BrickCluster color="#FF4D80" studs={2} style={{ top: "48%", right: "4%", transform: "scale(1.1) rotate(15deg)" }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center mt-12 mb-16">
        <motion.h1
          className="font-display text-[56px] md:text-[88px] leading-[1.05] tracking-tight font-bold mb-6 text-[#050A18]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Turn your brick pile into <br /> something you can actually build.
        </motion.h1>

        <motion.p
          className="text-lg md:text-2xl text-gray-600 max-w-2xl mx-auto font-medium mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Scan your bricks and get real build ideas — instantly. <br className="hidden md:block" /> No sorting required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-6"
        >
          <a
            href="https://apps.apple.com/app/id6760016096"
            className="flex items-center gap-4 bg-[#050A18] text-white px-8 py-5 rounded-[24px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl group"
          >
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1.5 shrink-0">
              <div className="w-full h-full bg-[#FFCE4A] rounded-lg relative flex items-center justify-center p-1">
                <div className="w-full h-full bg-[#FF7A30] rounded-sm flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-black/20 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-black/20 rounded-full" />
                </div>
              </div>
            </div>
            <div className="text-left pr-4">
              <div className="text-white/60 text-xs font-bold uppercase tracking-widest">Download App</div>
              <div className="text-xl font-bold">Available on iOS</div>
            </div>
          </a>

          <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Works with mixed bricks
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Visual Proof ─────────────────────────────────────────────────────────────
function VisualProof() {
  return (
    <section className="bg-[#111111] py-0 overflow-hidden w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="relative aspect-square md:aspect-auto h-full min-h-[500px] bg-[#1a1a1a] flex items-center justify-center">
          <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
            <span className="text-white font-bold text-lg uppercase tracking-widest">From this 👇</span>
          </div>
          <div className="text-white/10 text-[120px] select-none">🧱</div>
        </div>
        <div className="relative aspect-square md:aspect-auto h-full min-h-[500px] bg-[#222] flex items-center justify-center">
          <div className="absolute top-8 right-8 bg-[#FF5A00] backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
            <span className="text-white font-bold text-lg uppercase tracking-widest">To this 👇</span>
          </div>
          <div className="text-white/10 text-[120px] select-none">🚀</div>
        </div>
      </div>
    </section>
  );
}

// ─── Bento Value Props ────────────────────────────────────────────────────────
function BentoValueProps() {
  return (
    <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="max-w-3xl mb-12">
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          When you scan your bricks, you unlock endless creativity
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 – Orange */}
        <div className="bg-[#FF7A30] text-white rounded-[32px] p-8 md:p-10 flex flex-col min-h-[440px] relative overflow-hidden group">
          <div className="relative z-10 max-w-[240px]">
            <h3 className="text-[26px] leading-[1.15] font-medium tracking-tight">
              Scan in seconds, right from your phone. No special hardware needed.
            </h3>
          </div>
          <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#E66620] rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />
          <div className="mt-auto relative z-10 flex items-center justify-between">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Scan className="w-8 h-8 text-white" />
            </div>
            <div className="w-20 h-20 bg-[#FFCE4A] rounded-full flex items-center justify-center p-3 animate-pulse">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-black/40 rounded-full" />
                <div className="w-3 h-3 bg-black/40 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 – Yellow */}
        <div className="bg-[#FFCE4A] text-[#111827] rounded-[32px] p-8 md:p-10 flex flex-col min-h-[440px] relative overflow-hidden group">
          <div className="relative z-10 max-w-[240px]">
            <h3 className="text-[26px] leading-[1.15] font-medium tracking-tight">
              Detect every brick accurately, right from the pile.
            </h3>
          </div>
          <div className="mt-auto relative z-10 flex justify-center pb-4">
            <div className="relative">
              <div className="w-32 h-32 bg-[#FF7A30] rounded-t-full rounded-b-3xl relative flex items-center justify-center">
                <div className="flex gap-4 mb-4">
                  <div className="w-6 h-8 bg-white rounded-full" />
                  <div className="w-6 h-8 bg-white rounded-full" />
                </div>
                <div className="absolute -left-6 bottom-4 w-12 h-12 bg-[#FF2E93] rounded-full flex items-center justify-center">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-black/40 rounded-full" />
                    <div className="w-2 h-2 bg-black/40 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -top-8 text-[#FF2E93] text-4xl">✨</div>
            </div>
          </div>
        </div>

        {/* Card 3 – Red */}
        <div className="bg-[#FF453A] text-white rounded-[32px] p-8 md:p-10 flex flex-col min-h-[440px] relative overflow-hidden group">
          <div className="relative z-10 max-w-[240px]">
            <h3 className="text-[26px] leading-[1.15] font-medium tracking-tight">
              Find 1000+ ideas before you even start building anything.
            </h3>
          </div>
          <div className="mt-auto relative z-10 space-y-3">
            <div className="h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center px-4 relative overflow-hidden">
              <div className="w-10 h-10 bg-[#FFCE4A] rounded-full flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-black" />
              </div>
              <div className="ml-4 h-2 w-24 bg-white/40 rounded-full" />
            </div>
            <div className="h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center px-4 justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
                  <div className="w-5 h-5 bg-gray-200 rounded-full" />
                </div>
                <div className="ml-4 h-2 w-16 bg-white/40 rounded-full" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#FFCE4A] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Asymmetric Bento ─────────────────────────────────────────────────────────
function AsymmetricBento() {
  return (
    <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2 text-[#050A18]">
          Scan in seconds. <br /> Find out what you can build.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Tall Card */}
        <div className="bg-[#FF7A30] rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-end min-h-[600px]">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 10px 10px, white 4px, transparent 0)", backgroundSize: "40px 40px" }} />
          <div className="relative z-10 w-[280px] h-[480px] bg-white rounded-t-[40px] rounded-b-none border-x-8 border-t-8 border-[#050A18] shadow-2xl overflow-hidden mt-12 pt-6 px-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#050A18] rounded-b-xl" />
            <div className="flex flex-col items-center mt-12 gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow flex items-center justify-center p-3">
                  <div className="w-full h-full bg-[#FFCE4A] rounded-full" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FF7A30] rounded-full border-2 border-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
              <h4 className="font-display font-medium text-lg text-center">Detecting Bricks...</h4>
              <div className="w-16 h-16 rounded-full border-4 border-orange-100 border-t-[#FF7A30] animate-spin mt-10" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-orange-50 rounded-[32px] p-8 md:p-10 flex-1">
            <h3 className="text-xl font-semibold mb-3">Works with messy, mixed piles</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">No need to organize. No perfect sets required. Just throw your bricks on the table and scan.</p>
            <ul className="space-y-4 mb-8">
              {["Discover new builds in seconds", "No manual sorting required", "Scan once, build anywhere"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px] font-medium text-gray-800">
                  <Check className="w-5 h-5 text-[#FF7A30]" />
                  {item}
                </li>
              ))}
            </ul>
            <a href="https://apps.apple.com/app/id6760016096" className="inline-flex items-center font-medium text-[#FF7A30] hover:text-[#E66620] transition-colors gap-1">
              Start building <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
            <div className="bg-[#FFCE4A]/20 rounded-[32px] p-8">
              <h3 className="text-xl font-semibold mb-3">Perfect for Parents</h3>
              <p className="text-gray-700 text-sm mb-6 leading-relaxed">Save hours of sorting and keep the kids entertained with new build ideas from their collection.</p>
              <ul className="space-y-3 mb-6">
                {["Instant build guides", "No new sets needed"].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-gray-800">
                    <Check className="w-4 h-4 text-[#FF7A30] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="https://apps.apple.com/app/id6760016096" className="inline-flex items-center font-medium text-[#FF7A30] hover:text-[#E66620] text-sm gap-1">
                Download Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>

            <div id="pro" className="bg-[#FFCE4A] rounded-[32px] overflow-hidden relative min-h-[250px]">
              <div className="absolute inset-0 bg-[#FFCE4A]" style={{ backgroundImage: "radial-gradient(circle at 10px 10px, rgba(0,0,0,0.05) 6px, transparent 0)", backgroundSize: "30px 30px" }} />
              <div className="absolute top-10 left-6 right-0 bottom-0 bg-white rounded-tl-[24px] shadow-xl p-5 border-t border-l border-white/40">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#FF7A30] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="font-display font-medium text-sm">HelloBrick Pro</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { letter: "S", label: "Space Shuttle", color: "#FF7A30" },
                    { letter: "C", label: "Racing Car", color: "#050A18" },
                  ].map(({ letter, label, color }) => (
                    <div key={label} className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: color }}>{letter}</div>
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <Check className="w-4 h-4 text-[#FF7A30]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Subscribe ────────────────────────────────────────────────────────────────
function Subscribe() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto text-center">
      <h2 className="font-display text-[48px] md:text-[64px] font-bold tracking-tight mb-8">Ready to start building?</h2>
      <div className="relative rounded-[48px] overflow-hidden flex flex-col items-center justify-center p-12 md:p-24 bg-[#FF7A30]">
        <div className="absolute inset-0 w-full h-full opacity-50">
          <svg className="w-full h-full object-cover" preserveAspectRatio="none" viewBox="0 0 1000 200">
            <path d="M0,0 L200,0 C300,100 300,100 400,200 L0,200 Z" fill="#FF4D80" />
            <path d="M1000,0 L800,0 C700,100 700,100 600,200 L1000,200 Z" fill="#FF5A00" />
          </svg>
        </div>
        <div className="relative z-10 space-y-8">
          <p className="text-white/80 text-xl font-medium max-w-lg mx-auto">
            Join thousands of builders who use HelloBrick to unlock their collections.
          </p>
          <a href="https://apps.apple.com/app/id6760016096" className="inline-block bg-white text-[#FF7A30] px-12 py-5 rounded-full font-bold text-xl hover:bg-gray-50 transition-colors shadow-2xl">
            Download on the App Store
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
const POSTS = [
  { slug: "hellobrick-vs-brickit-the-ultimate-comparison", title: "HelloBrick vs. Brickit: Which LEGO Scanner App is Best?", excerpt: "We compare the top LEGO recognition apps of 2026. See how HelloBrick's new YOLO-powered engine stacks up against the competition.", date: "May 4, 2026", author: "HelloBrick Team", category: "Comparisons" },
  { slug: "how-to-identify-lego-bricks-without-sorting", title: "How to Identify LEGO Bricks in Seconds (No Sorting Required)", excerpt: "Stop wasting hours sorting your collection. Learn how AI-powered scanning can turn your messy pile into a master build instantly.", date: "May 3, 2026", author: "Brick Expert", category: "Tutorials" },
  { slug: "top-10-lego-moc-ideas-for-random-collections", title: "Top 10 LEGO MOC Ideas for Your Random Brick Collection", excerpt: "Unlock the potential of your loose bricks. From micro-scale space ships to architectural landmarks, here's what you can build today.", date: "May 2, 2026", author: "Master Builder", category: "Inspiration" },
];

function BlogSection() {
  return (
    <section id="blog" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4">The Builder&apos;s Journal</h2>
          <p className="text-xl text-gray-600">Latest news, building tips, and LEGO AI technology updates.</p>
        </div>
        <a href="/blog" className="bg-[#FF7A30] text-white px-8 py-3 rounded-full font-bold hover:bg-[#E66620] transition-colors">
          View All Posts
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {POSTS.map((post, i) => (
          <article key={i} className="group cursor-pointer">
            <div className="aspect-[16/10] bg-gray-100 rounded-[32px] mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-[#FFCE4A]/10 group-hover:bg-[#FFCE4A]/20 transition-colors" />
              <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[#FF7A30]">
                {post.category}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.date}</span>
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</span>
            </div>
            <h3 className="text-2xl font-bold leading-tight mb-4 group-hover:text-[#FF7A30] transition-colors">{post.title}</h3>
            <p className="text-gray-600 mb-6 line-clamp-2">{post.excerpt}</p>
            <a href={`/blog/${post.slug}`} className="inline-flex items-center font-bold text-[#FF7A30] group-hover:gap-2 transition-all">
              Read More <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#050A18] text-white pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 justify-between mb-20">
        <div className="flex-1 max-w-sm">
          <h2 className="font-display text-3xl font-bold mb-6">Get inspired,<br />get building</h2>
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 flex items-center gap-6 mb-8 w-fit relative overflow-hidden group hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-2">
              <div className="w-full h-full bg-[#FFCE4A] rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 bg-[#FF7A30] rounded-md flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-black/20 rounded-full" />
                  <div className="w-2 h-2 bg-black/20 rounded-full" />
                </div>
              </div>
            </div>
            <div>
              <div className="font-bold text-lg mb-1">Download App</div>
              <div className="text-white/60 text-sm">Available on<br />iOS</div>
            </div>
          </div>
          <div className="flex gap-4">
            <a href="https://twitter.com/hellobrick" className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-[#FF7A30] transition-all">
              <Twitter className="w-5 h-5" fill="currentColor" />
            </a>
            <a href="https://discord.gg/hellobrick" className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-[#FF7A30] transition-all">
              <Disc className="w-5 h-5" fill="currentColor" />
            </a>
          </div>
        </div>

        <div className="flex-[2] flex flex-wrap gap-12 md:justify-around">
          <div>
            <h4 className="text-[#FFCE4A] font-bold mb-6 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-4 font-medium">
              <li><a href="#features" className="hover:text-[#FF7A30] transition-colors">Features</a></li>
              <li><a href="#pro" className="hover:text-[#FF7A30] transition-colors">HelloBrick Pro</a></li>
              <li><a href="https://apps.apple.com/app/id6760016096" className="hover:text-[#FF7A30] transition-colors">Download</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#FFCE4A] font-bold mb-6 uppercase tracking-wider text-xs">Support</h4>
            <ul className="space-y-4 font-medium">
              <li><a href="https://hellobrick.app/support" className="hover:text-[#FF7A30] transition-colors">Help Center</a></li>
              <li><a href="mailto:support@hellobrick.app" className="hover:text-[#FF7A30] transition-colors">Contact Us</a></li>
              <li><a href="https://hellobrick.app/faq" className="hover:text-[#FF7A30] transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#FFCE4A] font-bold mb-6 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4 font-medium">
              <li><a href="https://hellobrick.app/privacy" className="hover:text-[#FF7A30] transition-colors">Privacy Policy</a></li>
              <li><a href="https://hellobrick.app/terms" className="hover:text-[#FF7A30] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
        <div className="flex items-center gap-2 font-display font-bold text-xl text-white">
          <div className="w-8 h-8 bg-[#FF7A30] rounded-lg flex items-center justify-center text-white text-sm">H</div>
          HelloBrick
        </div>
        <p className="text-center md:text-right">© {new Date().getFullYear()} HelloBrick. All rights reserved. Made for brick builders.</p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white scroll-smooth" style={{ fontFamily: "Inter, sans-serif", color: "#111827" }}>
      <Navbar />
      <Hero />
      <VisualProof />
      <div id="features"><BentoValueProps /></div>
      <div id="how-it-works"><AsymmetricBento /></div>
      <Subscribe />
      <BlogSection />
      <Footer />
    </div>
  );
}
