import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, subtitle, loading }) => {
  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group overflow-hidden relative">
      <div className="flex flex-col gap-1 relative z-10">
        <h3 className="text-[12px] font-bold text-brand-text-dim uppercase tracking-wider group-hover:text-white/40 transition-colors">
          {title}
        </h3>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-white tracking-tighter">
            {loading ? <div className="w-16 h-8 bg-white/5 animate-pulse rounded-md" /> : value}
          </span>
          {trend && !loading && (
            <div className={cn(
              "flex items-center gap-1 text-[13px] font-black",
              trend.isPositive ? "text-green-400" : "text-red-400"
            )}>
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}%
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] text-brand-text-dim font-bold mt-2 group-hover:text-white/30 transition-colors">
            {subtitle}
          </p>
        )}
      </div>

      {/* Decorative Sparkline Placeholder / Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:24px_24px]" />
      </div>
    </div>
  );
};
