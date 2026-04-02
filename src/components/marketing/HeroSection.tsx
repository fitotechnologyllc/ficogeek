"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[600px] h-[600px] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-20 w-[600px] h-[600px] bg-accent-teal/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4 text-accent-blue" />
            Empowering Your Financial Sovereignty
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-outfit text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-primary-navy"
          >
            Fix, Organize, and Take Control of Your Credit — <span className="text-accent-blue">Powered by AI</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-500 max-w-lg leading-relaxed font-medium"
          >
            FICO Geek helps you create, manage, and track credit dispute letters with a secure document vault and intelligent AI assistant.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-5 bg-primary-navy text-white rounded-2xl font-bold text-lg hover:bg-primary-navy-muted hover:shadow-2xl hover:shadow-primary-navy/20 transition-all flex items-center justify-center gap-2"
            >
              Start Free Today <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#ai-demo" 
              className="w-full sm:w-auto px-8 py-5 bg-white text-primary-navy border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center"
            >
              Try the AI Assistant
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-8 pt-8 border-t border-slate-100"
          >
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <ShieldCheck className="w-5 h-5 text-accent-teal" />
              Secure Vault
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Zap className="w-5 h-5 text-accent-blue" />
              Instant Letters
            </div>
          </motion.div>
        </div>

        {/* Hero Illustration / Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="relative z-10 premium-card p-4 shadow-3xl bg-white border border-slate-100">
            <div className="bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100/50">
              {/* Header Mock */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-2 w-16 bg-slate-200 rounded" />
                    <div className="h-3 w-32 bg-primary-navy/20 rounded" />
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-100" />
              </div>
              
              {/* Content Mock */}
              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="h-24 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                       <div className="h-2 w-16 bg-slate-100 rounded" />
                       <div className="h-4 w-24 bg-accent-blue/10 rounded" />
                    </div>
                    <div className="h-24 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                       <div className="h-2 w-16 bg-slate-100 rounded" />
                       <div className="h-4 w-24 bg-accent-teal/10 rounded" />
                    </div>
                 </div>
                 
                 <div className="h-48 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-5 w-5 bg-accent-blue rounded" />
                       <div className="h-3 w-40 bg-slate-100 rounded" />
                    </div>
                    <div className="space-y-3 pt-2">
                       <div className="h-2.5 w-full bg-slate-50 rounded" />
                       <div className="h-2.5 w-full bg-slate-50 rounded" />
                       <div className="h-2.5 w-3/4 bg-slate-50 rounded" />
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent-blue/5 rounded-3xl rotate-12 -z-10" />
          <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-accent-teal/5 rounded-full -rotate-12 -z-10" />
        </motion.div>
      </div>
    </section>
  );
};
