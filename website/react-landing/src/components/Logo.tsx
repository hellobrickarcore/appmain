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
    lg: 'w-20 h-20 rounded-[22px]',
    xl: 'w-32 h-32 rounded-[32px]'
  };

  const eyeSize = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3'
  };

  const textSize = {
    sm: 'text-sm font-black',
    md: 'text-xl font-black',
    lg: 'text-3xl font-black',
    xl: 'text-5xl font-black'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* The Mascot Mark */}
      <div className={`${markSize[size]} bg-brand-orange flex items-center justify-center shadow-lg relative overflow-hidden border-2 border-white/10`}>
         <div className="flex gap-[25%] relative z-10">
            <div className={`${eyeSize[size]} bg-black rounded-full`} />
            <div className={`${eyeSize[size]} bg-black rounded-full`} />
         </div>
         {/* Subtle Gloss */}
         <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10" />
      </div>

      {showText && (
        <span className={`${textSize[size]} tracking-tight uppercase ${light ? 'text-white' : 'text-brand-navy'}`}>
          Hello<span className="text-brand-orange">Brick</span>
        </span>
      )}
    </div>
  );
};
