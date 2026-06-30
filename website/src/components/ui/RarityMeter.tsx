'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface RarityMeterProps {
  /** Rarity score from 1-10 */
  score: number;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Optional custom label text */
  label?: string;
  className?: string;
}

/**
 * Interpolate between blue (low rarity) and gold (high rarity)
 * based on a 1-10 score.
 */
function getRarityColor(score: number): string {
  const clamped = Math.max(1, Math.min(10, score));
  const t = (clamped - 1) / 9; // 0 to 1

  // Navy #3B5998 → Gold #C9A84C
  const r = Math.round(59 + (201 - 59) * t);
  const g = Math.round(89 + (168 - 89) * t);
  const b = Math.round(152 + (76 - 152) * t);

  return `rgb(${r}, ${g}, ${b})`;
}

function getRarityGradient(score: number): string {
  const clamped = Math.max(1, Math.min(10, score));
  if (clamped <= 3) return 'from-[#3B5998] to-[#5A7BC0]';
  if (clamped <= 6) return 'from-[#5A7BC0] to-[#8E9A5E]';
  if (clamped <= 8) return 'from-[#8E9A5E] to-[#C9A84C]';
  return 'from-[#C9A84C] to-[#E0C35A]';
}

const RarityMeter: React.FC<RarityMeterProps> = ({
  score,
  showLabel = true,
  label = 'Rarity',
  className = '',
}) => {
  const clamped = Math.max(1, Math.min(10, score));
  const fillPercent = (clamped / 10) * 100;
  const gradient = getRarityGradient(clamped);
  const color = getRarityColor(clamped);

  return (
    <div
      className={['flex flex-col gap-1.5', className]
        .filter(Boolean)
        .join(' ')}
    >
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#8B92A5] font-inter uppercase tracking-wider">
            {label}
          </span>
          <span
            className="text-sm font-mono font-semibold"
            style={{ color }}
          >
            {clamped}/10
          </span>
        </div>
      )}

      {/* Track */}
      <div className="relative h-2 w-full rounded-full bg-[#1E2330] overflow-hidden">
        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className={[
            'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r',
            gradient,
          ].join(' ')}
        />
      </div>
    </div>
  );
};

RarityMeter.displayName = 'RarityMeter';

export { RarityMeter };
export default RarityMeter;
