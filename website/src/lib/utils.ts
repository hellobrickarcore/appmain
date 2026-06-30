// ─── HelloBrick Utilities ───────────────────────────────────────────────────

import type {
  PricePoint,
  CollectionItem,
  LegoSet,
  SetValuation,
  PortfolioSummary,
} from '@/types';

// ─── Currency Formatting ────────────────────────────────────────────────────

/**
 * Format a number as USD currency: $1,234.56
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as compact USD: $12.4K, $1.2M
 */
export function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 10_000) {
    return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(2)}K`;
  }
  return formatCurrency(value);
}

// ─── Number / Percent Formatting ────────────────────────────────────────────

/**
 * Format a percentage value: +5.2% or -3.1%
 */
export function formatPercent(value: number, showSign = true): string {
  const formatted = Math.abs(value).toFixed(1);
  if (!showSign) return `${formatted}%`;
  if (value > 0) return `+${formatted}%`;
  if (value < 0) return `-${formatted}%`;
  return `0.0%`;
}

/**
 * Format a number with thousands separators: 1,234
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

// ─── Date Formatting ────────────────────────────────────────────────────────

/**
 * Format an ISO date string as 'Jan 15, 2024'
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format an ISO date string as relative time: '2 hours ago', '3 days ago'
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  if (diffWeek < 5) return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
  return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`;
}

// ─── Class Name Utility ─────────────────────────────────────────────────────

/**
 * Merge class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Price History Generator ────────────────────────────────────────────────

/**
 * Generate realistic price history data points over N months.
 * Uses a random walk with drift based on trend direction.
 */
export function generatePriceHistory(
  basePrice: number,
  months: number,
  trend: 'up' | 'down' | 'stable',
  volatility = 0.03,
): PricePoint[] {
  const points: PricePoint[] = [];
  const now = new Date();

  // Monthly drift factor
  const driftMap = { up: 0.025, down: -0.015, stable: 0.003 };
  const drift = driftMap[trend];

  let sealedPrice = basePrice;
  let usedRatio = 0.62 + Math.random() * 0.12; // used is 62-74% of sealed

  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    date.setDate(1);

    // Apply random walk with drift
    if (i < months) {
      const randomShock = (Math.random() - 0.5) * 2 * volatility;
      const monthlyReturn = drift + randomShock;
      sealedPrice *= 1 + monthlyReturn;

      // Slight variation in used ratio over time
      usedRatio += (Math.random() - 0.5) * 0.02;
      usedRatio = Math.max(0.55, Math.min(0.80, usedRatio));
    }

    points.push({
      date: date.toISOString().split('T')[0],
      sealed: Math.round(sealedPrice * 100) / 100,
      used: Math.round(sealedPrice * usedRatio * 100) / 100,
    });
  }

  return points;
}

// ─── Seeded Random (deterministic for mock data) ────────────────────────────

/**
 * Simple seeded PRNG for deterministic mock data generation.
 */
export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// ─── Portfolio Calculator ───────────────────────────────────────────────────

/**
 * Calculate portfolio summary from collection items, sets, and valuations.
 */
export function calculatePortfolioSummary(
  items: CollectionItem[],
  sets: Map<string, LegoSet>,
  valuations: Map<string, SetValuation>,
): PortfolioSummary {
  let totalValue = 0;
  let totalCost = 0;
  let totalChange24h = 0;
  let totalChange7d = 0;
  let totalChange30d = 0;

  for (const item of items) {
    const valuation = valuations.get(item.setNum);
    if (!valuation) continue;

    // Value based on condition
    const currentValue =
      item.condition === 'sealed'
        ? valuation.sealedValue
        : item.condition === 'used'
          ? valuation.usedValue
          : valuation.usedValue * 0.7; // partial ≈ 70% of used

    totalValue += currentValue;

    if (item.purchasePrice !== null) {
      totalCost += item.purchasePrice;
    } else {
      // Estimate original cost from retail price
      const set = sets.get(item.setNum);
      totalCost += set?.retailPrice ?? currentValue * 0.6;
    }

    // Calculate dollar changes from percentage changes
    const change24hPct =
      item.condition === 'sealed'
        ? valuation.sealedChange24h
        : valuation.usedChange24h;
    const change7dPct =
      item.condition === 'sealed'
        ? valuation.sealedChange7d
        : valuation.usedChange7d;
    const change30dPct =
      item.condition === 'sealed'
        ? valuation.sealedChange30d
        : valuation.usedChange30d;

    totalChange24h += currentValue * (change24hPct / 100);
    totalChange7d += currentValue * (change7dPct / 100);
    totalChange30d += currentValue * (change30dPct / 100);
  }

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  // Generate 12 months of portfolio history
  const portfolioHistory: { date: string; value: number }[] = [];
  const now = new Date();

  for (let i = 12; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    date.setDate(1);

    // Simulate historical portfolio value trending up to current value
    const progress = (12 - i) / 12;
    const startValue = totalCost > 0 ? totalCost : totalValue * 0.7;
    const historicalValue =
      startValue + (totalValue - startValue) * progress +
      (Math.sin(progress * Math.PI * 3) * totalValue * 0.02);

    portfolioHistory.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(historicalValue * 100) / 100,
    });
  }

  return {
    totalSets: items.length,
    totalValue: Math.round(totalValue * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    totalGainLoss: Math.round(totalGainLoss * 100) / 100,
    totalGainLossPercent: Math.round(totalGainLossPercent * 100) / 100,
    change24h: Math.round(totalChange24h * 100) / 100,
    change24hPercent:
      totalValue > 0
        ? Math.round((totalChange24h / totalValue) * 100 * 100) / 100
        : 0,
    change7d: Math.round(totalChange7d * 100) / 100,
    change7dPercent:
      totalValue > 0
        ? Math.round((totalChange7d / totalValue) * 100 * 100) / 100
        : 0,
    change30d: Math.round(totalChange30d * 100) / 100,
    change30dPercent:
      totalValue > 0
        ? Math.round((totalChange30d / totalValue) * 100 * 100) / 100
        : 0,
    portfolioHistory,
  };
}
