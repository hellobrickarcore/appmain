import { motion } from 'motion/react';
import { ArrowRight, Play } from 'lucide-react';

export default function Accountability() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
        
        {/* Left Text */}
        <div className="flex-1 max-w-xl">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
            Creativity and organization for Builders
          </h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            HelloBrick gives builders verifiable inventory and instant inspiration. Know what you have, what you can do, and what pieces you're missing for that giant starship model.
          </p>
          <button className="bg-brand text-white px-8 py-3.5 rounded-full font-medium hover:bg-brand-hover transition-colors shadow-sm">
            Learn more
          </button>
        </div>

        {/* Right Graphic/Video */}
        <div className="flex-1 w-full relative">
           <div className="bg-[#EAFCC2] rounded-[32px] overflow-hidden relative aspect-[4/3] flex items-center justify-center">
             {/* Decorative abstract elements replacing the billions characters */}
             <div className="absolute inset-0 opacity-40">
                <svg viewBox="0 0 400 300" className="w-full h-full object-cover">
                   <path d="M0,150 Q100,50 200,150 T400,150 L400,300 L0,300 Z" fill="#fff" opacity="0.5"/>
                   <circle cx="80" cy="80" r="40" fill="white" />
                   <circle cx="320" cy="100" r="60" fill="white" />
                </svg>
             </div>
             
             {/* Character stand-ins */}
             <div className="relative z-10 flex gap-4 items-end mb-12">
                <div className="w-16 h-24 bg-gray-400 rounded-t-full rounded-b-xl relative ml-12 animate-pulse"></div>
                <div className="w-20 h-32 bg-gray-600 rounded-t-full rounded-b-xl relative -mt-8 animate-pulse delay-75"></div>
                
                {/* Main Hero abstract */}
                <div className="w-24 h-24 bg-[#0055FF] rounded-[32px] relative ml-8 flex items-center justify-center shadow-xl">
                   <div className="flex gap-3">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                   </div>
                   <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#A3FA11] rounded-full border-4 border-white flex items-center justify-center">
                     <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                   </div>
                </div>
             </div>

             {/* Play Button Overlay */}
             <button className="absolute inset-0 flex items-center justify-center z-20 group">
               <div className="bg-black/20 backdrop-blur-md w-24 h-24 rounded-full flex items-center justify-center group-hover:bg-black/30 transition-colors shadow-2xl border border-white/10">
                 <Play className="w-10 h-10 text-white ml-2" fill="currentColor" />
               </div>
             </button>
           </div>
        </div>

      </div>
    </section>
  );
}
