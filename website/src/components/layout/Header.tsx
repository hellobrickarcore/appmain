"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Bell, Settings } from "lucide-react";

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

  return (
    <header
      className={`sticky top-0 z-40 safe-top ${
        transparent
          ? ""
          : "glass border-b border-[#2A2F3C]/30"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-[80px]">
          {showBack ? (
            <button
              onClick={() => window.history.back()}
              className="p-1.5 rounded-xl hover:bg-[#1E2330] transition-colors"
            >
              <ChevronLeft size={22} className="text-[#8B92A5]" />
            </button>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-gold flex items-center justify-center">
                <span className="text-[#0C0F14] font-bold text-xs font-outfit">
                  HB
                </span>
              </div>
              <span className="font-outfit font-bold text-[15px] text-[#F0F2F5]">
                HelloBrick
              </span>
            </Link>
          )}
        </div>

        {/* Center */}
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-outfit font-semibold text-[15px] text-[#F0F2F5] absolute left-1/2 -translate-x-1/2"
          >
            {title}
          </motion.h1>
        )}

        {/* Right */}
        <div className="flex items-center gap-1 min-w-[80px] justify-end">
          {showActions && (
            <>
              <button className="p-2 rounded-xl hover:bg-[#1E2330] transition-colors relative">
                <Bell size={19} className="text-[#8B92A5]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C9A84C] border border-[#0C0F14]" />
              </button>
              <Link
                href="/profile"
                className="p-2 rounded-xl hover:bg-[#1E2330] transition-colors"
              >
                <Settings size={19} className="text-[#8B92A5]" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
