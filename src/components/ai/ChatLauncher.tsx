"use client";

import { useState } from "react";
import { Sparkles, MessageCircle, X } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function ChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Optionally hide on certain pages if needed
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-6">
      <AnimatePresence>
        {isOpen && (
          <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} isIntakeMode={pathname?.includes("/disputes")} />
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,123,255,0.2)] transition-all relative group overflow-hidden ${
          isOpen ? "bg-primary-navy text-white" : "bg-white border border-slate-100 text-primary-blue hover:shadow-primary-blue/30"
        }`}
      >
        <div className="absolute inset-0 bg-primary-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <div className="relative">
            <Sparkles className="w-8 h-8 text-secondary-teal absolute -top-4 -right-4 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageCircle className="w-10 h-10" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
