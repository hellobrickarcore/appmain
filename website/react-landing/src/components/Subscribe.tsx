import React from 'react';

export default function Subscribe() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto text-center">
      <h2 className="font-display text-[48px] md:text-[64px] font-bold tracking-tight mb-8">
        Ready to start building?
      </h2>
      
      <div className="relative rounded-[48px] overflow-hidden flex flex-col items-center justify-center p-12 md:p-24 bg-brand">
        {/* Background playful geometry */}
        <div className="absolute inset-0 w-full h-full opacity-50">
           <svg className="w-full h-full object-cover" preserveAspectRatio="none" viewBox="0 0 1000 200">
              <path d="M0,0 L200,0 C300,100 300,100 400,200 L0,200 Z" fill="#FF4D80" />
              <path d="M1000,0 L800,0 C700,100 700,100 600,200 L1000,200 Z" fill="#FF5A00" />
           </svg>
        </div>
        
        <div className="relative z-10 space-y-8">
          <p className="text-white/80 text-xl font-medium max-w-lg mx-auto">
            Join thousands of builders who use HelloBrick to unlock their collections.
          </p>
          <a href="https://apps.apple.com/app/id6760016096" className="inline-block bg-white text-brand px-12 py-5 rounded-full font-bold text-xl hover:bg-gray-50 transition-colors shadow-2xl">
            Download on the App Store
          </a>
        </div>
      </div>
    </section>
  );
}
