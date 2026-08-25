"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  X,
  Camera,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { mockSets, getValuation } from "@/lib/mock-data";
import { searchRebrickableSets, generateSyntheticValuation } from "@/lib/rebrickable";
import type { LegoSet } from "@/types";

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

export default function ScanPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "10270-1",
    "75192-1",
    "42115-1",
  ]);
  const [results, setResults] = useState<LegoSet[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const q = query.toLowerCase().trim();

    const localFiltered = mockSets.filter(
      (set) =>
        set.name.toLowerCase().includes(q) ||
        set.setNum.toLowerCase().includes(q) ||
        set.theme.toLowerCase().includes(q)
    );
    setResults(localFiltered.slice(0, 8));

    const delayDebounce = setTimeout(async () => {
      try {
        const liveSets = await searchRebrickableSets(q);
        if (liveSets.length > 0) {
          setResults((prev) => {
            const merged = [...prev];
            liveSets.forEach((lSet) => {
              if (!merged.some((m) => m.setNum === lSet.setNum)) {
                merged.push(lSet);
              }
            });
            return merged.slice(0, 10);
          });
        }
      } catch (err) {
        console.warn("Rebrickable live search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleSelectRecent = (setNum: string) => {
    setQuery(setNum);
  };

  const popularSets = mockSets.filter((s) => s.isRetired).slice(0, 6);

  return (
    <div className="pt-8 pb-20 px-6 max-w-4xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="text-center md:text-left mb-8">
        <h1 className="font-display font-bold text-4xl text-[#050A18] mb-2">Find a Set</h1>
        <p className="text-gray-500 font-medium text-lg">Search the global database to add sets to your collection or wishlist.</p>
      </div>

      {/* Main Search Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        
        {/* Search Input */}
        <div className="relative mb-6">
          <Search
            size={22}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Enter set number (e.g. 75192) or name..."
            className="w-full pl-14 pr-16 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-[#050A18] text-lg font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#FF7A30]/50 focus:ring-4 focus:ring-[#FF7A30]/10 focus:bg-white transition-all font-sans shadow-inner shadow-gray-100/50"
            autoFocus
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                onClick={handleClear}
                className="p-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>
            )}
            {isSearching && (
              <Loader2 size={20} className="text-[#FF7A30] animate-spin" />
            )}
          </div>
        </div>

        {/* Camera Fallback CTA */}
        <div className="mb-8">
          <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all text-gray-500 font-bold group">
            <ScanLine size={20} className="group-hover:scale-110 transition-transform" />
            <span>Have the box? Scan barcode instead</span>
            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#FFCE4A]/20 text-yellow-700 font-bold ml-2">
              BETA
            </span>
          </button>
        </div>

        {/* Search Results Area */}
        <AnimatePresence mode="wait">
          {query.trim() && results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((set, i) => {
                  let val = getValuation(set.setNum);
                  if (!val) {
                    val = generateSyntheticValuation(set.setNum, set.year, set.numParts).valuation;
                  }
                  return (
                    <motion.div
                      key={set.setNum}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        href={`/set/${set.setNum}`}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#FFCE4A] hover:shadow-md transition-all group"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center p-2 relative flex-shrink-0 group-hover:bg-white transition-colors">
                          <img src={set.imageUrl} alt={set.name} className="h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-[#050A18] truncate group-hover:text-[#FF7A30] transition-colors leading-tight mb-1">
                            {set.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">
                              {set.setNum}
                            </span>
                            <span className="text-[12px] font-medium text-gray-500 truncate">
                              {set.theme} · {set.year}
                            </span>
                          </div>
                        </div>

                        {/* Value */}
                        <div className="text-right flex-shrink-0">
                          {val && (
                            <>
                              <p className="font-display text-lg font-bold text-[#050A18]">
                                {formatCurrency(val.sealedValue)}
                              </p>
                              <span
                                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-bold text-[10px] mt-1 ${
                                  val.sealedChange7d >= 0
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {val.sealedChange7d >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {formatPercent(val.sealedChange7d)}
                              </span>
                            </>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {query.trim() && results.length === 0 && !isSearching && (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 border-2 border-dashed border-gray-100 rounded-3xl"
            >
              <Search size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-[#050A18] text-xl font-bold mb-2">
                No sets found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-gray-500 font-medium">
                Try searching for a set number (e.g., 10270) or name.
              </p>
            </motion.div>
          )}

          {!query.trim() && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Popular Sets */}
              <div>
                <div className="flex items-center gap-2 mb-4 px-2">
                  <Sparkles size={16} className="text-[#FF7A30]" />
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                    Popular Right Now
                  </p>
                </div>
                <div className="space-y-3">
                  {popularSets.slice(0, 4).map((set, i) => {
                    const val = getValuation(set.setNum);
                    return (
                      <motion.div
                        key={set.setNum}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          href={`/set/${set.setNum}`}
                          className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-1.5 flex-shrink-0">
                             <img src={set.imageUrl} alt={set.name} className="h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#050A18] truncate group-hover:text-[#FF7A30] transition-colors">
                              {set.name}
                            </p>
                            <p className="text-xs font-medium text-gray-500">
                              {set.setNum} · {set.theme}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-display text-base font-bold text-[#050A18]">
                              {val ? formatCurrency(val.sealedValue) : "—"}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Clock size={16} className="text-gray-400" />
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                      Recent Searches
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => handleSelectRecent(search)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:border-[#FF7A30] hover:text-[#FF7A30] transition-all"
                      >
                        <Search size={14} className="text-gray-400" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
