"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, ScanLine, Search, LayoutGrid, Zap, Layers, ChevronDown } from "lucide-react";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans selection:bg-[#C9A84C] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-black flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Layers className="text-white w-5 h-5" />
            </div>
            HelloBrick
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-black transition-colors text-gray-600">
              Sign In
            </Link>
            <Link
              href="https://apps.apple.com"
              className="bg-black text-white text-sm font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform"
            >
              Get App
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        {/* HERO SECTION */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-32">
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">
            <motion.h1 
              variants={fadeUp}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-black leading-[1.1]"
            >
              The LEGO Scanner & Collection App <span className="text-[#C9A84C]">Built for Builders.</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeUp}
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Scan your LEGO collection, identify bricks, organise sets, discover new builds and manage everything in one place. The modern alternative for serious LEGO collectors.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="https://apps.apple.com"
                className="w-full sm:w-auto bg-[#C9A84C] text-black px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl shadow-[#C9A84C]/20"
              >
                Download on the App Store <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto bg-white text-black border border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                See How It Works
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="pt-8 flex items-center justify-center gap-2 text-sm font-medium text-gray-500">
              <div className="flex gap-1 text-[#C9A84C]">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
              </div>
              Trusted by LEGO builders worldwide
            </motion.div>
          </motion.div>
        </section>

        {/* IMMEDIATELY BELOW THE FOLD: Everything You Need */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">Everything You Need to Manage Your LEGO Collection</h2>
            <p className="text-gray-500 font-medium">Fast. Accurate. Built for collectors.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-6">
                <ScanLine className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Scan LEGO Bricks</h3>
              <p className="text-gray-600">Instantly identify bricks and sets using your phone&apos;s camera.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-6">
                <LayoutGrid className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Organise Your Collection</h3>
              <p className="text-gray-600">Track every set, loose brick and minifigure in one place.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Build More</h3>
              <p className="text-gray-600">Discover what you can build from the LEGO you already own.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Never Lose Track</h3>
              <p className="text-gray-600">Search, filter and organise thousands of pieces in seconds.</p>
            </div>
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section className="max-w-4xl mx-auto px-6 mb-32">
          <div className="bg-black text-white rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Why Builders Choose HelloBrick</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="py-4 text-gray-400 font-medium">Feature</th>
                    <th className="py-4 font-bold text-[#C9A84C] text-lg">HelloBrick</th>
                    <th className="py-4 text-gray-500 font-medium whitespace-nowrap">Traditional LEGO Apps</th>
                  </tr>
                </thead>
                <tbody className="text-lg">
                  <tr className="border-b border-gray-800/50">
                    <td className="py-5 font-medium">Fast brick scanning</td>
                    <td className="py-5 text-[#34D399]"><Check className="w-6 h-6" /></td>
                    <td className="py-5 text-gray-500 text-sm">✓ / varies</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-5 font-medium">Collection management</td>
                    <td className="py-5 text-[#34D399]"><Check className="w-6 h-6" /></td>
                    <td className="py-5 text-gray-500 text-sm">—</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-5 font-medium">Smart search</td>
                    <td className="py-5 text-[#34D399]"><Check className="w-6 h-6" /></td>
                    <td className="py-5 text-gray-500 text-sm">—</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-5 font-medium">Modern interface</td>
                    <td className="py-5 text-[#34D399]"><Check className="w-6 h-6" /></td>
                    <td className="py-5 text-gray-500 text-sm">—</td>
                  </tr>
                  <tr>
                    <td className="py-5 font-medium">Active development</td>
                    <td className="py-5 text-[#34D399]"><Check className="w-6 h-6" /></td>
                    <td className="py-5 text-gray-500 text-sm">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SEARCH INTENT SECTION */}
        <section className="max-w-3xl mx-auto px-6 mb-32">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-12 text-center">Looking for...</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-black mb-2">Looking for a LEGO Scanner?</h3>
              <p className="text-gray-600">HelloBrick scans and helps organise your LEGO collection from your phone.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-black mb-2">Need a LEGO Inventory App?</h3>
              <p className="text-gray-600">Keep track of every brick, set and minifigure in one searchable collection.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-black mb-2">Want to Organise Your LEGO Collection?</h3>
              <p className="text-gray-600">Whether you own 500 bricks or 50,000, HelloBrick keeps everything organised.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-black mb-2">Wondering What You Can Build?</h3>
              <p className="text-gray-600">Browse your collection and discover building inspiration based on what you already own.</p>
            </div>
          </div>
        </section>

        {/* FEATURES SUMMARY */}
        <section className="max-w-5xl mx-auto px-6 mb-32">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-5 gap-8 text-center md:text-left">
              <div>
                <h4 className="font-bold text-black mb-2">Scan</h4>
                <p className="text-sm text-gray-600">Identify LEGO bricks quickly.</p>
              </div>
              <div>
                <h4 className="font-bold text-black mb-2">Search</h4>
                <p className="text-sm text-gray-600">Find any brick instantly.</p>
              </div>
              <div>
                <h4 className="font-bold text-black mb-2">Inventory</h4>
                <p className="text-sm text-gray-600">Track your collection.</p>
              </div>
              <div>
                <h4 className="font-bold text-black mb-2">Collections</h4>
                <p className="text-sm text-gray-600">Organise by sets, themes or custom categories.</p>
              </div>
              <div>
                <h4 className="font-bold text-black mb-2">Build</h4>
                <p className="text-sm text-gray-600">Explore new ideas from your existing collection.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO BLOCK */}
        <section className="max-w-3xl mx-auto px-6 mb-32 text-center">
          <h2 className="text-2xl font-bold text-black mb-4">The Complete LEGO Collection App</h2>
          <p className="text-gray-600 leading-relaxed">
            HelloBrick helps LEGO fans scan bricks, organise collections, manage inventories and discover new ways to build. Whether you&apos;re cataloguing thousands of pieces or identifying a single brick, HelloBrick makes managing your collection simple.
          </p>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 mb-32">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "What is the best LEGO scanner app?", a: "HelloBrick helps you scan, organise and manage your LEGO collection from your phone." },
              { q: "Can I organise my LEGO collection?", a: "Yes. Keep track of sets, bricks and collections in one searchable library." },
              { q: "Can I identify LEGO bricks?", a: "Use HelloBrick to quickly identify and organise your LEGO pieces." },
              { q: "Is HelloBrick free?", a: "Download HelloBrick for free from the App Store." }
            ].map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between font-bold text-left text-black hover:bg-gray-50 transition-colors"
                >
                  {faq.q}
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-[#C9A84C] rounded-3xl p-12 md:p-20 shadow-2xl shadow-[#C9A84C]/20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6">Ready to Organise Your LEGO Collection?</h2>
            <p className="text-black/80 text-xl mb-10">Download HelloBrick today and start scanning.</p>
            <Link
              href="https://apps.apple.com"
              className="inline-flex bg-black text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-transform items-center justify-center gap-2"
            >
              Download on the App Store <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} HelloBrick. Not affiliated with the LEGO Group.</p>
      </footer>
    </div>
  );
}
