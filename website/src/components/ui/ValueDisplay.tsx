'use client';

import React from 'react';
import { PriceChange, type PriceChangeSize } from './PriceChange';

export type ValueDisplaySize = 'sm' | 'md' | 'lg';

export interface ValueDisplayProps {
  /** The numeric value to display */
  value: number;
  /** Currency code, defaults to USD */
  currency?: string;
  /** Optional label above the value (e.g. 'Sealed Value') */
  label?: string;
  /** Optional percentage change to show beneath */
  change?: number;
  size?: ValueDisplaySize;
  className?: string;
}

const sizeConfig: Record<
  ValueDisplaySize,
  { label: string; value: string; changeSize: PriceChangeSize }
> = {
  sm: {
    label: 'text-xs',
    value: 'text-lg',
    changeSize: 'sm',
  },
  md: {
    label: 'text-sm',
    value: 'text-2xl',
    changeSize: 'md',
  },
  lg: {
    label: 'text-sm',
    value: 'text-4xl',
    changeSize: 'md',
  },
};

function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({
  value,
  currency = 'USD',
  label,
  change,
  size = 'md',
  className = '',
}) => {
  const config = sizeConfig[size];

  return (
    <div className={['flex flex-col', className].filter(Boolean).join(' ')}>
      {label && (
        <span
          className={[
            'text-[#8B92A5] font-inter uppercase tracking-wider mb-1',
            config.label,
          ].join(' ')}
        >
          {label}
        </span>
      )}
      <span
        className={[
          'font-mono font-semibold text-[#F0F2F5] tracking-tight',
          config.value,
        ].join(' ')}
      >
        {formatCurrency(value, currency)}
      </span>
      {change !== undefined && (
        <div className="mt-1">
          <PriceChange value={change} size={config.changeSize} />
        </div>
      )}
    </div>
  );
};

ValueDisplay.displayName = 'ValueDisplay';

export { ValueDisplay, formatCurrency };
export default ValueDisplay;
