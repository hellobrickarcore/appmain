import React from 'react';

export default function VisualProof() {
  return (
    <section className="bg-[#111111] py-0 overflow-hidden w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="relative aspect-square md:aspect-auto h-full min-h-[500px]">
          <img src="/images/messy_pile.png" className="absolute inset-0 w-full h-full object-cover" alt="Before" />
          <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
            <span className="text-white font-bold text-lg uppercase tracking-widest">From this 👇</span>
          </div>
        </div>
        <div className="relative aspect-square md:aspect-auto h-full min-h-[500px]">
          <img src="/images/build_result.png" className="absolute inset-0 w-full h-full object-cover" alt="After" />
          <div className="absolute top-8 right-8 bg-[#FF5A00] backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
            <span className="text-white font-bold text-lg uppercase tracking-widest">To this 👇</span>
          </div>
        </div>
      </div>
    </section>
  );
}
