"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Layers,
  AlertCircle,
} from "lucide-react";
import { mockSets, getValuation } from "@/lib/mock-data";
import type { LegoSet, SetValuation, CollectionItem, ViewMode, SortBy, Condition } from "@/types";

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

function PriceChangeInline({ value }: { value: number }) {
  const isPos = value > 0;
  const isZero = value === 0;
  const Icon = isPos ? ArrowUpRight : isZero ? Minus : ArrowDownRight;
  
  let color = "text-gray-500";
  let bg = "bg-gray-100";
  
  if (isPos) {
    color = "text-green-700";
    bg = "bg-green-100";
  } else if (!isZero) {
    color = "text-red-700";
    bg = "bg-red-100";
  }

  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg ${bg} ${color} font-bold text-xs`}>
      <Icon size={14} />
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

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

  const handleToggleCondition = async (e: React.MouseEvent, id: string, currentCondition: Condition) => {
    e.preventDefault();
    e.stopPropagation();
    const newCondition: Condition = currentCondition === "sealed" ? "used" : "sealed";
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

        return { item, set, val, currentValue, cost, gain, gainPercent };
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

  const summary = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    hydratedCollection.forEach((item) => {
      totalValue += item.currentValue;
      totalCost += item.cost;
    });
    const totalGain = totalValue - totalCost;
    const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    return { totalSets: hydratedCollection.length, totalValue, totalCost, totalGain, gainPercent };
  }, [hydratedCollection]);

  const uniqueThemes = useMemo(() => {
    const themes = new Set<string>();
    hydratedCollection.forEach((c) => themes.add(c.set.theme));
    return Array.from(themes);
  }, [hydratedCollection]);

  const filteredAndSorted = useMemo(() => {
    let result = [...hydratedCollection];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.set.name.toLowerCase().includes(q) ||
          c.set.setNum.toLowerCase().includes(q) ||
          c.set.theme.toLowerCase().includes(q)
      );
    }

    if (selectedCondition !== "all") {
      result = result.filter((c) => c.item.condition === selectedCondition);
    }
    if (selectedTheme !== "all") {
      result = result.filter((c) => c.set.theme === selectedTheme);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name": return a.set.name.localeCompare(b.set.name);
        case "year": return b.set.year - a.set.year;
        case "gain": return b.gainPercent - a.gainPercent;
        case "added": return new Date(b.item.addedAt).getTime() - new Date(a.item.addedAt).getTime();
        case "value":
        default: return b.currentValue - a.currentValue;
      }
    });

    return result;
  }, [hydratedCollection, searchQuery, selectedCondition, selectedTheme, sortBy]);

  return (
    <div className="pt-8 pb-20 px-6 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl text-[#050A18] mb-2">My Collection</h1>
          <p className="text-gray-500 font-medium text-lg">Manage and track your LEGO assets.</p>
        </div>
        <Link
          href="/scan"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF7A30] text-white rounded-xl font-bold hover:bg-[#E66620] shadow-sm shadow-[#FF7A30]/20 transition-all"
        >
          <Plus size={18} /> Add Set
        </Link>
      </div>

      {/* Summary Banner */}
      {!loading && collection.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCE4A] rounded-full blur-[80px] opacity-20 -mr-20 -mt-20 pointer-events-none" />
           <div className="relative z-10 space-y-2">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Portfolio Value</span>
             <div className="flex items-center gap-3">
               <h2 className="font-display font-bold text-4xl md:text-5xl text-[#050A18] tracking-tight">
                 {formatCurrency(summary.totalValue)}
               </h2>
               <PriceChangeInline value={summary.gainPercent} />
             </div>
             <p className="text-sm text-gray-500 font-medium">
               Net Gain: {summary.totalGain >= 0 ? "+" : ""}{formatCurrency(summary.totalGain)} total profit
             </p>
           </div>
           
           <div className="relative z-10 md:text-right md:border-l border-gray-100 md:pl-8 pt-4 md:pt-0 border-t md:border-t-0 mt-4 md:mt-0 flex-shrink-0">
             <p className="font-display text-4xl font-bold text-[#050A18] mb-1">{summary.totalSets}</p>
             <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Assets Owned</p>
           </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search set name, number, theme..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A30] focus:bg-white transition-all"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${
                showFilters || selectedTheme !== "all" || selectedCondition !== "all"
                  ? "bg-[#FFCE4A]/20 border-[#FFCE4A] text-[#050A18]"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <div className="flex items-center rounded-xl bg-gray-50 border border-gray-200 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-[#050A18]" : "text-gray-400 hover:text-gray-700"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-[#050A18]" : "text-gray-400 hover:text-gray-700"}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Condition</label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7A30]"
                  >
                    <option value="all">All Conditions</option>
                    <option value="sealed">Sealed (New)</option>
                    <option value="used">Used (Complete)</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Theme</label>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7A30] truncate"
                  >
                    <option value="all">All Themes</option>
                    {uniqueThemes.map((theme) => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Sort By</label>
                  <div className="flex flex-wrap gap-2">
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
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          sortBy === opt.value
                            ? "bg-[#050A18] border-[#050A18] text-white"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
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

      {/* Main Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#FFCE4A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : collection.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 border-2 border-dashed border-gray-200 rounded-3xl bg-white"
        >
          <Layers size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-display font-bold text-2xl text-[#050A18] mb-2">No Sets in Collection</h3>
          <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">
            Your collection portfolio is empty. Add Lego sets to monitor their investments, resale trends, and gains!
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF7A30] text-white font-bold hover:bg-[#E66620] shadow-sm shadow-[#FF7A30]/20 transition-all"
          >
            <Plus size={18} /> Scan & Add Set
          </Link>
        </motion.div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-900 font-bold text-lg mb-1">No assets match "{searchQuery}"</p>
          <p className="text-gray-500 font-medium">Try resetting your condition or theme filters.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSorted.map(({ item, set, val, currentValue, cost, gain, gainPercent }) => {
              return viewMode === "grid" ? (
                <motion.div key={item.id} layout variants={itemVariants} exit={{ opacity: 0, scale: 0.9 }}>
                  <Link
                    href={`/set/${set.setNum}`}
                    className="block rounded-3xl border border-gray-100 bg-white overflow-hidden hover:border-[#FFCE4A] hover:shadow-lg transition-all group h-full flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-gray-50 p-6 flex items-center justify-center relative">
                      <span className="absolute bottom-3 left-3 text-xs font-mono font-bold text-gray-400">
                        {set.setNum}
                      </span>
                      <button
                        onClick={(e) => handleToggleCondition(e, item.id, item.condition)}
                        className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider z-10 transition-colors shadow-sm ${
                          item.condition === "sealed" 
                            ? "bg-[#FFCE4A] text-[#050A18]" 
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.condition}
                      </button>
                      <img
                        src={set.imageUrl}
                        alt={set.name}
                        className="h-full object-contain filter drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-4">
                        <p className="text-[#050A18] font-bold text-lg leading-tight line-clamp-2 group-hover:text-[#FF7A30] transition-colors mb-1">
                          {set.name}
                        </p>
                        <p className="text-gray-400 font-bold text-xs">{set.theme}</p>
                      </div>
                      <div className="mt-auto flex items-end justify-between pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block mb-1">Value</span>
                          <span className="font-display font-bold text-2xl text-[#050A18] leading-none">
                            {formatCurrency(currentValue)}
                          </span>
                        </div>
                        <PriceChangeInline value={gainPercent} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ) : (
                <motion.div key={item.id} layout variants={itemVariants} exit={{ opacity: 0, x: -20 }}>
                  <Link
                    href={`/set/${set.setNum}`}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-[#FFCE4A] transition-all group"
                  >
                    <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center p-2 relative flex-shrink-0">
                      <img src={set.imageUrl} alt={set.name} className="h-full object-contain group-hover:scale-110 transition-transform" />
                      <button
                        onClick={(e) => handleToggleCondition(e, item.id, item.condition)}
                        className={`absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white z-10 ${
                          item.condition === "sealed" ? "bg-[#FFCE4A]" : "bg-gray-400"
                        }`}
                        title={item.condition === "sealed" ? "Sealed" : "Used"}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-lg text-[#050A18] truncate group-hover:text-[#FF7A30] transition-colors">
                          {set.name}
                        </p>
                        {set.isRetired && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-100 text-red-700 uppercase tracking-wider">
                            Retired
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{set.setNum}</span>
                        <span>{set.theme}</span>
                        <span>·</span>
                        <span className="capitalize">{item.condition}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex items-center gap-6">
                      <div className="hidden sm:block">
                        <p className="font-display text-2xl font-bold text-[#050A18]">{formatCurrency(currentValue)}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">cost {formatCurrency(cost)}</p>
                      </div>
                      <PriceChangeInline value={gainPercent} />
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
