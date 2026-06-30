"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ScanLine,
  Search,
  Plus,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  mockSets,
  mockCollection,
  mockValuations,
  mockPortfolioHistory,
  trendingSets,
  getValuation,
} from "@/lib/mock-data";
import type { LegoSet, SetValuation } from "@/types";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
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

function PriceChangeInline({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const isPositive = value > 0;
  const isZero = value === 0;
  const Icon = isPositive ? ArrowUpRight : isZero ? Minus : ArrowDownRight;
  const color = isPositive
    ? "text-[#34D399]"
    : isZero
    ? "text-[#555B6E]"
    : "text-[#F87171]";
  const bg = isPositive
    ? "bg-[#34D399]/10"
    : isZero
    ? "bg-[#555B6E]/10"
    : "bg-[#F87171]/10";

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${bg} ${color} font-mono ${
        size === "sm" ? "text-[11px]" : "text-[13px]"
      }`}
    >
      <Icon size={size === "sm" ? 11 : 13} />
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
        if (data) setCollection(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Calculate portfolio summary from live data
  const portfolioValue = useMemo(() => {
    let total = 0;
    let totalCost = 0;
    collection.forEach((item) => {
      const val = getValuation(item.setNum);
      if (val) {
        total +=
          item.condition === "sealed" ? val.sealedValue : val.usedValue;
      }
      if (item.purchasePrice) {
        totalCost += item.purchasePrice;
      }
    });
    return { total, totalCost, gain: total - totalCost };
  }, [collection]);

  const gainPercent =
    portfolioValue.totalCost > 0
      ? ((portfolioValue.gain / portfolioValue.totalCost) * 100)
      : 0;

  // Get the user's collection sets with valuations
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

  // Sort by value descending
  const topSets = [...collectionWithData].sort(
    (a, b) =>
      (b.item.condition === "sealed" ? b.val.sealedValue : b.val.usedValue) -
      (a.item.condition === "sealed" ? a.val.sealedValue : a.val.usedValue)
  );

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="px-4 py-5 max-w-2xl mx-auto space-y-5"
    >
      {/* Portfolio Summary Card */}
      <motion.div
        variants={fadeUp}
        className="relative rounded-2xl border border-[#2A2F3C] bg-[#161A22] p-5 overflow-hidden"
      >
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#C9A84C]/[0.04] blur-[60px]" />

        <div className="relative z-10">
          <p className="text-[#8B92A5] text-xs font-medium uppercase tracking-wider mb-1">
            Collection Value
          </p>
          <div className="flex items-end gap-3 mb-1">
            <h2 className="font-mono font-bold text-3xl sm:text-4xl text-[#F0F2F5]">
              {formatCurrency(portfolioValue.total)}
            </h2>
            <PriceChangeInline value={gainPercent} size="md" />
          </div>
          <p className="text-[#555B6E] text-xs font-mono">
            {portfolioValue.gain >= 0 ? "+" : ""}
            {formatCurrency(portfolioValue.gain)} total gain ·{" "}
            {mockCollection.length} sets
          </p>

          {/* Mini chart placeholder */}
          <div className="mt-4 h-16 flex items-end gap-[3px]">
            {mockPortfolioHistory.slice(-30).map((point, i) => {
              const max = Math.max(
                ...mockPortfolioHistory.slice(-30).map((p) => p.value)
              );
              const min = Math.min(
                ...mockPortfolioHistory.slice(-30).map((p) => p.value)
              );
              const height =
                max === min
                  ? 50
                  : ((point.value - min) / (max - min)) * 100;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 8)}%` }}
                  transition={{ delay: i * 0.02, duration: 0.4 }}
                  className={`flex-1 rounded-sm ${
                    i === mockPortfolioHistory.slice(-30).length - 1
                      ? "bg-[#C9A84C]"
                      : "bg-[#C9A84C]/20"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        {[
          { href: "/scan", icon: ScanLine, label: "Scan Set" },
          { href: "/scan", icon: Search, label: "Search" },
          { href: "/collection", icon: Plus, label: "Add Set" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#2A2F3C] bg-[#161A22] hover:bg-[#1E2330] hover:border-[#3A4050] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1E2330] border border-[#2A2F3C] flex items-center justify-center">
                <Icon size={18} className="text-[#C9A84C]" />
              </div>
              <span className="text-[12px] font-medium text-[#8B92A5]">
                {action.label}
              </span>
            </Link>
          );
        })}
      </motion.div>

      {/* Trending Sets */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-outfit font-semibold text-[15px] text-[#F0F2F5]">
            Trending Sets
          </h3>
          <Link
            href="/trending"
            className="text-[12px] text-[#C9A84C] font-medium flex items-center gap-0.5 hover:brightness-110"
          >
            View All <ChevronRight size={13} />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {trendingSets.map((set, i) => {
            const val = getValuation(set.setNum);
            return (
              <motion.div
                key={set.setNum}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={`/set/${set.setNum}`}
                  className="block w-[140px] flex-shrink-0 rounded-2xl border border-[#2A2F3C] bg-[#161A22] overflow-hidden hover:border-[#3A4050] transition-colors"
                >
                  <div className="aspect-square bg-[#1E2330] flex items-center justify-center p-3 relative">
                    <div className="w-full h-full rounded-lg bg-[#2A2F3C]/30 flex items-center justify-center">
                      <span className="text-[#555B6E] text-[10px] font-mono">
                        {set.setNum}
                      </span>
                    </div>
                    {set.isRetired && (
                      <span className="absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-[#C46D4E]/15 text-[#C46D4E]">
                        RETIRED
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] text-[#8B92A5] truncate mb-0.5">
                      {set.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[13px] font-semibold text-[#F0F2F5]">
                        {val ? formatCurrency(val.sealedValue) : "—"}
                      </span>
                      {val && (
                        <PriceChangeInline value={val.sealedChange7d} />
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Your Top Sets */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-outfit font-semibold text-[15px] text-[#F0F2F5]">
            Your Top Sets
          </h3>
          <Link
            href="/collection"
            className="text-[12px] text-[#C9A84C] font-medium flex items-center gap-0.5 hover:brightness-110"
          >
            View All <ChevronRight size={13} />
          </Link>
        </div>

        <div className="space-y-2">
          {topSets.slice(0, 5).map(({ item, set, val }, i) => {
            const currentValue =
              item.condition === "sealed"
                ? val.sealedValue
                : val.usedValue;
            const change =
              item.condition === "sealed"
                ? val.sealedChange7d
                : val.usedChange7d;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/set/${set.setNum}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#2A2F3C] bg-[#161A22] hover:bg-[#1E2330] hover:border-[#3A4050] transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-[#1E2330] border border-[#2A2F3C] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#555B6E] text-[8px] font-mono">
                      {set.setNum}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#F0F2F5] truncate">
                      {set.name}
                    </p>
                    <p className="text-[11px] text-[#555B6E]">
                      {set.theme} · {set.year}
                    </p>
                  </div>

                  {/* Value */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-[14px] font-semibold text-[#F0F2F5]">
                      {formatCurrency(currentValue)}
                    </p>
                    <PriceChangeInline value={change} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
