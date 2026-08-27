"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Menu, Scan, Check, ArrowRight, Calendar, User, X, Disc, 
  TrendingUp, Sparkles, Trophy, Bell, Share2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center p-2 shadow-md shadow-emerald-500/20">
          <Scan className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-gray-900">HelloBrick</span>
      </div>

      <div className="hidden lg:flex flex-1 justify-center items-center gap-8 text-[15px] font-semibold text-gray-600">
        <a href="#features" className="hover:text-emerald-600 transition-colors">AR Scanner</a>
        <a href="#portfolio" className="hover:text-emerald-600 transition-colors">Portfolio</a>
        <a href="#ideas" className="hover:text-emerald-600 transition-colors">What Can I Build</a>
        <a href="#comparison" className="hover:text-emerald-600 transition-colors">Why HelloBrick</a>
        <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pro</a>
        <a href="/blog" className="hover:text-emerald-600 transition-colors">Blog</a>
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <a href="/dashboard" className="hidden md:block font-semibold text-gray-700 hover:text-emerald-600 transition-colors">
            Dashboard
          </a>
        ) : (
          <a href="/login" className="hidden md:block font-semibold text-gray-700 hover:text-emerald-600 transition-colors">
            Sign In
          </a>
        )}
        <a
          href="https://apps.apple.com/app/id6760016096"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Get App</span>
          <ArrowRight className="w-4 h-4" />
        </a>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-6 flex flex-col gap-4 shadow-xl">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-gray-800">AR Scanner</a>
          <a href="#portfolio" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-gray-800">Portfolio Tracker</a>
          <a href="#ideas" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-gray-800">What Can I Build</a>
          <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-gray-800">Why HelloBrick</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-gray-800">HelloBrick Pro</a>
          <a href="/blog" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-gray-800">Blog</a>
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <a href="/dashboard" className="text-center py-3 font-semibold text-gray-700 bg-gray-50 rounded-xl">Open Web Dashboard</a>
            <a href="https://apps.apple.com/app/id6760016096" className="text-center py-3 font-bold text-white bg-emerald-500 rounded-xl shadow-md">Download on iOS</a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative pt-36 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-white">
      {/* Background Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-400/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 rounded-full text-emerald-800 text-sm font-semibold mb-8 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>The #1 AR Collectible Scanner &amp; Portfolio Tracker</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Instant <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Live AR Prices</span> <br className="hidden sm:block" />
          For Your LEGO® &amp; Collectibles.
        </motion.h1>

        {/* Subhead */}
        <motion.p
          className="text-lg md:text-2xl text-gray-600 max-w-3xl mx-auto font-normal mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Point your phone camera to see floating market values over sets, minifigures, and cards. Track your collection value, get retirement alerts, and discover what to build from loose bricks.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="https://apps.apple.com/app/id6760016096"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/15 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.93-2.84-.9.04-1.99.6-2.64 1.35-.58.65-1.09 1.71-.95 2.72.99.08 2.03-.5 2.66-1.23z"/>
              </svg>
            </div>
            <span>Download for iOS</span>
          </a>

          <a
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg shadow-sm hover:border-gray-300 transition-all"
          >
            <span>Open Web Dashboard</span>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </a>
        </motion.div>

        {/* Quick Highlights / Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-gray-200/80 max-w-4xl mx-auto text-left">
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900">15,000+</div>
            <div className="text-sm font-medium text-gray-500 mt-0.5">Sets &amp; Minifigures</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-600">Real-Time</div>
            <div className="text-sm font-medium text-gray-500 mt-0.5">AR Price Detection</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900">Sealed &amp; Used</div>
            <div className="text-sm font-medium text-gray-500 mt-0.5">Market Valuations</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900">AI MOC</div>
            <div className="text-sm font-medium text-gray-500 mt-0.5">Build Instructions</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Interactive AR Viewfinder Showcase ──────────────────────────────────────
function ARViewfinderShowcase() {
  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Hover. Scan. Know the value in milliseconds.
        </h2>
        <p className="text-lg text-gray-600">
          Our high-precision computer vision overlay projects live market values directly onto your shelf or table in augmented reality.
        </p>
      </div>

      {/* AR Mock Viewfinder Frame */}
      <div className="relative rounded-[32px] overflow-hidden bg-gray-900 shadow-2xl border border-gray-800 aspect-[16/10] max-h-[640px] flex flex-col justify-between p-6 sm:p-8 text-white">
        {/* Background Shelf Simulation */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-900/60 to-gray-950/90 z-0">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 20px 20px, rgba(255,255,255,0.15) 2px, transparent 0)", backgroundSize: "32px 32px" }} />
        </div>

        {/* Top AR Status Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-emerald-300">AR CAMERA ACTIVE</span>
          </div>

          {/* Batch Total Pill */}
          <div className="bg-emerald-500/90 backdrop-blur-md px-5 py-2 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-2 border border-emerald-400/40">
            <span className="font-extrabold text-sm sm:text-base">$1,589.98</span>
            <span className="text-emerald-100 text-xs sm:text-sm font-medium">· 3 items detected</span>
          </div>
        </div>

        {/* Center AR Floating Bounding Boxes */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 my-auto items-center">
          {/* Target 1 */}
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="border-2 border-emerald-400 rounded-2xl p-4 bg-emerald-500/10 backdrop-blur-sm relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-extrabold text-lg px-3.5 py-1 rounded-full shadow-md">
              $849.99
            </div>
            <div className="pt-2 text-center">
              <div className="font-bold text-sm text-white">UCS Millennium Falcon</div>
              <div className="text-xs text-gray-300 font-mono">#75192 · 7,541 pcs</div>
              <div className="flex justify-center gap-1.5 mt-2.5">
                <span className="bg-black/60 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">Sealed: $920</span>
                <span className="bg-black/60 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md">Used: $710</span>
              </div>
            </div>
          </motion.div>

          {/* Target 2 */}
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="border-2 border-emerald-400 rounded-2xl p-4 bg-emerald-500/10 backdrop-blur-sm relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-extrabold text-lg px-3.5 py-1 rounded-full shadow-md">
              $499.99
            </div>
            <div className="pt-2 text-center">
              <div className="font-bold text-sm text-white">Rivendell Icons</div>
              <div className="text-xs text-gray-300 font-mono">#10316 · 6,167 pcs</div>
              <div className="flex justify-center gap-1.5 mt-2.5">
                <span className="bg-black/60 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">Sealed: $540</span>
                <span className="bg-black/60 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md">Used: $420</span>
              </div>
            </div>
          </motion.div>

          {/* Target 3 */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="border-2 border-emerald-400 rounded-2xl p-4 bg-emerald-500/10 backdrop-blur-sm relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-extrabold text-lg px-3.5 py-1 rounded-full shadow-md">
              $240.00
            </div>
            <div className="pt-2 text-center">
              <div className="font-bold text-sm text-white">Cloud City Boba Fett</div>
              <div className="text-xs text-gray-300 font-mono">sw0107 · Rare Fig</div>
              <div className="flex justify-center gap-1.5 mt-2.5">
                <span className="bg-black/60 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">Mint: $2,100</span>
                <span className="bg-black/60 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md">Played: $850</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Detected Tray & 1-Tap Add Action */}
        <div className="relative z-10 bg-black/70 backdrop-blur-xl rounded-2xl p-3 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider pl-2">Detected:</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-semibold">Falcon #75192</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-semibold">Rivendell #10316</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-semibold">Boba Fett sw0107</span>
          </div>

          <a 
            href="https://apps.apple.com/app/id6760016096"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-center"
          >
            Add 3 to Collection
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Bento Features Grid ──────────────────────────────────────────────────────
function BentoFeatures() {
  return (
    <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest">Built For Collectors &amp; Builders</span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mt-2 mb-4">
          Everything you need to track, value, and build.
        </h2>
        <p className="text-lg text-gray-600">
          From stock-market style portfolio insights to AI build ideas for loose bricks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: AR Value Scanner */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Live AR Price Scanning</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Scan sets, rare minifigures, and collectible cards with live floating prices projected in real time. Batch scan entire shelves in seconds.
            </p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-sm font-semibold text-emerald-800 flex items-center justify-between">
            <span>Instant condition breakdown</span>
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* Card 2: Portfolio & Valuations */}
        <div id="portfolio" className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Portfolio Net Worth</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Track your collection like a stock portfolio. See total value, 24h changes, historical 1Y trends, sealed vs. used splits, and profit margins.
            </p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-sm font-semibold text-blue-800 flex items-center justify-between">
            <span>Multi-currency: USD, EUR, GBP, JPY</span>
            <Check className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        {/* Card 3: What Can I Build */}
        <div id="ideas" className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI &quot;What Can I Build&quot;</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Have tubs of unsorted bricks? Scan loose pieces and our AI instantly suggests custom MOC builds you can make right now with step-by-step guides.
            </p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 text-sm font-semibold text-purple-800 flex items-center justify-between">
            <span>1,000+ custom build recipes</span>
            <Check className="w-4 h-4 text-purple-600" />
          </div>
        </div>

        {/* Card 4: Smart Alerts */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Set Retirement Alerts</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Get push notifications before popular LEGO sets retire and aftermarket prices skyrocket. Never miss an investment window.
            </p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-sm font-semibold text-amber-800 flex items-center justify-between">
            <span>Target buy price triggers</span>
            <Check className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        {/* Card 5: Quests & Leaderboard */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-6">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Daily Quests &amp; Leaderboard</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Gamify your hobby! Earn XP for scanning, unlock rare achievement badges, keep daily streaks alive, and compete on the global podium.
            </p>
          </div>
          <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 text-sm font-semibold text-rose-800 flex items-center justify-between">
            <span>Streaks, XP &amp; rare badges</span>
            <Check className="w-4 h-4 text-rose-600" />
          </div>
        </div>

        {/* Card 6: Community Feed */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Collector Community</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Share your custom builds, show off your rarest holy grails, and connect with thousands of passionate AFOLs and collectors worldwide.
            </p>
          </div>
          <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100 text-sm font-semibold text-teal-800 flex items-center justify-between">
            <span>Tag sets &amp; share MOC photos</span>
            <Check className="w-4 h-4 text-teal-600" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Comparison Table: Beat Brickify ─────────────────────────────────────────
function ComparisonTable() {
  const rows = [
    { feature: "Live AR Floating Price HUD", hellobrick: true, brickify: false, brickit: false },
    { feature: "Batch Shelf Scanning (1-Tap Add)", hellobrick: true, brickify: true, brickit: false },
    { feature: "Sealed vs. Used Condition Pricing", hellobrick: true, brickify: true, brickit: false },
    { feature: "AI 'What Can I Build' Loose Brick Recipes", hellobrick: true, brickify: false, brickit: true },
    { feature: "Retirement & Price Drop Push Alerts", hellobrick: true, brickify: false, brickit: false },
    { feature: "Gamified Quests, XP & Global Leaderboards", hellobrick: true, brickify: false, brickit: false },
    { feature: "Community Social Feed & Custom Builds", hellobrick: true, brickify: false, brickit: false },
    { feature: "Multi-Currency Global Support (USD, EUR, GBP)", hellobrick: true, brickify: true, brickit: false },
  ];

  return (
    <section id="comparison" className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest">The Decisive Choice</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">
          How HelloBrick Outperforms the Rest
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          We combined the best of AR recognition, portfolio finance, and LEGO creativity into one unified platform.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-4 p-5 bg-gray-50/80 border-b border-gray-200 text-sm font-bold text-gray-700">
          <div className="col-span-1">Feature</div>
          <div className="text-center text-emerald-600 font-extrabold">HelloBrick</div>
          <div className="text-center text-gray-500">Brickify</div>
          <div className="text-center text-gray-500">Brickit</div>
        </div>

        <div className="divide-y divide-gray-100 text-sm font-medium">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-4 p-4.5 items-center hover:bg-gray-50/50 transition-colors">
              <div className="col-span-1 text-gray-900 font-semibold">{row.feature}</div>
              <div className="flex justify-center">
                {row.hellobrick ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                {row.brickify ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                {row.brickit ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HelloBrick Pro / Pricing ─────────────────────────────────────────────────
function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest">Transparent Value</span>
        <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
          Start Free. Upgrade to Pro when ready.
        </h2>
        <p className="text-gray-600">
          Everything you need to scan and organize your bricks is free forever.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Free Plan */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900 mb-1">Starter</div>
            <div className="text-gray-500 text-sm mb-6">Perfect for casual brick builders</div>
            <div className="text-4xl font-extrabold text-gray-900 mb-6">$0 <span className="text-base font-normal text-gray-500">/ forever</span></div>
            <ul className="space-y-3.5 text-sm text-gray-700 mb-8">
              {[
                "Unlimited basic brick scanning",
                "Up to 25 items in collection vault",
                "Current market price estimates",
                "Community feed browsing & sharing",
                "Basic 'What Can I Build' suggestions"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <a
            href="/dashboard"
            className="block text-center py-3.5 px-6 rounded-xl border border-gray-300 font-bold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            Get Started Free
          </a>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-b from-gray-900 to-black text-white rounded-3xl p-8 border border-gray-800 shadow-2xl relative flex flex-col justify-between">
          <div className="absolute -top-3.5 right-6 bg-emerald-500 text-white font-extrabold text-xs uppercase px-3 py-1 rounded-full shadow-md">
            Most Popular
          </div>
          <div>
            <div className="text-lg font-bold text-white mb-1">HelloBrick Pro</div>
            <div className="text-gray-400 text-sm mb-6">For serious AFOLs, collectors &amp; investors</div>
            <div className="text-4xl font-extrabold text-white mb-6">$6.99 <span className="text-base font-normal text-gray-400">/ month</span></div>
            <ul className="space-y-3.5 text-sm text-gray-300 mb-8">
              {[
                "Unlimited live AR batch scanning",
                "Unlimited collection vault & set logging",
                "Full historical price charts (1D to 5Y)",
                "Automated set retirement & price drop alerts",
                "Advanced AI MOC recipe generation",
                "Sealed vs. Used arbitrage valuation tools",
                "Priority cloud sync & backup"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <a
            href="https://apps.apple.com/app/id6760016096"
            className="block text-center py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all"
          >
            Start 14-Day Free Trial
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Download Banner ──────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-[36px] p-10 sm:p-16 text-white text-center relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Ready to unlock your collection?
          </h2>
          <p className="text-emerald-100 text-lg sm:text-xl mb-8 leading-relaxed">
            Join thousands of collectors tracking millions in LEGO® assets. Point your camera and see live values in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://apps.apple.com/app/id6760016096"
              className="w-full sm:w-auto bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl transition-all"
            >
              Download on iOS
            </a>
            <a
              href="/dashboard"
              className="w-full sm:w-auto bg-emerald-700/60 hover:bg-emerald-700 text-white font-bold text-lg px-8 py-4 rounded-2xl border border-white/20 transition-all"
            >
              Open Web App
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
const POSTS = [
  { slug: "hellobrick-vs-brickit-the-ultimate-comparison", title: "HelloBrick vs. Brickify & Brickit: The 2026 Comparison", excerpt: "Discover why HelloBrick's live AR floating price overlays and AI build generator make it the premier choice for serious collectors.", date: "May 2026", author: "HelloBrick Team", category: "Comparisons" },
  { slug: "how-to-identify-lego-bricks-without-sorting", title: "How to Value and Track LEGO Sets Like a Stock Portfolio", excerpt: "Stop guessing aftermarket prices. Learn how Sealed vs. Used price splits and retirement tracking maximize your collection's ROI.", date: "May 2026", author: "Brick Investor", category: "Guides" },
  { slug: "top-10-lego-moc-ideas-for-random-collections", title: "Top 10 AI-Generated MOC Builds From Random Brick Piles", excerpt: "Transform tubs of loose bricks into micro-castles, space stations, and classic speedsters with our instant piece-matching engine.", date: "May 2026", author: "Master Builder", category: "Inspiration" },
];

function BlogSection() {
  return (
    <section id="blog" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="max-w-2xl">
          <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest">Collector Insights</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-1">The Builder &amp; Collector Journal</h2>
        </div>
        <a href="/blog" className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1.5">
          <span>View All Articles</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {POSTS.map((post, i) => (
          <article key={i} className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
            <div>
              <div className="bg-emerald-50 text-emerald-700 font-bold text-xs uppercase px-3 py-1 rounded-full w-fit mb-4">
                {post.category}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors leading-snug">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {post.excerpt}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>{post.date}</span>
              <a href={`/blog/${post.slug}`} className="text-emerald-600 font-bold flex items-center gap-1">
                Read <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-gray-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 justify-between mb-16">
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-500/20">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">HelloBrick</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            The next-generation AI &amp; AR scanner and collectible tracking platform for LEGO® collectors, AFOLs, and builders worldwide.
          </p>
          <div className="flex gap-3">
            <a href="https://twitter.com/hellobrick" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all text-gray-300 hover:text-white">
              <X className="w-4 h-4" />
            </a>
            <a href="https://discord.gg/hellobrick" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all text-gray-300 hover:text-white">
              <Disc className="w-4 h-4" fill="currentColor" />
            </a>
          </div>
        </div>

        <div className="flex-[2] grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div>
            <h4 className="text-emerald-400 font-bold mb-5 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-3.5 text-sm text-gray-400 font-medium">
              <li><a href="#features" className="hover:text-white transition-colors">AR Scanner</a></li>
              <li><a href="#portfolio" className="hover:text-white transition-colors">Portfolio Tracker</a></li>
              <li><a href="#ideas" className="hover:text-white transition-colors">What Can I Build</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">HelloBrick Pro</a></li>
              <li><a href="https://apps.apple.com/app/id6760016096" className="hover:text-white transition-colors">iOS App Store</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-emerald-400 font-bold mb-5 uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-3.5 text-sm text-gray-400 font-medium">
              <li><a href="/dashboard" className="hover:text-white transition-colors">Web App Dashboard</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Sign In</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Collector Blog</a></li>
              <li><a href="mailto:support@hellobrick.app" className="hover:text-white transition-colors">Support Center</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-emerald-400 font-bold mb-5 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-3.5 text-sm text-gray-400 font-medium">
              <li><a href="https://hellobrick.app/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="https://hellobrick.app/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} HelloBrick. All rights reserved.</p>
        <p className="max-w-xl text-center md:text-right">
          DISCLAIMER: HelloBrick is an independent enthusiast application and is not affiliated, sponsored, authorized, or endorsed by the LEGO Group. LEGO® is a registered trademark of the LEGO Group.
        </p>
      </div>
    </footer>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-gray-900 scroll-smooth">
      <Navbar />
      <Hero />
      <ARViewfinderShowcase />
      <BentoFeatures />
      <ComparisonTable />
      <PricingSection />
      <CTABanner />
      <BlogSection />
      <Footer />
    </div>
  );
}
