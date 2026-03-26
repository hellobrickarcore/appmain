import React from 'react';

export const Logo: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl',
  showText?: boolean,
  light?: boolean,
  className?: string
}> = ({ size = 'md', showText = true, light = true, className = '' }) => {
  const markSize = {
    sm: 'w-6 h-6 rounded-lg',
    md: 'w-10 h-10 rounded-[12px]',
    lg: 'w-20 h-20 rounded-[24px]',
    xl: 'w-32 h-32 rounded-[36px]'
  };

  const textSize = {
    sm: 'text-sm font-black',
    md: 'text-[20px] font-bold',
    lg: 'text-3xl font-black',
    xl: 'text-5xl font-black'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* The Brand Mark: Yellow background with Black 'H' */}
      <div className={`${markSize[size]} bg-brand-yellow flex items-center justify-center text-black font-black rotate-[-3deg] shadow-[0_0_20px_rgba(255,206,74,0.2)] transition-transform duration-300 hover:rotate-0 relative overflow-hidden`}>
         <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-2xl pt-0.5' : 'text-5xl'}>H</span>
         {/* Subtle Gloss */}
         <div className="absolute top-0 left-0 w-full h-[30%] bg-white/20" />
      </div>

      {showText && (
        <span className={`${textSize[size]} tracking-tight font-sans ${light ? 'text-white' : 'text-brand-navy'}`}>
          Hello<span className="text-brand-orange">Brick</span>
        </span>
      )}
    </div>
  );
};
