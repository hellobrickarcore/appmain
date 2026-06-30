'use client';

import React, { useEffect, useRef } from 'react';
import {
  useMotionValue,
  useTransform,
  animate,
  motion,
} from 'framer-motion';

export interface AnimatedCounterProps {
  /** Target numeric value to count up to */
  value: number;
  /** Currency code, defaults to USD */
  currency?: string;
  /** Animation duration in seconds */
  duration?: number;
  className?: string;
}

function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  currency = 'USD',
  duration = 1.5,
  className = '',
}) => {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) =>
    formatCurrency(latest, currency)
  );
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: 'easeOut',
    });

    return () => controls.stop();
  }, [motionValue, value, duration]);

  // Subscribe to the rounded transform to update the text content
  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = latest;
      }
    });

    return () => unsubscribe();
  }, [rounded]);

  return (
    <motion.span
      ref={nodeRef}
      className={[
        'font-mono font-semibold text-[#F0F2F5] tabular-nums',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {formatCurrency(0, currency)}
    </motion.span>
  );
};

AnimatedCounter.displayName = 'AnimatedCounter';

export { AnimatedCounter };
export default AnimatedCounter;
