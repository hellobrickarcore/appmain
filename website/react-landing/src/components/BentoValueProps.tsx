import { motion } from 'motion/react';
import { Scan, Shield, Search } from 'lucide-react';

export default function BentoValueProps() {
  return (
    <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="max-w-3xl mb-12">
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          When you scan your bricks, you unlock endless creativity
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 - Orange Brand Card */}
        <div className="bg-brand text-white rounded-[32px] p-8 md:p-10 flex flex-col min-h-[440px] relative overflow-hidden group">
          <div className="relative z-10 max-w-[240px]">
            <h3 className="text-[26px] leading-[1.15] font-medium tracking-tight">
              Scan in seconds, right from your phone. No special hardware needed.
            </h3>
          </div>
          
          <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-brand-hover rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="mt-auto relative z-10 flex items-center justify-between">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Scan className="w-8 h-8 text-white" />
            </div>
            {/* Playful abstract element */}
            <div className="w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center p-3 animate-pulse">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-black/40 rounded-full"></div>
                <div className="w-3 h-3 bg-black/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 - Yellow Card */}
        <div className="bg-brand-yellow text-[#111827] rounded-[32px] p-8 md:p-10 flex flex-col min-h-[440px] relative overflow-hidden group">
          <div className="relative z-10 max-w-[240px]">
            <h3 className="text-[26px] leading-[1.15] font-medium tracking-tight">
              Detect every brick accurately, right from the pile.
            </h3>
          </div>
          
          <div className="mt-auto relative z-10 flex justify-center pb-4">
             {/* Character graphic placeholder */}
             <div className="relative">
               <div className="w-32 h-32 bg-brand rounded-t-full rounded-b-3xl relative flex items-center justify-center">
                 <div className="flex gap-4 mb-4">
                   <div className="w-6 h-8 bg-white rounded-full"></div>
                   <div className="w-6 h-8 bg-white rounded-full"></div>
                 </div>
                 <div className="absolute -left-6 bottom-4 w-12 h-12 bg-[#FF2E93] rounded-full flex items-center justify-center">
                    <div className="flex gap-1.5"><div className="w-2 h-2 bg-black/40 rounded-full" /><div className="w-2 h-2 bg-black/40 rounded-full" /></div>
                 </div>
               </div>
               <div className="absolute -right-4 -top-8 text-[#FF2E93] text-4xl">✨</div>
             </div>
          </div>
        </div>

        {/* Card 3 - Red Card */}
        <div className="bg-[#FF453A] text-white rounded-[32px] p-8 md:p-10 flex flex-col min-h-[440px] relative overflow-hidden group">
          <div className="relative z-10 max-w-[240px]">
            <h3 className="text-[26px] leading-[1.15] font-medium tracking-tight">
              Find 1000+ ideas before you even start building anything.
            </h3>
          </div>
          
          <div className="mt-auto relative z-10 space-y-3">
             <div className="h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center px-4 relative overflow-hidden">
               <div className="w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5 text-black" />
               </div>
               <div className="ml-4 h-2 w-24 bg-white/40 rounded-full"></div>
             </div>
             
             <div className="h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center px-4 relative overflow-hidden justify-between">
               <div className="flex items-center">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
                    <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                 </div>
                 <div className="ml-4 h-2 w-16 bg-white/40 rounded-full"></div>
               </div>
               <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center shrink-0">
                 <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
