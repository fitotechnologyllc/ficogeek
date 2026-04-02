"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X, Bot, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { logAnalyticsEvent } from "@/lib/analytics";
import { useAuth } from "@/context/AuthContext";

interface ForceAIEntryOverlayProps {
  onDismiss: () => void;
}

export function ForceAIEntryOverlay({ onDismiss }: ForceAIEntryOverlayProps) {
  const { user } = useAuth();

  const handleStartAI = () => {
    if (user) logAnalyticsEvent(user.uid, "onboarding_start");
  };
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary-navy/95 backdrop-blur-xl p-6"
        >
          <div className="absolute top-0 right-0 p-8">
             <button 
               onClick={handleDismiss}
               className="p-3 text-white/40 hover:text-white transition-colors"
             >
               <X className="w-8 h-8" />
             </button>
          </div>

          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="max-w-3xl w-full text-center space-y-12"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl relative">
                 <div className="absolute -top-2 -right-2 bg-accent-blue p-2 rounded-full shadow-lg">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                 </div>
                 <Bot className="w-12 h-12" />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold font-outfit text-white leading-tight">
                  Let&apos;s create your <br /><span className="text-accent-blue">first dispute letter.</span>
                </h1>
                <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
                  I&apos;m Geek, your AI assistant. I can guide you through the entire process in less than 5 minutes.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link 
                 href="/dashboard/ai?mode=intake" 
                 onClick={handleStartAI}
                 className="w-full sm:w-auto px-10 py-6 bg-white text-primary-navy rounded-2xl font-extrabold text-xl hover:bg-slate-50 hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
               >
                 Start with Geek <ArrowRight className="w-6 h-6" />
               </Link>
               <button 
                 onClick={handleDismiss}
                 className="w-full sm:w-auto px-10 py-6 bg-transparent text-white/60 hover:text-white font-bold text-lg rounded-2xl transition-all"
               >
                 Explore dashboard
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
               <FeatureIcon icon={ShieldCheck} label="100% Private & Secure" />
               <FeatureIcon icon={Bot} label="AI-Guided Intake" />
               <FeatureIcon icon={Sparkles} label="Professional Formatting" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FeatureIcon({ icon: Icon, label }: any) {
  return (
    <div className="flex items-center justify-center gap-3 text-white/40 grayscale hover:grayscale-0 hover:text-white transition-all">
       <Icon className="w-5 h-5" />
       <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{label}</span>
    </div>
  );
}
