"use client";

import { Navbar } from "@/components/marketing/Navbar";
import { HeroSection } from "@/components/marketing/HeroSection";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeaturesGrid } from "@/components/marketing/FeaturesGrid";
import { AIDemo } from "@/components/marketing/AIDemo";
import { PricingGrid } from "@/components/marketing/PricingGrid";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-white">
      <Navbar />
      
      <HeroSection />
      
      <HowItWorks />
      
      <FeaturesGrid />
      
      <AIDemo />
      
      <PricingGrid />

      {/* Final Conversion Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-navy -z-10" />
        <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[600px] h-[600px] bg-accent-blue/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-6 text-center space-y-12 relative z-10">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest"
           >
             <Sparkles className="w-4 h-4 text-accent-teal" />
             Start Your Journey Today
           </motion.div>
           
           <h2 className="text-5xl lg:text-7xl font-bold font-outfit text-white leading-tight">
             Your first letter is <br /><span className="text-accent-blue">only a few steps away.</span>
           </h2>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto px-10 py-6 bg-white text-primary-navy rounded-2xl font-extrabold text-xl hover:bg-slate-50 hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3"
              >
                Start with AI <ArrowRight className="w-6 h-6" />
              </Link>
           </div>
        </div>
      </section>

      {/* Footer / Disclaimer */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <span className="font-outfit text-2xl font-bold tracking-tight text-primary-navy">
                    FICO <span className="text-accent-blue">GEEK</span>
                  </span>
               </div>
               <p className="text-slate-500 font-medium leading-relaxed">
                  The Sovereign Ledger for credit management and professional dispute preparation. Built for security, transparency, and results.
               </p>
            </div>
            
            <div className="space-y-6">
               <h4 className="font-bold uppercase tracking-widest text-xs text-slate-400">Platform</h4>
               <ul className="space-y-4 font-bold text-primary-navy transition-colors">
                  <li><Link href="#features" className="hover:text-accent-blue transition-colors">Features</Link></li>
                  <li><Link href="#how-it-works" className="hover:text-accent-blue transition-colors">How it Works</Link></li>
                  <li><Link href="#pricing" className="hover:text-accent-blue transition-colors">Pricing</Link></li>
               </ul>
            </div>

            <div className="space-y-6">
               <h4 className="font-bold uppercase tracking-widest text-xs text-slate-400">Support</h4>
               <ul className="space-y-4 font-bold text-primary-navy">
                  <li><Link href="/help" className="hover:text-accent-blue transition-colors">Help Center</Link></li>
                  <li><Link href="/faq" className="hover:text-accent-blue transition-colors">FAQ</Link></li>
                  <li><Link href="mailto:support@ficogeek.com" className="hover:text-accent-blue transition-colors">Email Us</Link></li>
               </ul>
            </div>

            <div className="space-y-6">
               <h4 className="font-bold uppercase tracking-widest text-xs text-slate-400">Legal</h4>
               <ul className="space-y-4 font-bold text-primary-navy">
                  <li><Link href="/terms" className="hover:text-accent-blue transition-colors">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="hover:text-accent-blue transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/disclosures" className="hover:text-accent-blue transition-colors">Disclosures</Link></li>
               </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 space-y-8">
             <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-slate-400 shrink-0" />
                <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
                   <strong>Disclaimer:</strong> FICO Geek provides educational tools and document preparation assistance. We do not provide legal advice or guarantee credit outcomes. The results of using our platform may vary based on your individual credit situation and the responsiveness of the credit bureaus. Use of this platform constitutes acceptance of our terms and disclosure agreements.
                </p>
             </div>
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <p>&copy; 2026 FICO GEEK. All rights reserved.</p>
                <p>Ensuring Financial Sovereignty for All.</p>
             </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
