import { motion } from 'motion/react';

export default function UsersBanner() {
  return (
    <section className="py-12 px-6 max-w-7xl mx-auto">
      <div className="bg-[#00D1FF] rounded-[40px] overflow-hidden relative flex flex-col md:flex-row items-center border border-blue-100/50">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00D1FF] to-[#0055FF] pointer-events-none"></div>
        {/* Abstract curve overlap */}
        <div className="absolute top-0 bottom-0 right-0 w-1/2 bg-[#0055FF] rounded-l-[120px] pointer-events-none hidden md:block"></div>
        
        {/* Colorful Pillars (Right side abstract art replacing billions faces) */}
        <div className="absolute bottom-0 right-10 flex items-end gap-3 z-0 w-full justify-end pr-12 hidden md:flex">
           <motion.div initial={{y: 100}} whileInView={{y: 0}} className="w-16 h-48 bg-[#FF6622] rounded-t-full relative flex justify-center pt-6"><div className="w-6 h-6 bg-white/20 rounded-full"></div></motion.div>
           <motion.div initial={{y: 100}} whileInView={{y: 0}} transition={{delay:0.1}} className="w-16 h-64 bg-[#FF2E93] rounded-t-full relative flex justify-center pt-8"><div className="w-8 h-8 bg-white/20 rounded-full"></div></motion.div>
           <motion.div initial={{y: 100}} whileInView={{y: 0}} transition={{delay:0.2}} className="w-16 h-40 bg-[#FFD700] rounded-t-full relative flex justify-center pt-4"><div className="w-4 h-4 bg-white/20 rounded-full"></div></motion.div>
           <motion.div initial={{y: 100}} whileInView={{y: 0}} transition={{delay:0.3}} className="w-16 h-56 bg-[#A3FA11] rounded-t-full relative flex justify-center pt-6"><div className="w-6 h-6 bg-black/10 rounded-full"></div></motion.div>
           <motion.div initial={{y: 100}} whileInView={{y: 0}} transition={{delay:0.4}} className="w-16 h-72 bg-[#00D1FF] rounded-t-full border-4 border-white/20 relative flex justify-center pt-10"><div className="w-8 h-8 bg-white/20 rounded-full"></div></motion.div>
        </div>

        <div className="relative z-10 p-10 md:p-16 flex flex-col md:w-1/2">
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-black">
            2,388,423+
          </h2>
          <p className="text-xl md:text-2xl font-medium mb-12 text-black">
            Bricks Scanned
          </p>

          <div className="bg-white rounded-full p-2 pl-6 flex items-center justify-between w-full max-w-[400px] shadow-lg">
            <span className="font-medium text-gray-800 text-sm md:text-base mr-4">
              Join us in our mission to <span className="text-brand font-bold">build something new</span>
            </span>
            <button className="bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand-hover transition-colors whitespace-nowrap">
              Get HelloBrick
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
