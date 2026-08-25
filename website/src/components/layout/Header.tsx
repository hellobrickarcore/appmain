"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Bell, Settings, LayoutDashboard, Grid, Heart, ScanLine } from "lucide-react";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showActions?: boolean;
  transparent?: boolean;
}

export default function Header({
  title,
  showBack = false,
  showActions = true,
  transparent = false,
}: HeaderProps) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Collection", href: "/collection", icon: Grid },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "Scan", href: "/scan", icon: ScanLine },
  ];

  return (
    <header
      className={`sticky top-0 z-40 ${
        transparent
          ? "bg-transparent"
          : "bg-white border-b border-gray-100 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-[200px]">
          {showBack ? (
            <button
              onClick={() => window.history.back()}
              className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={22} className="text-gray-600" />
            </button>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-3 w-fit">
               <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center p-1.5 shadow-sm">
                 <div className="w-full h-full bg-[#FF7A30] rounded flex items-center justify-center gap-0.5">
                   <div className="w-1 h-1 bg-black/20 rounded-full" />
                   <div className="w-1 h-1 bg-black/20 rounded-full" />
                 </div>
               </div>
               <span className="font-display font-bold text-xl tracking-tighter text-[#050A18]">HelloBrick</span>
            </Link>
          )}
        </div>

        {/* Center - Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-gray-100 text-[#050A18]" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon size={16} className={isActive ? "text-[#FF7A30]" : ""} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2 min-w-[200px] justify-end">
          {showActions && (
            <>
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                <Bell size={20} className="text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF7A30] border-2 border-white" />
              </button>
              <Link
                href="/profile"
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Settings size={20} className="text-gray-500" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
