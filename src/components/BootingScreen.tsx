import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

export const BootingScreen: React.FC = () => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setOpacity(1);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#050A18] flex flex-col items-center justify-center z-[10000]">
      <div className="relative">
        {/* Glow behind logo */}
        <div className="absolute inset-0 bg-orange-500/20 blur-[60px] rounded-full animate-pulse" />
        
        <div className="relative flex flex-col items-center gap-8">
          <div className="animate-in zoom-in duration-1000">
            <Logo size="xl" showText={false} />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-black text-white tracking-tighter">
              <span className="text-orange-500">Hello</span>Brick
            </h1>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" 
                  style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
        Initializing Engine
      </div>
    </div>
  );
};
