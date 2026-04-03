"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-24 lg:pt-56 lg:pb-40 overflow-hidden bg-white">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[800px] h-[800px] bg-primary-blue/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-20 w-[600px] h-[600px] bg-secondary-teal/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-12 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary-navy/5 border border-primary-navy/10 text-primary-navy text-[10px] font-bold uppercase tracking-[0.3em] italic"
          >
            <div className="w-2 h-2 rounded-full bg-secondary-teal animate-pulse" />
            Institutional Audit Protocol Active
          </motion.div>

          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-outfit text-6xl lg:text-8xl font-extrabold leading-[0.95] tracking-tighter text-primary-navy italic uppercase"
            >
              Initiate the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-secondary-teal">Audit Protocol.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl lg:text-2xl text-slate-500 max-w-xl leading-relaxed font-medium italic"
            >
              FICO Geek is a professional isolation and document preparation platform. Leverage the <span className="text-primary-navy font-bold">Fair Credit Reporting Act (FCRA)</span> to audit inaccuracies and reclaim your financial sovereignty.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-6 pt-4"
          >
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-12 py-7 bg-primary-navy text-white rounded-3xl font-extrabold text-xs uppercase tracking-[0.2em] hover:bg-slate-900 transition-all flex items-center justify-center gap-4 italic active:scale-95 shadow-2xl"
            >
              Start Your Audit <ArrowRight className="w-6 h-6 text-secondary-teal" />
            </Link>
            <Link 
              href="#how-it-works" 
              className="w-full sm:w-auto px-12 py-7 bg-white text-primary-navy border-2 border-slate-100 rounded-3xl font-extrabold text-xs uppercase tracking-[0.2em] hover:border-primary-blue transition-all flex items-center justify-center italic active:scale-95"
            >
              View the Protocol
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-12 pt-12 border-t border-slate-100"
          >
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic group">
              <ShieldCheck className="w-6 h-6 text-secondary-teal group-hover:scale-110 transition-transform" />
              Evidence Isolation
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic group">
              <Zap className="w-6 h-6 text-primary-blue group-hover:scale-110 transition-transform" />
              Document Forge
            </div>
          </motion.div>
        </div>

        {/* Hero Illustration / Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative lg:scale-110"
        >
          {/* Main Dashboard Preview Card */}
          <div className="relative z-10 premium-card p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-slate-200/50 border border-white/50 backdrop-blur-xl">
            <div className="bg-white rounded-[2rem] overflow-hidden">
               {/* Browser UI Mock */}
               <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex gap-3">
                     <div className="w-3 h-3 rounded-full bg-slate-200" />
                     <div className="w-3 h-3 rounded-full bg-slate-200" />
                     <div className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                  <div className="h-6 w-48 bg-white border border-slate-100 rounded-full flex items-center px-4">
                     <div className="h-1.5 w-full bg-slate-50 rounded" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
               </div>

               {/* App Content UI Mock */}
               <div className="p-10 space-y-10">
                  <div className="space-y-3">
                     <div className="h-3 w-16 bg-primary-blue/20 rounded-full" />
                     <div className="h-8 w-64 bg-primary-navy rounded-xl" />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                     <div className="h-32 bg-slate-50 rounded-[1.5rem] p-6 space-y-4 flex flex-col justify-end">
                        <div className="h-2 w-12 bg-slate-200 rounded" />
                        <div className="h-5 w-full bg-primary-blue/10 rounded" />
                     </div>
                     <div className="h-32 bg-slate-50 rounded-[1.5rem] p-6 space-y-4 flex flex-col justify-end border border-primary-blue/20 shadow-inner">
                        <div className="h-2 w-12 bg-slate-200 rounded" />
                        <div className="h-5 w-full bg-secondary-teal/10 rounded" />
                     </div>
                     <div className="h-32 bg-slate-50 rounded-[1.5rem] p-6 space-y-4 flex flex-col justify-end">
                        <div className="h-2 w-12 bg-slate-200 rounded" />
                        <div className="h-5 w-full bg-slate-200 rounded" />
                     </div>
                  </div>

                  <div className="h-56 bg-primary-navy rounded-[2rem] p-10 flex flex-col justify-between items-start relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.2),transparent)]" />
                     <div className="space-y-4 relative z-10">
                        <div className="h-2.5 w-24 bg-white/20 rounded-full" />
                        <div className="h-6 w-48 bg-white/90 rounded-lg" />
                     </div>
                     <div className="h-12 w-32 bg-secondary-teal rounded-xl relative z-10" />
                  </div>
               </div>
            </div>
          </div>

          {/* Floating UI Elements */}
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-16 -left-16 premium-card p-6 bg-white shadow-2xl border border-slate-100 z-20 space-y-4"
          >
             <div className="w-12 h-12 bg-primary-blue/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary-blue" />
             </div>
             <div className="space-y-2">
                <div className="h-2 w-16 bg-slate-100 rounded" />
                <div className="h-2 w-12 bg-slate-50 rounded" />
             </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [2, -2, 2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-16 -right-16 premium-card p-8 bg-primary-navy text-white shadow-2xl z-20 space-y-4"
          >
             <p className="text-[9px] font-bold uppercase tracking-widest text-secondary-teal">Certified Evidence</p>
             <div className="h-4 w-32 bg-white/20 rounded" />
             <div className="h-0.5 w-full bg-white/5" />
             <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary-teal" />
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <div className="w-2 h-2 rounded-full bg-white/20" />
             </div>
          </motion.div>

          {/* Decorative Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-blue/5 rounded-full blur-[100px] -z-10" />
        </motion.div>
      </div>
    </section>
  );
};
