import { motion } from 'motion/react';

// Generates playful "brick" clusters in LEGO branding colors
const BlobCluster = ({ color, sizes = [], style }: { color: string; sizes?: number[]; style?: React.CSSProperties }) => {
  return (
    <motion.div 
      className="absolute flex items-center justify-center p-2 rounded-full"
      style={{ backgroundColor: color, ...style }}
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ 
        duration: 4 + Math.random() * 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      <div className="flex gap-1 items-center justify-center">
        {sizes.map((s, i) => (
          <div key={i} className="bg-black/20 rounded-full" style={{ width: s, height: s }} />
        ))}
      </div>
      <div className="absolute flex gap-1.5 opacity-80 mix-blend-overlay">
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative pt-40 pb-24 px-6 min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Clusters - Updated to LEGO/HelloBrick Colors */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-multiply opacity-50 md:opacity-100">
        <BlobCluster color="#FFCE4A" sizes={[16, 24, 16]} style={{ top: '15%', left: '10%' }} />
        <BlobCluster color="#FF4D80" sizes={[24, 24]} style={{ top: '25%', left: '25%', transform: 'scale(1.2)' }} />
        <BlobCluster color="#00C2FF" sizes={[16, 32, 16]} style={{ top: '30%', right: '15%', transform: 'scale(1.5)' }} />
        <BlobCluster color="#FF7A30" sizes={[20, 20]} style={{ top: '60%', left: '15%', transform: 'scale(1.1)' }} />
        <BlobCluster color="#22D35A" sizes={[16, 16, 16, 16]} style={{ top: '70%', right: '20%', transform: 'scale(1.3)' }} />
        <BlobCluster color="#0F4CFF" sizes={[24, 16]} style={{ top: '10%', right: '35%', transform: 'scale(0.9)' }} />
        <BlobCluster color="#FFCE4A" sizes={[24, 32]} style={{ top: '80%', left: '35%', transform: 'scale(1.4)' }} />
        <BlobCluster color="#FF4D80" sizes={[16, 16]} style={{ top: '50%', right: '5%', transform: 'scale(1.1)' }} />
        
        {/* Fill in more blobs for the crowded look */}
        <BlobCluster color="#FF7A30" sizes={[16]} style={{ top: '45%', left: '5%' }} />
        <BlobCluster color="#0F4CFF" sizes={[20, 20]} style={{ top: '85%', right: '35%' }} />
        <BlobCluster color="#FFCE4A" sizes={[16, 24, 16]} style={{ top: '20%', right: '10%' }} />
        <BlobCluster color="#00C2FF" sizes={[24, 24]} style={{ top: '75%', left: '25%' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center mt-12 mb-16">
        <motion.h1 
          className="font-display text-[56px] md:text-[88px] leading-[1.05] tracking-tight font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Turn your brick pile into <br /> something you can actually build.
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-2xl text-gray-600 max-w-2xl mx-auto font-medium mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Scan your bricks and get real build ideas — instantly. No sorting required.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <a href="https://apps.apple.com/app/hellobrick" className="bg-brand text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 inline-flex items-center gap-2">
             Download on the App Store
          </a>
        </motion.div>
      </div>

    </section>
  );
}
