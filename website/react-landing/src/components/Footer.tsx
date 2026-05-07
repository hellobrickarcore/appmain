import { Twitter, Disc, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 justify-between mb-20">
        
        {/* Left Column */}
        <div className="flex-1 max-w-sm">
          <h2 className="font-display text-3xl font-bold mb-6">
            Get inspired,<br />get building
          </h2>
          
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 flex items-center gap-6 mb-8 w-fit relative overflow-hidden group hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-2">
              <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMCAwaDEwdjEwSDBWMHptMiAyaDZ2NkgydjZ6TTYgNGgydjJoLTJWNHptLTEyaDEwdjEwSDZWMHptMiAyaDZ2Nkg4djZ6TTEyIDRoMnYyaC0yVjR6TTAgMTJoMTB2MTBIMHYtMTB6bTIgMmg2djZIMnYtNnpNNiAxNmgydjJoLTJ2LTJ6bTMwLTE2aDEwdjEwSDMwdjEwem0yIDJoNnY2SDMyVjJ6bTM2IDRoMnYyaC0ydjJ6bS0yIDJoMTB2MTBIMzB2MTB6bTIgMmg2djZIMzJ2LTZ6bTM2IDE2aDJ2MmgtMnYtMnoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] bg-repeat bg-center"></div>
            </div>
            <div>
              <div className="font-bold text-lg mb-1">Download App</div>
              <div className="text-white/60 text-sm">Available on<br/>iOS</div>
            </div>
          </div>

          <div className="flex gap-4">
            <a href="https://twitter.com/hellobrick" className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-brand transition-all">
              <Twitter className="w-5 h-5" fill="currentColor" />
            </a>
            <a href="https://discord.gg/hellobrick" className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-brand transition-all">
              <Disc className="w-5 h-5" fill="currentColor" />
            </a>
          </div>
        </div>

        {/* Right Columns */}
        <div className="flex-[2] flex flex-wrap gap-12 md:justify-around">
          <div>
            <h4 className="text-brand-yellow font-bold mb-6 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-4 font-medium">
              <li><a href="#features" className="hover:text-brand transition-colors">Features</a></li>
              <li><a href="#pro" className="hover:text-brand transition-colors">HelloBrick Pro</a></li>
              <li><a href="https://apps.apple.com/app/id6760016096" className="hover:text-brand transition-colors">Download</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-brand-yellow font-bold mb-6 uppercase tracking-wider text-xs">Support</h4>
            <ul className="space-y-4 font-medium">
              <li><a href="https://hellobrick.app/support" className="hover:text-brand transition-colors">Help Center</a></li>
              <li><a href="mailto:support@hellobrick.app" className="hover:text-brand transition-colors">Contact Us</a></li>
              <li><a href="https://hellobrick.app/faq" className="hover:text-brand transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-brand-yellow font-bold mb-6 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4 font-medium">
              <li><a href="https://hellobrick.app/privacy" className="hover:text-brand transition-colors">Privacy Policy</a></li>
              <li><a href="https://hellobrick.app/terms" className="hover:text-brand transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

      </div>

      <div className="pt-8 border-t border-white/10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
        <div className="flex items-center gap-2 font-display font-bold text-xl text-white">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white text-sm">H</div>
          HelloBrick
        </div>
        <p className="text-center md:text-right">
          &copy; {new Date().getFullYear()} HelloBrick. All rights reserved. Made for brick builders.
        </p>
      </div>
    </footer>
  );
}
