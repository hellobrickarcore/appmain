'use client';

import React from 'react';
import { type HTMLMotionProps, motion } from 'framer-motion';

export type CardVariant = 'default' | 'elevated' | 'glass';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  clickable?: boolean;
  hoverEffect?: boolean;
  /** Disable the entry animation */
  noAnimation?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-[#161A22] border border-[#2A2F3C]',
  elevated:
    'bg-[#1E2330] border border-[#2A2F3C] shadow-lg shadow-black/20',
  glass:
    'bg-[#161A22]/60 backdrop-blur-xl border border-[#2A2F3C]/60',
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      clickable = false,
      hoverEffect = false,
      noAnimation = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const shouldHover = clickable || hoverEffect;

    return (
      <motion.div
        ref={ref}
        initial={noAnimation ? undefined : { opacity: 0, y: 10 }}
        animate={noAnimation ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        whileHover={
          shouldHover
            ? {
                scale: 1.01,
                borderColor: 'rgba(59, 89, 152, 0.4)',
              }
            : undefined
        }
        className={[
          'rounded-2xl p-5',
          variantClasses[variant],
          clickable ? 'cursor-pointer' : '',
          shouldHover ? 'transition-shadow hover:shadow-lg hover:shadow-[#3B5998]/5' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
export default Card;
