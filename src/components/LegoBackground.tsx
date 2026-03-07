
import React from 'react';

export const LegoBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#FAFAFA]">
      {/* Gradient Wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-blue-50 opacity-80" />
      
      {/* Abstract Building Brick Stud Pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
           style={{
             backgroundImage: `radial-gradient(#000 15%, transparent 16%), radial-gradient(#000 15%, transparent 16%)`,
             backgroundSize: '40px 40px',
             backgroundPosition: '0 0, 20px 20px'
           }}
      />
      
      {/* Floating Bricks (CSS Shapes) */}
      <div className="absolute top-20 left-[-20px] w-32 h-32 bg-yellow-400 rounded-xl rotate-12 opacity-10 blur-xl" />
      <div className="absolute top-[40%] right-[-40px] w-48 h-48 bg-red-400 rounded-full opacity-5 blur-2xl" />
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-blue-400 rounded-lg -rotate-6 opacity-5 blur-xl" />
      
      {/* Random Sharp Bricks */}
      <div className="absolute top-1/4 left-1/4 w-4 h-8 bg-slate-900 opacity-[0.02] -rotate-45 rounded-[1px]" />
      <div className="absolute top-1/2 right-1/4 w-8 h-4 bg-slate-900 opacity-[0.02] rotate-12 rounded-[1px]" />
      <div className="absolute bottom-1/3 left-1/2 w-6 h-6 bg-slate-900 opacity-[0.02] rotate-45 rounded-[1px]" />
    </div>
  );
};
