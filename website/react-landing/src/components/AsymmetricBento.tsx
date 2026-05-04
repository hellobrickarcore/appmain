import { motion } from 'motion/react';
import { Check, ArrowRight } from 'lucide-react';

export default function AsymmetricBento() {
  return (
    <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2 text-brand-navy">
          Scan in seconds. <br /> Find out what you can build.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Tall Card - Mockup */}
        <div className="bg-brand rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-end min-h-[600px]">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, white 4px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          
          <div className="relative z-10 w-[280px] h-[480px] bg-white rounded-t-[40px] rounded-b-none border-x-8 border-t-8 border-brand-navy shadow-2xl overflow-hidden mt-12 pt-6 px-4">
             {/* Phone Notch */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-brand-navy rounded-b-xl"></div>
             
             {/* UI mockup content */}
             <div className="flex flex-col items-center mt-12 gap-6">
               <div className="relative">
                 <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow flex items-center justify-center p-3">
                   <div className="w-full h-full bg-brand-yellow rounded-full"></div>
                 </div>
                 <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand rounded-full border-2 border-white flex items-center justify-center">
                   <Check className="w-3 h-3 text-white" />
                 </div>
               </div>
               <h4 className="font-display font-medium text-lg text-center">Detecting Bricks...</h4>
               
               <div className="w-16 h-16 rounded-full border-4 border-orange-100 border-t-brand animate-spin mt-10"></div>
             </div>
          </div>
        </div>

        {/* Right Column Layout */}
        <div className="flex flex-col gap-6">
          
          {/* Top Right Card */}
          <div className="bg-orange-50 rounded-[32px] p-8 md:p-10 flex-1">
            <h3 className="text-xl font-semibold mb-3">Works with messy, mixed piles</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              No need to organize. No perfect sets required. Just throw your bricks on the table and scan.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-[15px] font-medium text-gray-800">
                <Check className="w-5 h-5 text-brand" />
                Discover new builds in seconds
              </li>
              <li className="flex items-center gap-3 text-[15px] font-medium text-gray-800">
                <Check className="w-5 h-5 text-brand" />
                No manual sorting required
              </li>
              <li className="flex items-center gap-3 text-[15px] font-medium text-gray-800">
                <Check className="w-5 h-5 text-brand" />
                Scan once, build anywhere
              </li>
            </ul>

            <a href="https://apps.apple.com/app/hellobrick" className="inline-flex items-center font-medium text-brand hover:text-brand-hover transition-colors gap-1">
              Start building <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
            {/* Bottom Left Card */}
            <div className="bg-brand-yellow/20 rounded-[32px] p-8">
              <h3 className="text-xl font-semibold mb-3">Perfect for Parents</h3>
              <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                Save hours of sorting and keep the kids entertained with new build ideas from their collection.
              </p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex gap-3 text-sm text-gray-800">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  Instant build guides
                </li>
                <li className="flex gap-3 text-sm text-gray-800">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  No new sets needed
                </li>
              </ul>

              <a href="https://apps.apple.com/app/hellobrick" className="inline-flex items-center font-medium text-brand hover:text-brand-hover text-sm gap-1">
                Download Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>

            {/* Bottom Right Card - UI graphic */}
            <div id="pro" className="bg-brand-yellow rounded-[32px] overflow-hidden relative min-h-[250px]">
               <div className="absolute inset-0 bg-brand-yellow" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(0,0,0,0.05) 6px, transparent 0)', backgroundSize: '30px 30px' }}></div>
               <div className="absolute top-10 left-6 right-0 bottom-0 bg-white rounded-tl-[24px] shadow-xl p-5 border-t border-l border-white/40">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center">
                         <div className="w-2 h-2 bg-white rounded-full"></div>
                       </div>
                       <span className="font-display font-medium text-sm">HelloBrick Pro</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">S</div>
                         <span className="text-sm font-medium">Space Shuttle</span>
                       </div>
                       <Check className="w-4 h-4 text-brand" />
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white text-xs font-bold">C</div>
                         <span className="text-sm font-medium">Racing Car</span>
                       </div>
                       <Check className="w-4 h-4 text-brand" />
                    </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
