'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type PriceChangeSize = 'sm' | 'md' | 'lg';

export interface PriceChangeProps {
  /** The percentage change value (e.g., 12.5 for +12.5%) */
  value: number;
  size?: PriceChangeSize;
  className?: string;
}

/** Format a number as a percentage string with sign */
function formatPercent(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toFixed(1);
  if (value > 0) return `+${formatted}%`;
  if (value < 0) return `-${formatted}%`;
  return `${formatted}%`;
}

const sizeConfig: Record<PriceChangeSize, { text: string; icon: number }> = {
  sm: { text: 'text-xs', icon: 12 },
  md: { text: 'text-sm', icon: 14 },
  lg: { text: 'text-base', icon: 16 },
};

const PriceChange: React.FC<PriceChangeProps> = ({
  value,
  size = 'md',
  className = '',
}) => {
  const isPositive = value > 0;
  const isNegative = value < 0;

  const colorClass = isPositive
    ? 'text-[#34D399]' // hb-positive
    : isNegative
      ? 'text-[#F87171]' // hb-negative
      : 'text-[#555B6E]'; // hb-tertiary

  const Icon = isPositive
    ? TrendingUp
    : isNegative
      ? TrendingDown
      : Minus;

  const config = sizeConfig[size];

  return (
    <span
      className={[
        'inline-flex items-center gap-1 font-mono font-medium',
        config.text,
        colorClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon size={config.icon} />
      {formatPercent(value)}
    </span>
  );
};

PriceChange.displayName = 'PriceChange';

export { PriceChange, formatPercent };
export default PriceChange;
