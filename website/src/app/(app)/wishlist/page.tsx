"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Heart,
  TrendingUp,
  Search,
  Plus,
  ArrowRight,
  TrendingDown,
  Minus,
  CheckCircle,
  HelpCircle,
  Eye,
  Bell,
  Trash2,
  Bookmark,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShoppingBag,
  X
} from "lucide-react";
import { mockSets, getValuation } from "@/lib/mock-data";
import type { LegoSet, SetValuation, WishlistItem, CollectionItem } from "@/types";

const containerVariants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Migration Drawer/Modal States (for Quick Move to Collection)
  const [activeSetToMigrate, setActiveSetToMigrate] = useState<LegoSet | null>(null);
  const [condition, setCondition] = useState<"sealed" | "used" | "partial">("sealed");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedWishlist = localStorage.getItem("hb_wishlist");
      const storedCollection = localStorage.getItem("hb_collection");

      let currentWish: WishlistItem[] = [];
      let currentCol: CollectionItem[] = [];

      if (storedWishlist) {
        currentWish = JSON.parse(storedWishlist);
      } else {
        const { mockWishlist: mockWish } = require("@/lib/mock-data");
        currentWish = mockWish;
        localStorage.setItem("hb_wishlist", JSON.stringify(mockWish));
      }

      if (storedCollection) {
        currentCol = JSON.parse(storedCollection);
      } else {
        const { mockCollection: mockCol } = require("@/lib/mock-data");
        currentCol = mockCol;
        localStorage.setItem("hb_collection", JSON.stringify(mockCol));
      }

      setWishlist(currentWish);
      setCollection(currentCol);
    }
    setLoading(false);
  }, []);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const hydratedWishlist = useMemo(() => {
    return wishlist
      .map((item) => {
        const set = mockSets.find((s) => s.setNum === item.setNum);
        const val = getValuation(item.setNum);
        if (!set || !val) return null;

        const currentVal = val.sealedValue;
        const target = item.targetPrice ?? set.retailPrice ?? currentVal * 0.9;
        const priceDiff = currentVal - target;
        const targetReached = currentVal <= target;

        return { item, set, val, currentVal, target, priceDiff, targetReached };
      })
      .filter(Boolean) as {
      item: WishlistItem;
      set: LegoSet;
      val: SetValuation;
      currentVal: number;
      target: number;
      priceDiff: number;
      targetReached: boolean;
    }[];
  }, [wishlist]);

  const targetMetCount = useMemo(() => {
    return hydratedWishlist.filter((w) => w.targetReached).length;
  }, [hydratedWishlist]);

  const handleRemove = (setNum: string) => {
    const updated = wishlist.filter((w) => w.setNum !== setNum);
    setWishlist(updated);
    localStorage.setItem("hb_wishlist", JSON.stringify(updated));
    showToast("Removed from price monitor.", "info");
  };

  const startMigration = (set: LegoSet) => {
    const val = getValuation(set.setNum);
    setPurchasePrice(val ? val.sealedValue.toString() : (set.retailPrice?.toString() || ""));
    setActiveSetToMigrate(set);
  };

  const handleMigrateToCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSetToMigrate) return;

    const newItem: CollectionItem = {
      id: `col_${Date.now()}`,
      userId: "user_mvp",
      setNum: activeSetToMigrate.setNum,
      condition,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      purchaseDate: purchaseDate || null,
      addedAt: new Date().toISOString(),
      notes: "Moved automatically from Price Monitor.",
    };

    const updatedWish = wishlist.filter((w) => w.setNum !== activeSetToMigrate.setNum);
    const updatedCol = [newItem, ...collection];

    setWishlist(updatedWish);
    setCollection(updatedCol);

    localStorage.setItem("hb_wishlist", JSON.stringify(updatedWish));
    localStorage.setItem("hb_collection", JSON.stringify(updatedCol));

    setActiveSetToMigrate(null);
    showToast(`Purchased! Added ${activeSetToMigrate.name} to Collection.`, "success");
  };

  return (
    <div className="pt-8 pb-20 px-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header title */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl text-[#050A18] mb-2 flex items-center gap-3">
            Price Monitor
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Track asset prices and receive buy alerts.
          </p>
        </div>
      </div>

      {/* Aggregate Buy Alert Header */}
      {!loading && wishlist.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border p-6 flex items-center gap-5 relative overflow-hidden transition-all shadow-sm ${
            targetMetCount > 0
              ? "bg-green-50 border-green-200"
              : "bg-white border-gray-100"
          }`}
        >
          {targetMetCount > 0 && (
            <div className="absolute top-0 right-0 w-48 h-48 bg-green-200 rounded-full blur-[60px] opacity-30 pointer-events-none" />
          )}
          
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative ${
            targetMetCount > 0 ? "bg-green-100" : "bg-gray-100"
          }`}>
            <Bell
              size={24}
              className={targetMetCount > 0 ? "text-green-600 animate-bounce" : "text-gray-400"}
            />
            {targetMetCount > 0 && (
              <div className="absolute top-[-4px] right-[-4px] w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="space-y-1 z-10">
            <h4 className="text-lg font-bold text-[#050A18]">
              {targetMetCount > 0
                ? `${targetMetCount} Buy Opportunity Found!`
                : "Active Price Tracking"}
            </h4>
            <p className="text-gray-500 font-medium text-sm max-w-lg">
              {targetMetCount > 0
                ? "Market values for some sets have dropped below your alert buy targets."
                : "Continuous scan active for retail fluctuations and price changes."}
            </p>
          </div>
        </motion.div>
      )}

      {/* Main content list */}
      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#FFCE4A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : wishlist.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 border-2 border-dashed border-gray-200 rounded-3xl bg-white"
        >
          <Bookmark size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-display font-bold text-2xl text-[#050A18] mb-2">
            No Monitored Sets
          </h3>
          <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">
            Configure custom limit pricing targets to get instant indicators on buying opportunities.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF7A30] text-white font-bold hover:bg-[#E66620] shadow-sm shadow-[#FF7A30]/20 transition-all"
          >
            Find a set to monitor
          </Link>
        </motion.div>
      ) : (
        /* Wishlist Items List */
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {hydratedWishlist.map(({ item, set, val, currentVal, target, priceDiff, targetReached }) => {
              return (
                <motion.div
                  key={item.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`rounded-3xl border bg-white p-5 md:p-6 hover:shadow-md transition-all flex flex-col group relative overflow-hidden ${
                    targetReached ? "border-green-200" : "border-gray-100 hover:border-[#FFCE4A]"
                  }`}
                >
                  {/* Glowing backdrops for target-reached cards */}
                  {targetReached && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 rounded-full blur-2xl pointer-events-none" />
                  )}

                  {/* Top Half: metadata info */}
                  <div className="flex gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 font-mono text-[9px] font-bold text-gray-400 p-2">
                      <img src={set.imageUrl} alt={set.name} className="h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/set/${set.setNum}`}
                          className="text-lg font-bold text-[#050A18] truncate group-hover:text-[#FF7A30] transition-colors leading-tight"
                        >
                          {set.name}
                        </Link>
                        {set.isRetired && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-100 text-red-700 uppercase tracking-wider">
                            RET
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{set.setNum}</span>
                        <span>{set.theme}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(set.setNum)}
                      className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex-shrink-0 self-start"
                      title="Stop Monitoring"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Mid Half: limit values and alarms */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-auto">
                    <div className="flex gap-6">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                          Current Value
                        </span>
                        <span className="font-display text-xl font-bold text-[#050A18] leading-none block">
                          {formatCurrency(currentVal)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                          Target Buy Limit
                        </span>
                        <span className="font-display text-xl font-bold text-[#FF7A30] leading-none block">
                          {formatCurrency(target)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Move / Buy Alert */}
                    <div className="flex items-center gap-3">
                      {targetReached ? (
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-bold border border-green-200 tracking-wider">
                          <Sparkles size={12} className="animate-pulse" />
                          BUY TRIGGER
                        </div>
                      ) : (
                        <div className="hidden sm:block text-xs font-mono font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                          Diff {formatCurrency(priceDiff)}
                        </div>
                      )}

                      <button
                        onClick={() => startMigration(set)}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#050A18] text-white hover:bg-[#FF7A30] shadow-sm transition-all"
                        title="Acquired? Move to Collection"
                      >
                        <ShoppingBag size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-10 right-10 z-50 flex justify-end pointer-events-none"
          >
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3 pointer-events-auto">
              {toast.type === "success" ? (
                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
              ) : (
                <Sparkles size={20} className="text-[#FF7A30] flex-shrink-0" />
              )}
              <span className="text-sm font-bold text-[#050A18]">
                {toast.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          Quick Purchase Migration Modal Drawer
          ========================================================================= */}
      <AnimatePresence>
        {activeSetToMigrate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSetToMigrate(null)}
              className="absolute inset-0 bg-[#050A18]/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl z-10"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#050A18]">
                    Confirm Acquisition
                  </h3>
                  <p className="text-gray-500 font-medium mt-1">
                    Save purchase records and shift asset to your main portfolio.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSetToMigrate(null)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleMigrateToCollection} className="space-y-6 text-left">
                {/* Condition selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Acquired Condition
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "sealed", label: "Sealed (New)" },
                      { value: "used", label: "Used" },
                      { value: "partial", label: "Partial" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCondition(opt.value as any)}
                        className={`py-3 rounded-xl border text-center transition-all text-sm font-bold ${
                          condition === opt.value
                            ? "bg-[#FFCE4A]/20 border-[#FFCE4A] text-[#050A18]"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purchase Price */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Actual Purchase Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-[#050A18] text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A30] focus:bg-white transition-all font-mono"
                  />
                </div>

                {/* Purchase Date */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Acquisition Date
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-[#050A18] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF7A30] focus:bg-white transition-all"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-4 rounded-xl bg-[#FF7A30] text-white text-lg font-bold hover:bg-[#E66620] shadow-sm shadow-[#FF7A30]/20 transition-all mt-4"
                >
                  Migrate to Portfolio
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
