// Definitive HelloBrick Logo Component
import * as React from 'react';

export const Logo: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl',
  showText?: boolean,
  light?: boolean,
  className?: string
}> = ({ size = 'md', showText = true, light = false, className = '' }) => {
  const textSize = {
    sm: 'text-[17px] font-bold tracking-tight font-sans',
    md: 'text-2xl font-bold tracking-tight font-sans',
    lg: 'text-4xl font-bold tracking-tight font-sans',
    xl: 'text-6xl font-bold tracking-tight font-sans'
  };

  if (!showText) return null;

  return (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <span className={`${textSize[size]} ${light ? 'text-white' : 'text-[#111111]'}`}>
        HelloBrick
      </span>
    </div>
  );
};
