import React from 'react';

export const Logo: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl',
  showText?: boolean,
  light?: boolean,
  className?: string
}> = ({ size = 'md', showText = true, light = false, className = '' }) => {
  const markSize = {
    sm: 'w-6 h-6 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-20 h-20 rounded-[22px]',
    xl: 'w-32 h-32 rounded-[32px]'
  };

  const textSize = {
    sm: 'text-[14px] font-bold',
    md: 'text-[18px] font-bold',
    lg: 'text-[28px] font-bold',
    xl: 'text-[44px] font-bold'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Mark: Clean Yellow background with Black 'H' */}
      <div className={`${markSize[size]} bg-brand-yellow flex items-center justify-center text-black font-extrabold shadow-sm transition-all relative overflow-hidden`}>
         <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xl' : 'text-5xl'}>H</span>
      </div>

      {showText && (
        <span className={`${textSize[size]} tracking-tight font-sans ${light ? 'text-white' : 'text-brand-text-main'}`}>
          Hello<span className={light ? 'text-white/60' : 'text-brand-orange'}>Brick</span>
        </span>
      )}
    </div>
  );
};
