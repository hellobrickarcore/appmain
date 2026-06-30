'use client';

import React from 'react';

export type BadgeVariant = 'retired' | 'rising' | 'new' | 'falling' | 'theme';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  retired: 'bg-[#C46D4E]/15 text-[#C46D4E] border-[#C46D4E]/20',
  rising: 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/20',
  new: 'bg-[#3B5998]/20 text-[#6B8FD4] border-[#3B5998]/20',
  falling: 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/20',
  theme: 'bg-[#3B5998]/15 text-[#8BAAE6] border-[#3B5998]/20',
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'new',
  icon,
  children,
  className = '',
  ...props
}) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        'font-inter',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export { Badge };
export default Badge;
