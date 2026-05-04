import { motion } from 'motion/react';

const BrickCluster = ({ color, style, studs = 2 }: { color: string; style?: React.CSSProperties, studs?: number }) => {
  return (
    <motion.div 
      className="absolute flex items-center justify-center rounded-full px-4 py-2"
      style={{ backgroundColor: color, ...style }}
      animate={{ 
        y: [0, -12, 0],
        rotate: [0, 3, -3, 0]
      }}
      transition={{ 
        duration: 5 + Math.random() * 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      <div className="flex gap-2">
        {Array.from({ length: studs }).map((_, i) => (
          <div key={i} className="w-4 h-4 bg-black/10 rounded-full border border-white/10 shadow-inner"></div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative pt-40 pb-24 px-6 min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
      
      {/* LEGO Brick Background Clusters */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 md:opacity-100">
        <BrickCluster color="#FFCE4A" studs={3} style={{ top: '12%', left: '8%', transform: 'rotate(-15deg)' }} />
        <BrickCluster color="#FF4D80" studs={2} style={{ top: '22%', left: '22%', transform: 'scale(1.4) rotate(10deg)' }} />
        <BrickCluster color="#00C2FF" studs={2} style={{ top: '28%', right: '12%', transform: 'scale(1.6) rotate(-5deg)' }} />
        <BrickCluster color="#FF7A30" studs={1} style={{ top: '58%', left: '12%', transform: 'scale(1.2)' }} />
        <BrickCluster color="#22D35A" studs={2} style={{ top: '68%', right: '18%', transform: 'scale(1.3) rotate(20deg)' }} />
        <BrickCluster color="#0F4CFF" studs={2} style={{ top: '8%', right: '32%', transform: 'scale(0.9) rotate(45deg)' }} />
        <BrickCluster color="#FFCE4A" studs={2} style={{ top: '78%', left: '32%', transform: 'scale(1.5) rotate(-10deg)' }} />
        <BrickCluster color="#FF4D80" studs={2} style={{ top: '48%', right: '4%', transform: 'scale(1.1) rotate(15deg)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center mt-12 mb-16">
        <motion.h1 
          className="font-display text-[56px] md:text-[88px] leading-[1.05] tracking-tight font-bold mb-6 text-brand-navy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Turn your brick pile into <br /> something you can actually build.
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-2xl text-gray-600 max-w-2xl mx-auto font-medium mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Scan your bricks and get real build ideas — instantly. <br className="hidden md:block" /> No sorting required.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Classic App Store Format Button */}
          <a 
            href="https://apps.apple.com/app/hellobrick" 
            className="flex items-center gap-4 bg-brand-navy text-white px-8 py-5 rounded-[24px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl group"
          >
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1.5 shrink-0">
               {/* Logo in button */}
               <div className="w-full h-full bg-[#FFCE4A] rounded-lg relative flex items-center justify-center p-1">
                  <div className="w-full h-full bg-[#FF7A30] rounded-sm flex items-center justify-center gap-1">
                     <div className="w-1.5 h-1.5 bg-black/20 rounded-full"></div>
                     <div className="w-1.5 h-1.5 bg-black/20 rounded-full"></div>
                  </div>
               </div>
            </div>
            <div className="text-left pr-4">
               <div className="text-white/60 text-xs font-bold uppercase tracking-widest">Download App</div>
               <div className="text-xl font-bold">Available on iOS</div>
            </div>
          </a>
          
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             Works with mixed bricks
          </div>
        </motion.div>
      </div>

    </section>
  );
}
