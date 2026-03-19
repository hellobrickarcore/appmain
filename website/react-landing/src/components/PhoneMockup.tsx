import React from 'react';

export const PhoneMockup: React.FC<{ 
  src: string; 
  className?: string;
  glow?: boolean;
}> = ({ src, className = '', glow = false }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Glow Effect */}
      {glow && (
        <div className="absolute -inset-10 bg-brand-orange/20 blur-[100px] rounded-full animate-pulse pointer-events-none" />
      )}
      
      {/* Phone Frame */}
      <div className="relative mx-auto w-[280px] h-[580px] bg-slate-900 rounded-[3.5rem] p-3 shadow-2xl border-4 border-slate-100 ring-1 ring-slate-900/10">
        {/* Notch/Dynamic Island */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-6 bg-slate-900 rounded-full z-20" />
        
        {/* Screen Container */}
        <div className="w-full h-full bg-black rounded-[2.8rem] overflow-hidden relative border border-slate-800">
          <img 
            src={src} 
            alt="App Screenshot" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Side Buttons */}
        <div className="absolute -left-1 top-24 w-1 h-12 bg-slate-800 rounded-r-lg" />
        <div className="absolute -left-1 top-40 w-1 h-16 bg-slate-800 rounded-r-lg" />
        <div className="absolute -right-1 top-32 w-1 h-20 bg-slate-800 rounded-l-lg" />
      </div>
    </div>
  );
};
