"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  ScanLine,
  Search,
  Plus,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lightbulb,
  BookOpen,
  ShoppingCart,
  ExternalLink
} from "lucide-react";
import {
  mockSets,
  mockCollection,
  mockPortfolioHistory,
  getValuation,
} from "@/lib/mock-data";
import type { LegoSet, SetValuation } from "@/types";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function PriceChangeInline({ value }: { value: number }) {
  const isPositive = value > 0;
  const isZero = value === 0;
  const Icon = isPositive ? ArrowUpRight : isZero ? Minus : ArrowDownRight;
  
  let color = "text-gray-500";
  let bg = "bg-gray-100";
  
  if (isPositive) {
    color = "text-green-700";
    bg = "bg-green-100";
  } else if (!isZero) {
    color = "text-red-700";
    bg = "bg-red-100";
  }

  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg ${bg} ${color} font-bold text-xs`}>
      <Icon size={14} />
      {formatPercent(value)}
    </span>
  );
}

export default function DashboardPage() {
  const [collection, setCollection] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { getSupabaseCollection } = await import("@/lib/supabase");
        const data = await getSupabaseCollection();
        if (data && data.length > 0) {
           setCollection(data);
        } else {
           // Fallback to mock data for demonstration if empty
           setCollection(mockCollection);
        }
      } catch (err) {
        console.error(err);
        setCollection(mockCollection);
      }
      setLoading(false);
    }
    load();
  }, []);

  const portfolioValue = useMemo(() => {
    let total = 0;
    let totalCost = 0;
    collection.forEach((item) => {
      const val = getValuation(item.setNum);
      if (val) {
        total += item.condition === "sealed" ? val.sealedValue : val.usedValue;
      }
      if (item.purchasePrice) {
        totalCost += item.purchasePrice;
      }
    });
    return { total, totalCost, gain: total - totalCost };
  }, [collection]);

  const gainPercent =
    portfolioValue.totalCost > 0
      ? (portfolioValue.gain / portfolioValue.totalCost) * 100
      : 0;

  const collectionWithData = useMemo(() => {
    return collection
      .map((item) => {
        const set = mockSets.find((s) => s.setNum === item.setNum);
        const val = getValuation(item.setNum);
        if (!set || !val) return null;
        return { item, set, val };
      })
      .filter(Boolean) as { item: any; set: LegoSet; val: SetValuation }[];
  }, [collection]);

  const topSets = [...collectionWithData].sort(
    (a, b) =>
      (b.item.condition === "sealed" ? b.val.sealedValue : b.val.usedValue) -
      (a.item.condition === "sealed" ? a.val.sealedValue : a.val.usedValue)
  );

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans pt-8 pb-20">
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header & Quick Actions */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <h1 className="font-display text-4xl font-bold text-[#050A18] mb-2">Dashboard</h1>
              <p className="text-gray-500 font-medium text-lg">Welcome back to your collection.</p>
            </div>
            
            <div className="flex gap-3">
               <Link href="/scan" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:border-gray-300 shadow-sm transition-all">
                 <ScanLine size={18} className="text-[#FF7A30]" />
                 Scan Set
               </Link>
               <Link href="/collection" className="flex items-center gap-2 px-5 py-2.5 bg-[#050A18] text-white rounded-xl font-bold hover:bg-gray-800 shadow-sm transition-all">
                 <Plus size={18} className="text-[#FFCE4A]" />
                 Add Set
               </Link>
            </div>
          </motion.div>

          {/* Portfolio Summary Card */}
          <motion.div variants={fadeUp} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCE4A] rounded-full blur-[80px] opacity-20 -mr-20 -mt-20 pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF7A30] rounded-full blur-[100px] opacity-10 -ml-20 -mb-20 pointer-events-none" />
             
             <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
                <div>
                  <p className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">Total Collection Value</p>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="font-display text-6xl font-bold text-[#050A18] tracking-tight">
                      {formatCurrency(portfolioValue.total)}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriceChangeInline value={gainPercent} />
                    <span className="text-gray-400 font-medium text-sm">
                      {portfolioValue.gain >= 0 ? "+" : ""}
                      {formatCurrency(portfolioValue.gain)} All time gain
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 items-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                   <div>
                     <p className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">Total Sets</p>
                     <p className="font-display text-3xl font-bold text-[#050A18]">{collection.length}</p>
                   </div>
                   <div>
                     <p className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">Themes</p>
                     <p className="font-display text-3xl font-bold text-[#050A18]">
                       {new Set(collectionWithData.map(c => c.set.theme)).size}
                     </p>
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Your Top Sets */}
          <motion.div variants={fadeUp} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-bold text-2xl text-[#050A18]">Your Top Sets</h3>
              <Link href="/collection" className="text-[#FF7A30] font-bold flex items-center gap-1 hover:text-[#E66620] transition-colors">
                View Full Collection <ChevronRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topSets.slice(0, 6).map(({ item, set, val }, i) => {
                const currentValue = item.condition === "sealed" ? val.sealedValue : val.usedValue;
                const change = item.condition === "sealed" ? val.sealedChange7d : val.usedChange7d;
                
                return (
                  <Link
                    key={item.id}
                    href={`/set/${set.setNum}`}
                    className="group flex flex-col p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#FFCE4A] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                       <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-mono text-[10px] text-gray-400 font-bold shadow-sm group-hover:scale-105 transition-transform">
                          {set.setNum}
                       </div>
                       <PriceChangeInline value={change} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#050A18] mb-1 line-clamp-1 group-hover:text-[#FF7A30] transition-colors">{set.name}</h4>
                      <div className="flex items-center justify-between mt-3">
                         <span className="text-xs font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded-md">{set.theme}</span>
                         <span className="font-display font-bold text-xl text-[#050A18]">{formatCurrency(currentValue)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Builder Tips */}
          <motion.div variants={fadeUp} className="bg-[#050A18] rounded-3xl p-6 shadow-sm relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF7A30] rounded-full blur-[40px] opacity-50" />
             <div className="flex items-center gap-3 mb-4 relative z-10">
               <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#FFCE4A]">
                  <Lightbulb size={20} />
               </div>
               <h3 className="font-display font-bold text-xl text-white">Builder Tip</h3>
             </div>
             <p className="text-gray-300 font-medium relative z-10 leading-relaxed">
               Organize your loose bricks by <strong>part type</strong>, not by color! It's much easier to find a blue 1x2 plate in a bin of 1x2s than in a bin of all blue parts.
             </p>
          </motion.div>

          {/* Buy More Bricks */}
          <motion.div variants={fadeUp} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
             <div className="flex items-center gap-3 mb-5">
               <div className="w-10 h-10 rounded-xl bg-[#FFCE4A]/20 flex items-center justify-center text-[#FF7A30]">
                  <ShoppingCart size={20} />
               </div>
               <h3 className="font-display font-bold text-xl text-[#050A18]">Expand Collection</h3>
             </div>
             <div className="space-y-3">
                <a href="https://www.lego.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors font-bold text-gray-700">
                  <span>LEGO.com Official Shop</span>
                  <ExternalLink size={16} className="text-gray-400" />
                </a>
                <a href="https://www.bricklink.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors font-bold text-gray-700">
                  <span>BrickLink Marketplace</span>
                  <ExternalLink size={16} className="text-gray-400" />
                </a>
                <a href="https://stockx.com/lego" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors font-bold text-gray-700">
                  <span>StockX (Sealed Sets)</span>
                  <ExternalLink size={16} className="text-gray-400" />
                </a>
             </div>
          </motion.div>

          {/* Blog / Builder's Journal */}
          <motion.div variants={fadeUp} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between mb-5">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <BookOpen size={20} />
                 </div>
                 <h3 className="font-display font-bold text-xl text-[#050A18]">The Journal</h3>
               </div>
               <Link href="/blog" className="text-sm font-bold text-gray-400 hover:text-[#FF7A30]">View All</Link>
             </div>
             
             <div className="space-y-4">
               <Link href="/blog/how-to-store-your-lego-collection" className="block group">
                 <div className="h-32 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                    {/* Placeholder image */}
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=800&auto=format&fit=crop')" }} />
                 </div>
                 <h4 className="font-bold text-gray-900 group-hover:text-[#FF7A30] transition-colors leading-snug">The Ultimate Guide to Storing Your LEGO Collection</h4>
                 <p className="text-sm text-gray-500 mt-1">April 12, 2026</p>
               </Link>
             </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
