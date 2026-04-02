"use client";

import Link from "next/link";
import { LogoIcon } from "@/components/ui/LogoIcon";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-lg border-b border-slate-100 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
            <LogoIcon size={28} className="w-7 h-7" />
          </div>
          <span className="font-outfit text-2xl font-bold tracking-tight text-primary-navy">
            FICO <span className="text-accent-blue">GEEK</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-accent-blue transition-colors">How it Works</Link>
          <Link href="#features" className="text-sm font-semibold text-slate-600 hover:text-accent-blue transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-accent-blue transition-colors">Pricing</Link>
          
          <div className="h-6 w-px bg-slate-200 mx-2" />
          
          <Link href="/login" className="text-sm font-bold text-primary-navy hover:text-accent-blue transition-colors">Login</Link>
          <Link 
            href="/signup" 
            className="px-6 py-2.5 bg-primary-navy text-white rounded-xl font-bold text-sm hover:bg-primary-navy-muted hover:shadow-xl hover:shadow-primary-navy/10 transition-all active:scale-95"
          >
            Start Free
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-primary-navy"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 md:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-6">
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-slate-600">How it Works</Link>
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-slate-600">Features</Link>
              <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-slate-600">Pricing</Link>
              <hr className="border-slate-100" />
              <Link href="/login" className="text-lg font-bold text-primary-navy">Login</Link>
              <Link 
                href="/signup" 
                className="w-full py-4 bg-primary-navy text-white rounded-xl font-bold text-center shadow-lg"
              >
                Start Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
