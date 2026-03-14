// @ts-nocheck

import * as React from 'react';

export const Logo: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl',
  showText?: boolean,
  inverted?: boolean,
  className?: string
}> = ({ size = 'md', showText = false, inverted = false, className = '' }) => {
  // Size configurations for mark only
  const markSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  // Size configurations for text
  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  // Inner square size relative to mark
  const innerSizeClasses = {
    sm: 'w-3 h-3 rounded-[3px]',
    md: 'w-5 h-5 rounded-[6px]',
    lg: 'w-8 h-8 rounded-[12px]',
    xl: 'w-12 h-12 rounded-[12px]'
  };

  // Small squares size
  const squareSizeClasses = {
    sm: 'w-0.5 h-0.5 rounded-[0.5px]',
    md: 'w-1 h-1 rounded-[1px]',
    lg: 'w-1.5 h-1.5 rounded-[1px]',
    xl: 'w-1.5 h-1.5 rounded-[1px]'
  };

  // Mark component
  const Mark = () => (
    <div
      className={`${markSizeClasses[size]} bg-[#FFD600] rounded-[26px] flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(255,214,0,0.5)]`}
      style={{ borderRadius: size === 'xl' ? '40px' : size === 'lg' ? '32px' : size === 'md' ? '20px' : '12px' }}
    >
      <div className={`${innerSizeClasses[size]} bg-[#FF7A30] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]`}
           style={{ borderRadius: size === 'xl' ? '20px' : size === 'lg' ? '16px' : size === 'md' ? '10px' : '6px' }}>
        <div className="flex gap-1 xl:gap-2">
          <div className={`${squareSizeClasses[size]} bg-black rounded-full shadow-sm`}></div>
          <div className={`${squareSizeClasses[size]} bg-black rounded-full shadow-sm`}></div>
        </div>
      </div>
    </div>
  );

  // If only mark is needed (no text)
  if (!showText) {
    return (
      <div className={`relative flex items-center justify-center cursor-pointer ${className}`}>
        <Mark />
      </div>
    );
  }

  // Full logo with text
  return (
    <div className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <Mark />
      <div className="flex items-baseline leading-none">
        <span
          className={`${textSizeClasses[size]} font-bold text-slate-900 tracking-tight`}
          style={{
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '-0.03em'
          }}
        >
          Hello
        </span>
        <span
          className={`${textSizeClasses[size]} font-bold text-[#F97316] ml-[1px]`}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '-0.08em'
          }}
        >
          Brick
        </span>
      </div>
    </div>
  );
};
