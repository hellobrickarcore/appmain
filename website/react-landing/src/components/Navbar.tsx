import { Menu, Globe } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        {/* HelloBrick Official Icon Logo */}
        <div className="w-10 h-10 bg-[#FFCE4A] rounded-xl flex items-center justify-center p-1.5 shadow-md">
           <div className="w-full h-full bg-[#FF7A30] rounded-lg flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-black/20 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-black/20 rounded-full"></div>
           </div>
        </div>
        <span className="font-display font-bold text-2xl tracking-tighter text-brand-navy">HelloBrick</span>
      </div>

      <div className="hidden md:flex flex-1 justify-center items-center gap-8 text-[15px] font-bold text-gray-700">
        <a href="#features" className="hover:text-brand transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-brand transition-colors">How it Works</a>
        <a href="#pro" className="hover:text-brand transition-colors">HelloBrick Pro</a>
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-gray-50">
          <Globe className="w-4 h-4 text-brand" />
          <span>EN</span>
        </button>
        <a 
          href="https://apps.apple.com/app/hellobrick" 
          className="bg-brand text-white px-6 py-3 rounded-full font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
        >
          Get App
        </a>
        <button className="md:hidden">
          <Menu className="w-6 h-6 text-brand-navy" />
        </button>
      </div>
    </nav>
  );
}
