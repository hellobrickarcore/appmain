// Definitive HelloBrick Logo Component
import * as React from 'react';

export const Logo: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl',
  showText?: boolean,
  light?: boolean,
  className?: string
}> = ({ size = 'md', showText = true, light = false, className = '' }) => {
  const markSize = {
    sm: 'w-6 h-6 rounded-lg',
    md: 'w-10 h-10 rounded-[12px]',
    lg: 'w-20 h-20 rounded-[22px]',
    xl: 'w-32 h-32 rounded-[32px]'
  };


  const textSize = {
    sm: 'text-sm font-black',
    md: 'text-xl font-black',
    lg: 'text-3xl font-black',
    xl: 'text-5xl font-black'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* The Brick Mark: Yellow background, Orange box, two black dots */}
      <div className={`${markSize[size]} bg-[#FFD600] flex items-center justify-center shadow-lg relative overflow-hidden p-1`}>
         <div className="w-[85%] h-[85%] bg-[#FF7A30] rounded-[30%] flex items-center justify-center gap-1.5 relative">
            <div className="w-[18%] h-[18%] bg-black rounded-full" />
            <div className="w-[18%] h-[18%] bg-black rounded-full" />
         </div>
         {/* Subtle Gloss */}
         <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10" />
      </div>

      {showText && (
        <span className={`${textSize[size]} tracking-tight ${light ? 'text-white' : 'text-[#0A1229]'}`}>
          HelloBrick
        </span>
      )}
    </div>
  );
};
