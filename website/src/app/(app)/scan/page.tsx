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

  // Debounced search logic combining instant local mockup data + live API call
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const q = query.toLowerCase().trim();

    // 1. Instant local search (WOW factor: ultra-responsive UX)
    const localFiltered = mockSets.filter(
      (set) =>
        set.name.toLowerCase().includes(q) ||
        set.setNum.toLowerCase().includes(q) ||
        set.theme.toLowerCase().includes(q)
    );
    setResults(localFiltered.slice(0, 8));

    // 2. Debounced live Rebrickable fetch
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

  // Popular / suggested sets
  const popularSets = mockSets.filter((s) => s.isRetired).slice(0, 6);


  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-outfit font-bold text-xl text-[#F0F2F5] mb-1">
          Find a Set
        </h1>
        <p className="text-[#555B6E] text-[13px]">
          Search by name, set number, or theme
        </p>
      </motion.div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-5"
      >
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555B6E]"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Enter set number or name..."
            className="w-full pl-11 pr-20 py-3.5 rounded-2xl bg-[#161A22] border border-[#2A2F3C] text-[#F0F2F5] text-[15px] placeholder:text-[#555B6E] focus:outline-none focus:border-[#C9A84C]/40 focus:ring-1 focus:ring-[#C9A84C]/20 transition-all font-inter"
            autoFocus
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query && (
              <button
                onClick={handleClear}
                className="p-1 rounded-lg hover:bg-[#2A2F3C] transition-colors"
              >
                <X size={16} className="text-[#555B6E]" />
              </button>
            )}
            {isSearching && (
              <Loader2 size={16} className="text-[#C9A84C] animate-spin" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Camera Fallback CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <button className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-dashed border-[#2A2F3C] bg-[#161A22]/50 text-[#555B6E] hover:border-[#3A4050] hover:text-[#8B92A5] transition-all">
          <Camera size={17} />
          <span className="text-[13px] font-medium">
            Or scan with camera
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#C9A84C]/10 text-[#C9A84C] font-medium">
            BETA
          </span>
        </button>
      </motion.div>

      {/* Search Results */}
      <AnimatePresence mode="wait">
        {query.trim() && results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6"
          >
            <p className="text-[#555B6E] text-[11px] font-medium uppercase tracking-wider mb-2.5 px-1">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-1.5">
              {results.map((set, i) => {
                let val = getValuation(set.setNum);
                if (!val) {
                  val = generateSyntheticValuation(set.setNum, set.year, set.numParts).valuation;
                }
                return (

                  <motion.div
                    key={set.setNum}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={`/set/${set.setNum}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[#2A2F3C] bg-[#161A22] hover:bg-[#1E2330] hover:border-[#3A4050] transition-all"
                    >
                      {/* Thumbnail placeholder */}
                      <div className="w-14 h-14 rounded-lg bg-[#1E2330] border border-[#2A2F3C] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#555B6E] text-[8px] font-mono leading-tight text-center">
                          {set.setNum}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#F0F2F5] truncate">
                          {set.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-[#555B6E] font-mono">
                            #{set.setNum}
                          </span>
                          <span className="text-[11px] text-[#555B6E]">
                            · {set.theme}
                          </span>
                          <span className="text-[11px] text-[#555B6E]">
                            · {set.year}
                          </span>
                        </div>
                        {set.isRetired && (
                          <span className="inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-[#C46D4E]/15 text-[#C46D4E]">
                            RETIRED
                          </span>
                        )}
                      </div>

                      {/* Value */}
                      <div className="text-right flex-shrink-0">
                        {val && (
                          <>
                            <p className="font-mono text-[14px] font-semibold text-[#F0F2F5]">
                              {formatCurrency(val.sealedValue)}
                            </p>
                            <span
                              className={`inline-flex items-center gap-0.5 text-[11px] font-mono ${
                                val.sealedChange7d >= 0
                                  ? "text-[#34D399]"
                                  : "text-[#F87171]"
                              }`}
                            >
                              {val.sealedChange7d >= 0 ? (
                                <ArrowUpRight size={11} />
                              ) : (
                                <ArrowDownRight size={11} />
                              )}
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
            className="text-center py-12"
          >
            <Search size={36} className="text-[#2A2F3C] mx-auto mb-3" />
            <p className="text-[#555B6E] text-[14px]">
              No sets found for &ldquo;{query}&rdquo;
            </p>
            <p className="text-[#555B6E] text-[12px] mt-1">
              Try a set number (e.g., 10270) or name
            </p>
          </motion.div>
        )}

        {!query.trim() && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <p className="text-[#555B6E] text-[11px] font-medium uppercase tracking-wider mb-2.5 px-1">
                  Recent Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleSelectRecent(search)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2A2F3C] bg-[#161A22] text-[13px] text-[#8B92A5] hover:bg-[#1E2330] hover:border-[#3A4050] transition-all"
                    >
                      <Clock size={13} className="text-[#555B6E]" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Sets */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5 px-1">
                <Sparkles size={13} className="text-[#C9A84C]" />
                <p className="text-[#555B6E] text-[11px] font-medium uppercase tracking-wider">
                  Popular Sets
                </p>
              </div>
              <div className="space-y-1.5">
                {popularSets.map((set, i) => {
                  const val = getValuation(set.setNum);
                  return (
                    <motion.div
                      key={set.setNum}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={`/set/${set.setNum}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-[#2A2F3C]/60 bg-[#161A22]/60 hover:bg-[#1E2330] hover:border-[#3A4050] transition-all"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#1E2330] border border-[#2A2F3C] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#555B6E] text-[7px] font-mono">
                            {set.setNum}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-[#F0F2F5] truncate">
                            {set.name}
                          </p>
                          <p className="text-[11px] text-[#555B6E]">
                            {set.theme} · {set.year}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-mono text-[13px] font-semibold text-[#F0F2F5]">
                            {val ? formatCurrency(val.sealedValue) : "—"}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
