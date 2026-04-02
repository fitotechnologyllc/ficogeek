"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Zap, X, ArrowRight, Lock } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { logAnalyticsEvent } from "@/lib/analytics";
import { useAuth } from "@/context/AuthContext";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { upgradePlan } = useSubscription();
  const { user } = useAuth();

  const handleUpgrade = async (plan: string) => {
    if (user) logAnalyticsEvent(user.uid, "upgrade_click", { plan });
    await upgradePlan(plan as any);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary-navy/80 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="premium-card max-w-lg w-full bg-white p-10 relative z-10 overflow-hidden shadow-4xl border-t-8 border-accent-blue"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-8 relative">
              <div className="flex flex-col items-center text-center space-y-4">
                 <div className="w-16 h-16 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue">
                    <Lock className="w-8 h-8" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-3xl font-bold font-outfit text-primary-navy">Unlock your letter</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                       Save, download, and manage your dispute letters with full access.
                    </p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Official Bureau Formatting</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent-blue/10 text-accent-blue rounded-xl flex items-center justify-center">
                       <Zap className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Unlimited AI Logic Core</p>
                 </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                 <button 
                   onClick={() => handleUpgrade("premium")}
                   className="w-full py-5 bg-accent-blue text-white rounded-2xl font-extrabold text-lg hover:bg-accent-blue/90 hover:scale-[1.02] transition-all shadow-xl shadow-accent-blue/20 flex items-center justify-center gap-2"
                 >
                   Upgrade Now <ArrowRight className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={onClose}
                   className="w-full py-5 bg-white text-slate-400 font-bold hover:text-slate-600 transition-all"
                 >
                   Continue Limited Access
                 </button>
              </div>

              <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest italic pt-4">
                 Secure Stripe Payment • No Hidden Fees • Private Data
              </p>
            </div>

            {/* Decorative Blobs */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
