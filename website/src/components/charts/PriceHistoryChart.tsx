"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PricePoint, TimeRange } from "@/types";

interface PriceHistoryChartProps {
  priceHistory: PricePoint[];
  basePrice?: number;
}

export function PriceHistoryChart({ priceHistory, basePrice }: PriceHistoryChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1y");

  // Filter price history based on selected time range
  const filteredData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];
    
    const now = new Date();
    let cutoffDate = new Date();

    switch (timeRange) {
      case "7d":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
      default:
        return priceHistory;
    }

    const cutoffStr = cutoffDate.toISOString().split("T")[0];
    return priceHistory.filter((pt) => pt.date >= cutoffStr);
  }, [priceHistory, timeRange]);

  // Format dates for XAxis
  const formatXAxis = (tickItem: string) => {
    try {
      const date = new Date(tickItem);
      if (timeRange === "7d" || timeRange === "30d") {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    } catch {
      return tickItem;
    }
  };

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
    { value: "90d", label: "3M" },
    { value: "1y", label: "1Y" },
    { value: "all", label: "ALL" },
  ];

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-semibold text-hb-secondary uppercase tracking-wider font-outfit">
          Price History
        </h4>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-hb-surface border border-hb-border">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold font-outfit transition-all ${
                timeRange === range.value
                  ? "bg-hb-elevated text-hb-gold shadow-sm border border-hb-border"
                  : "text-hb-secondary hover:text-hb-primary border border-transparent"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-[220px] w-full chart-container bg-hb-surface/30 rounded-2xl border border-hb-border/50 p-4">
        {filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-hb-tertiary text-sm">
            No price history data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSealed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B92A5" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#8B92A5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tickFormatter={(val) => `$${Math.round(val)}`}
                axisLine={false}
                tickLine={false}
                dx={-8}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as PricePoint;
                    return (
                      <div className="glass-elevated border border-hb-border rounded-xl p-3 shadow-xl space-y-1.5 min-w-[120px]">
                        <p className="text-[11px] text-hb-tertiary font-mono">
                          {formatDate(data.date)}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[12px] font-medium text-hb-gold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                              Sealed
                            </span>
                            <span className="text-[12px] font-mono font-semibold text-hb-primary">
                              {formatCurrency(data.sealed)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[12px] font-medium text-hb-secondary flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8B92A5]" />
                              Used
                            </span>
                            <span className="text-[12px] font-mono font-semibold text-hb-primary">
                              {formatCurrency(data.used)}
                            </span>
                          </div>
                          {basePrice && (
                            <div className="border-t border-hb-border/50 pt-1 mt-1 flex items-center justify-between gap-4">
                              <span className="text-[10px] text-hb-tertiary">Retail</span>
                              <span className="text-[10px] font-mono text-hb-tertiary">
                                {formatCurrency(basePrice)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="sealed"
                stroke="#C9A84C"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSealed)"
                name="Sealed"
              />
              <Area
                type="monotone"
                dataKey="used"
                stroke="#8B92A5"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorUsed)"
                name="Used"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
