"use client";

import { useState } from "react";
import { Ticket, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { redeemPromoCodeAction } from "@/app/actions/promo";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export function RedeemPromoForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { user } = useAuth();

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !user) return;

    setLoading(true);
    setResult(null);

    try {
      const resp = await (redeemPromoCodeAction(code, user.uid, user.displayName || "User") as any);
      if (resp.success) {
        setResult({ success: true, message: `Success! Your ${resp.grantedPlan} access is now active.` });
        setCode("");
      } else {
        setResult({ success: false, message: resp.error || "Invalid or expired code." });
      }
    } catch (err) {
      setResult({ success: false, message: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
         <Ticket className="w-4 h-4 text-primary-blue" />
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Redeem Promo Token</span>
      </div>

      <form onSubmit={handleRedeem} className="relative group">
        <input 
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter Promo Code"
          disabled={loading}
          className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700 placeholder:text-slate-300 uppercase tracking-widest"
        />
        <button 
          type="submit"
          disabled={loading || !code.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary-navy text-white rounded-xl shadow-lg hover:bg-primary-navy-muted transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl flex items-start gap-3 border ${
              result.success 
                ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                : "bg-red-50 border-red-100 text-red-800"
            }`}
          >
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-bold tracking-tight">{result.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
