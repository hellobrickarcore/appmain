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
} from "lucide-react";
import { mockSets, getValuation } from "@/lib/mock-data";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { Badge, Card } from "@/components/ui";
import type { LegoSet, SetValuation, WishlistItem, CollectionItem } from "@/types";

const containerVariants = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

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

  // Hydrate wishlist with set metadata & current sealed pricing
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

        return {
          item,
          set,
          val,
          currentVal,
          target,
          priceDiff,
          targetReached,
        };
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

  // Count target-met buying opportunities
  const targetMetCount = useMemo(() => {
    return hydratedWishlist.filter((w) => w.targetReached).length;
  }, [hydratedWishlist]);

  // Remove from Wishlist
  const handleRemove = (setNum: string) => {
    const updated = wishlist.filter((w) => w.setNum !== setNum);
    setWishlist(updated);
    localStorage.setItem("hb_wishlist", JSON.stringify(updated));
    showToast("Removed from price monitor.", "info");
  };

  // Trigger migration flow
  const startMigration = (set: LegoSet) => {
    const val = getValuation(set.setNum);
    setPurchasePrice(val ? val.sealedValue.toString() : (set.retailPrice?.toString() || ""));
    setActiveSetToMigrate(set);
  };

  // Finalize migration from Wishlist into Collection
  const handleMigrateToCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSetToMigrate) return;

    // 1. Create collection item
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

    // 2. Remove from Wishlist
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
    <div className="px-4 py-5 max-w-2xl mx-auto space-y-5">
      {/* Header title */}
      <div>
        <h1 className="font-outfit font-bold text-xl text-hb-primary flex items-center gap-2">
          <Eye size={20} className="text-hb-gold" />
          Price Monitor
        </h1>
        <p className="text-hb-secondary text-xs">
          Alert parameters and buy triggers for targets.
        </p>
      </div>

      {/* Aggregate Buy Alert Header */}
      {!loading && wishlist.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl border p-4 flex items-center gap-3.5 relative overflow-hidden transition-all",
            targetMetCount > 0
              ? "bg-hb-positive-bg border-[#34D399]/30"
              : "bg-hb-surface border-hb-border"
          )}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-hb-gold/5 rounded-full blur-xl pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-hb-bg/50 flex items-center justify-center flex-shrink-0 relative">
            <Bell
              size={18}
              className={cn(targetMetCount > 0 ? "text-hb-positive animate-bounce" : "text-hb-secondary")}
            />
            {targetMetCount > 0 && (
              <div className="absolute top-[-3px] right-[-3px] w-2.5 h-2.5 bg-hb-positive border-2 border-hb-bg rounded-full" />
            )}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[13px] font-bold text-hb-primary">
              {targetMetCount > 0
                ? `${targetMetCount} Buy Opportunity Found!`
                : "Active Price Tracking"}
            </h4>
            <p className="text-hb-secondary text-[11px] leading-tight max-w-xs">
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
          <div className="w-6 h-6 border-2 border-hb-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : wishlist.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 border border-dashed border-hb-border rounded-2xl bg-hb-surface/20"
        >
          <Bookmark size={40} className="text-hb-tertiary mx-auto mb-3.5" />
          <h3 className="font-outfit font-bold text-sm text-hb-primary">
            No Monitored Sets
          </h3>
          <p className="text-hb-secondary text-xs max-w-xs mx-auto mt-1 mb-5 leading-relaxed">
            Configure custom limit pricing targets to get instant indicators on buying opportunities.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-gold text-[#0C0F14] text-xs font-bold hover:brightness-110 active:scale-98 transition-all shadow-md shadow-hb-gold/5"
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
          className="space-y-2.5"
        >
          <AnimatePresence mode="popLayout">
            {hydratedWishlist.map(({ item, set, val, currentVal, target, priceDiff, targetReached }) => {
              return (
                <motion.div
                  key={item.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "rounded-2xl border bg-hb-surface p-4 hover:border-hb-border-hover transition-all flex flex-col gap-3 group relative overflow-hidden",
                    targetReached ? "border-[#34D399]/20" : "border-hb-border"
                  )}
                >
                  {/* Glowing backdrops for target-reached cards */}
                  {targetReached && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-hb-positive/5 rounded-full blur-2xl pointer-events-none" />
                  )}

                  {/* Top Half: metadata info */}
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-hb-bg border border-hb-border flex items-center justify-center flex-shrink-0 font-mono text-[7px] text-hb-tertiary">
                      {set.setNum.split("-")[0]}
                    </div>
                    {/* Identity block */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/set/${set.setNum}`}
                          className="text-xs font-bold text-hb-primary truncate hover:text-hb-gold leading-tight"
                        >
                          {set.name}
                        </Link>
                        {set.isRetired && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#C46D4E]/10 text-[#C46D4E] uppercase">
                            RET
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-hb-secondary mt-0.5 truncate capitalize">
                        {set.theme} Release · {set.year}
                      </p>
                    </div>

                    {/* Delete icon */}
                    <button
                      onClick={() => handleRemove(set.setNum)}
                      className="p-1 rounded-md bg-hb-elevated/40 border border-hb-border text-hb-secondary hover:text-[#F87171] hover:border-[#F87171]/20 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 self-start"
                      title="Stop Monitoring"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Mid Half: limit values and alarms */}
                  <div className="flex items-center justify-between border-t border-hb-border/40 pt-2.5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-hb-tertiary uppercase tracking-wider block font-semibold">
                          Current Sealed
                        </span>
                        <span className="font-mono text-xs font-bold text-hb-primary leading-none">
                          {formatCurrency(currentVal)}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-hb-tertiary uppercase tracking-wider block font-semibold">
                          Target Buy Limit
                        </span>
                        <span className="font-mono text-xs font-bold text-hb-gold leading-none">
                          {formatCurrency(target)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Move / Buy Alert */}
                    <div className="flex items-center gap-2">
                      {targetReached ? (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#34D399]/10 text-[#34D399] text-[10px] font-bold border border-[#34D399]/20 tracking-wider">
                          <Sparkles size={9} className="animate-pulse" />
                          BUY TRIGGER
                        </div>
                      ) : (
                        <div className="text-[9px] font-mono text-hb-tertiary">
                          Diff {formatCurrency(priceDiff)}
                        </div>
                      )}

                      <button
                        onClick={() => startMigration(set)}
                        className="flex items-center justify-center p-2 rounded-xl bg-hb-gold text-[#0C0F14] hover:brightness-110 shadow-sm transition-all"
                        title="Acquired? Move to Collection"
                      >
                        <ShoppingBag size={13} />
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
            className="fixed bottom-20 left-4 right-4 z-50 flex justify-center pointer-events-none"
          >
            <div className="glass-elevated border border-hb-border rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-2.5 pointer-events-auto">
              {toast.type === "success" ? (
                <CheckCircle size={18} className="text-hb-positive flex-shrink-0" />
              ) : (
                <Sparkles size={18} className="text-hb-gold flex-shrink-0" />
              )}
              <span className="text-[13px] font-medium text-hb-primary">
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
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSetToMigrate(null)}
              className="absolute inset-0 bg-hb-bg/85 backdrop-blur-sm"
            />
            {/* Drawer sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-hb-surface border-t border-hb-border rounded-t-3xl p-6 space-y-4 z-10"
            >
              <div className="w-12 h-1 bg-hb-border rounded-full mx-auto -mt-2 mb-4" />

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-outfit font-bold text-lg text-hb-primary">
                    Confirm Asset Acquisition
                  </h3>
                  <p className="text-hb-secondary text-xs mt-0.5">
                    Save purchase records and shift asset to your main portfolio.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSetToMigrate(null)}
                  className="w-7 h-7 rounded-full bg-hb-elevated flex items-center justify-center text-hb-secondary hover:text-hb-primary"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleMigrateToCollection} className="space-y-4 text-left">
                {/* Condition selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-hb-secondary uppercase tracking-wider block">
                    Acquired Condition
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "sealed", label: "Sealed (New)" },
                      { value: "used", label: "Used (Complete)" },
                      { value: "partial", label: "Partial" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCondition(opt.value as any)}
                        className={cn(
                          "py-2.5 rounded-xl border text-center transition-all text-xs font-bold",
                          condition === opt.value
                            ? "bg-hb-gold/10 border-hb-gold text-hb-primary"
                            : "bg-hb-bg/50 border-hb-border text-hb-secondary"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purchase Price */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-hb-secondary uppercase tracking-wider block">
                    Actual Purchase Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-hb-bg border border-hb-border rounded-xl px-4 py-2.5 text-hb-primary text-sm focus:outline-none focus:border-hb-gold/40 focus:ring-1 focus:ring-hb-gold/20 font-mono"
                  />
                </div>

                {/* Purchase Date */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-hb-secondary uppercase tracking-wider block">
                    Acquisition Date
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-hb-bg border border-hb-border rounded-xl px-4 py-2.5 text-hb-primary text-sm focus:outline-none focus:border-hb-gold/40 focus:ring-1 focus:ring-hb-gold/20"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-3 rounded-2xl gradient-gold text-[#0C0F14] text-[13px] font-bold hover:brightness-110 active:scale-98 transition-all shadow-md shadow-hb-gold/10 mt-2"
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
