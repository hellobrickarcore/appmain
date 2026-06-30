"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Plus,
  ChevronRight,
  TrendingDown,
  Minus,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";
import { mockSets, getValuation } from "@/lib/mock-data";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { Badge, Card, ValueDisplay, PriceChange, SearchInput } from "@/components/ui";
import type { LegoSet, SetValuation, CollectionItem, ViewMode, SortBy } from "@/types";

const containerVariants = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function CollectionPage() {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout & Filtering State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("value");
  const [showFilters, setShowFilters] = useState(false);

  // Load collection from Supabase
  useEffect(() => {
    async function load() {
      try {
        const { getSupabaseCollection } = await import("@/lib/supabase");
        const data = await getSupabaseCollection();
        if (data) setCollection(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleToggleCondition = async (e: React.MouseEvent, id: string, currentCondition: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newCondition = currentCondition === "sealed" ? "used" : "sealed";
    // Optimistic UI update
    setCollection(prev => prev.map(item => item.id === id ? { ...item, condition: newCondition } : item));
    try {
      const { updateSupabaseCollectionItem } = await import("@/lib/supabase");
      await updateSupabaseCollectionItem(id, { condition: newCondition });
    } catch (err) {
      console.error(err);
      // Revert if error
      setCollection(prev => prev.map(item => item.id === id ? { ...item, condition: currentCondition } : item));
    }
  };

  // Hydrate collection with set metadata and real-time market value
  const hydratedCollection = useMemo(() => {
    return collection
      .map((item) => {
        const set = mockSets.find((s) => s.setNum === item.setNum);
        const val = getValuation(item.setNum);
        if (!set || !val) return null;

        const currentValue =
          item.condition === "sealed"
            ? val.sealedValue
            : item.condition === "used"
              ? val.usedValue
              : val.usedValue * 0.7; // partial is 70% of used

        const cost = item.purchasePrice ?? set.retailPrice ?? currentValue * 0.6;
        const gain = currentValue - cost;
        const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;

        return {
          item,
          set,
          val,
          currentValue,
          cost,
          gain,
          gainPercent,
        };
      })
      .filter(Boolean) as {
      item: CollectionItem;
      set: LegoSet;
      val: SetValuation;
      currentValue: number;
      cost: number;
      gain: number;
      gainPercent: number;
    }[];
  }, [collection]);

  // Aggregate Portfolio summary stats
  const summary = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    let totalGain = 0;

    hydratedCollection.forEach((item) => {
      totalValue += item.currentValue;
      totalCost += item.cost;
    });

    totalGain = totalValue - totalCost;
    const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return {
      totalSets: hydratedCollection.length,
      totalValue,
      totalCost,
      totalGain,
      gainPercent,
    };
  }, [hydratedCollection]);

  // Extract unique themes from collection
  const uniqueThemes = useMemo(() => {
    const themes = new Set<string>();
    hydratedCollection.forEach((c) => themes.add(c.set.theme));
    return Array.from(themes);
  }, [hydratedCollection]);

  // Filter and Sort collection
  const filteredAndSorted = useMemo(() => {
    let result = [...hydratedCollection];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.set.name.toLowerCase().includes(q) ||
          c.set.setNum.toLowerCase().includes(q) ||
          c.set.theme.toLowerCase().includes(q)
      );
    }

    // Condition filter
    if (selectedCondition !== "all") {
      result = result.filter((c) => c.item.condition === selectedCondition);
    }

    // Theme filter
    if (selectedTheme !== "all") {
      result = result.filter((c) => c.set.theme === selectedTheme);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.set.name.localeCompare(b.set.name);
        case "year":
          return b.set.year - a.set.year;
        case "gain":
          return b.gainPercent - a.gainPercent;
        case "added":
          return new Date(b.item.addedAt).getTime() - new Date(a.item.addedAt).getTime();
        case "value":
        default:
          return b.currentValue - a.currentValue;
      }
    });

    return result;
  }, [hydratedCollection, searchQuery, selectedCondition, selectedTheme, sortBy]);

  // Quick helper for percent indicators
  const PriceChangeInline = ({ value }: { value: number }) => {
    const isPos = value > 0;
    const isZero = value === 0;
    const color = isPos ? "text-[#34D399]" : isZero ? "text-[#555B6E]" : "text-[#F87171]";
    return (
      <span className={cn("font-mono text-xs font-semibold", color)}>
        {value > 0 ? "+" : ""}
        {value.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto space-y-5">
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit font-bold text-xl text-hb-primary">
            My Portfolio
          </h1>
          <p className="text-hb-secondary text-xs">
            Manage your holdings and transaction records.
          </p>
        </div>
        <Link
          href="/scan"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-gold text-[#0C0F14] text-xs font-bold hover:brightness-110 active:scale-98 transition-all shadow-md shadow-hb-gold/5"
        >
          <Plus size={14} /> Add Set
        </Link>
      </div>

      {/* Portfolio Value Summary Header */}
      {!loading && collection.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-hb-border bg-hb-surface p-4 flex items-center justify-between overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-hb-gold/5 rounded-full blur-xl pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-semibold text-hb-secondary uppercase tracking-wider block">
              Total Portfolio Value
            </span>
            <div className="flex items-baseline gap-2">
              <h2 className="font-mono font-bold text-2xl text-hb-primary">
                {formatCurrency(summary.totalValue)}
              </h2>
              <PriceChangeInline value={summary.gainPercent} />
            </div>
            <p className="text-[10px] text-hb-tertiary font-mono">
              Net Gain: {summary.totalGain >= 0 ? "+" : ""}
              {formatCurrency(summary.totalGain)} total profit
            </p>
          </div>
          <div className="text-right border-l border-hb-border/30 pl-4 py-1 flex-shrink-0">
            <p className="font-mono text-[16px] font-bold text-hb-primary">
              {summary.totalSets}
            </p>
            <p className="text-[10px] text-hb-secondary uppercase tracking-wider font-semibold">
              Assets Owned
            </p>
          </div>
        </motion.div>
      )}

      {/* Search, Sort, Filter Controls */}
      <div className="space-y-2.5">
        <div className="flex gap-2">
          {/* Real-time search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hb-tertiary"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search set name, number..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-hb-surface border border-hb-border text-hb-primary text-xs placeholder:text-hb-tertiary focus:outline-none focus:border-hb-gold/30 transition-all font-inter"
            />
          </div>

          {/* Toggle Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2.5 rounded-xl border flex items-center justify-center transition-all",
              showFilters || selectedTheme !== "all" || selectedCondition !== "all"
                ? "bg-hb-gold/10 border-hb-gold text-hb-gold"
                : "bg-hb-surface border-hb-border text-hb-secondary hover:text-hb-primary hover:border-hb-border-hover"
            )}
          >
            <SlidersHorizontal size={15} />
          </button>

          {/* View Mode Grid/List toggle */}
          <div className="flex items-center rounded-xl bg-hb-surface border border-hb-border p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "grid" ? "bg-hb-elevated text-hb-primary" : "text-hb-secondary"
              )}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "list" ? "bg-hb-elevated text-hb-primary" : "text-hb-secondary"
              )}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl border border-hb-border bg-hb-surface/50 grid grid-cols-2 gap-3 text-xs">
                {/* Condition filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-hb-secondary uppercase tracking-wider block">
                    Condition
                  </label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full bg-hb-bg border border-hb-border rounded-lg px-2.5 py-1.5 text-hb-primary focus:outline-none"
                  >
                    <option value="all">All Conditions</option>
                    <option value="sealed">Sealed (New)</option>
                    <option value="used">Used (Complete)</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>

                {/* Theme filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-hb-secondary uppercase tracking-wider block">
                    Theme
                  </label>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="w-full bg-hb-bg border border-hb-border rounded-lg px-2.5 py-1.5 text-hb-primary focus:outline-none truncate"
                  >
                    <option value="all">All Themes</option>
                    {uniqueThemes.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort selection */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-semibold text-hb-secondary uppercase tracking-wider block">
                    Sort By
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: "value", label: "Value" },
                      { value: "gain", label: "Profit Return" },
                      { value: "year", label: "Release Year" },
                      { value: "name", label: "Set Name" },
                      { value: "added", label: "Date Added" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSortBy(opt.value as SortBy)}
                        className={cn(
                          "px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all",
                          sortBy === opt.value
                            ? "bg-hb-gold/10 border-hb-gold text-hb-gold"
                            : "bg-hb-bg border-hb-border text-hb-secondary"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Collection Display Area */}
      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-hb-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : collection.length === 0 ? (
        // Empty State
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 border border-dashed border-hb-border rounded-2xl bg-hb-surface/20"
        >
          <Layers size={40} className="text-hb-tertiary mx-auto mb-3.5" />
          <h3 className="font-outfit font-bold text-sm text-hb-primary">
            No Sets in Collection
          </h3>
          <p className="text-hb-secondary text-xs max-w-xs mx-auto mt-1 mb-5 leading-relaxed">
            Your collection portfolio is empty. Add Lego sets to monitor their investments, resale trends, and gains!
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-gold text-[#0C0F14] text-xs font-bold hover:brightness-110 active:scale-98 transition-all"
          >
            <Plus size={14} /> Scan & Add Set
          </Link>
        </motion.div>
      ) : filteredAndSorted.length === 0 ? (
        // No Filter Results State
        <div className="text-center py-12">
          <AlertCircle size={32} className="text-hb-tertiary mx-auto mb-2" />
          <p className="text-hb-secondary text-sm">
            No assets match &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-hb-tertiary text-xs mt-1">
            Try resetting your condition or theme filters.
          </p>
        </div>
      ) : (
        // Rendered Grid / List Assets
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className={cn(
            viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-2"
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSorted.map(({ item, set, val, currentValue, cost, gain, gainPercent }) => {
              return viewMode === "grid" ? (
                /* GRID CARD VIEW */
                <motion.div
                  key={item.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={`/set/${set.setNum}`}
                    className="block rounded-2xl border border-hb-border bg-hb-surface overflow-hidden hover:border-hb-border-hover hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="aspect-square bg-hb-bg/50 p-4 flex items-center justify-center relative">
                      <span className="absolute bottom-2 left-2 text-[9px] font-mono text-hb-tertiary">
                        {set.setNum}
                      </span>
                      <button
                        onClick={(e) => handleToggleCondition(e, item.id, item.condition)}
                        className={`absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest font-mono z-10 transition-colors ${
                          item.condition === "sealed" 
                            ? "bg-hb-gold/15 text-hb-gold border-hb-gold/20" 
                            : "bg-gray-500/15 text-gray-400 border-gray-500/20"
                        }`}
                      >
                        {item.condition}
                      </button>
                      <img
                        src={set.imageUrl}
                        alt={set.name}
                        className="h-20 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                          const label = document.getElementById(`grid-err-${item.id}`);
                          if (label) label.classList.remove("hidden");
                        }}
                      />
                      <div
                        id={`grid-err-${item.id}`}
                        className="hidden absolute inset-0 flex items-center justify-center bg-hb-elevated/40"
                      >
                        <Layers size={16} className="text-hb-tertiary" />
                      </div>
                    </div>
                    <div className="p-3.5 space-y-2">
                      <div className="min-w-0">
                        <p className="text-hb-primary text-[12px] font-bold truncate leading-tight">
                          {set.name}
                        </p>
                        <p className="text-hb-secondary text-[10px] mt-0.5 truncate">
                          {set.theme}
                        </p>
                      </div>
                      <div className="flex items-end justify-between border-t border-hb-border/30 pt-2.5">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-hb-tertiary uppercase tracking-wider block font-semibold">
                            Value
                          </span>
                          <span className="font-mono text-xs font-bold text-hb-primary leading-none">
                            {formatCurrency(currentValue)}
                          </span>
                        </div>
                        <div className="text-right">
                          <PriceChangeInline value={gainPercent} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ) : (
                /* COMPACT LIST VIEW */
                <motion.div
                  key={item.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={`/set/${set.setNum}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-hb-border bg-hb-surface hover:bg-hb-elevated hover:border-hb-border-hover transition-all"
                  >
                    {/* Compact Image */}
                    <div className="w-10 h-10 rounded-lg bg-hb-bg border border-hb-border flex items-center justify-center flex-shrink-0 font-mono text-[7px] text-hb-tertiary relative">
                      <span className="z-10">{set.setNum.split("-")[0]}</span>
                      <button
                        onClick={(e) => handleToggleCondition(e, item.id, item.condition)}
                        className={`absolute top-[-2px] right-[-2px] w-2 h-2 rounded-full border border-hb-surface z-10 transition-colors ${
                          item.condition === "sealed" ? "bg-hb-gold" : "bg-gray-400"
                        }`}
                        title={item.condition === "sealed" ? "Sealed" : "Used"}
                      />
                    </div>

                    {/* Metadata details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-hb-primary truncate leading-tight">
                          {set.name}
                        </p>
                        {set.isRetired && (
                          <span className="text-[8px] font-bold px-1 rounded bg-[#C46D4E]/10 text-[#C46D4E] uppercase">
                            RET
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-hb-secondary mt-0.5 truncate capitalize">
                        {set.theme} · {item.condition}
                      </p>
                    </div>

                    {/* Monetary return tracking */}
                    <div className="text-right flex-shrink-0 flex items-center gap-4">
                      <div>
                        <p className="font-mono text-[13px] font-bold text-hb-primary">
                          {formatCurrency(currentValue)}
                        </p>
                        <p className="text-[9px] text-hb-tertiary font-mono">
                          cost {formatCurrency(cost)}
                        </p>
                      </div>
                      <div className="w-16 flex justify-end">
                        <PriceChangeInline value={gainPercent} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
