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
      <div className="relative mx-auto w-[280px] h-[580px] bg-[#020617] rounded-[3.5rem] p-2.5 shadow-2xl border-[6px] border-[#1e293b] ring-1 ring-white/10">
        {/* Notch/Dynamic Island */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20 flex items-center justify-end px-4">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20 blur-[1px]" />
        </div>
        
        {/* Screen Container */}
        <div className="w-full h-full bg-black rounded-[2.8rem] overflow-hidden relative border border-white/5">
          <img 
            src={src} 
            alt="App Screenshot" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Side Buttons */}
        <div className="absolute -left-1.5 top-24 w-1.5 h-12 bg-[#1e293b] rounded-l-lg border-l border-white/5" />
        <div className="absolute -left-1.5 top-40 w-1.5 h-16 bg-[#1e293b] rounded-l-lg border-l border-white/5" />
        <div className="absolute -right-1.5 top-32 w-1.5 h-20 bg-[#1e293b] rounded-r-lg border-r border-white/5" />
      </div>
    </div>
  );
};
