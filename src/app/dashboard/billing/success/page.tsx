"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.subscriptionStatus === "active") {
      setLoading(false);
    }
    // Poll for status update or just wait 5 seconds
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, [profile]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-in zoom-in duration-500">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-outfit text-primary-navy">Payment Successful!</h1>
        <p className="text-slate-500 font-medium max-w-md mx-auto">
          Your account is being upgraded. It may take a moment to sync your subscription status.
        </p>
      </div>

      <div className="premium-card p-6 max-w-sm w-full bg-emerald-50/50 border-emerald-100 flex items-center gap-4">
         {loading ? (
           <>
             <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
             <p className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Syncing status...</p>
           </>
         ) : (
           <>
             <CheckCircle2 className="w-6 h-6 text-emerald-600" />
             <p className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Profile Active: {profile?.subscriptionPlan}</p>
           </>
         )}
      </div>

      <Link 
        href="/dashboard" 
        className="btn-primary flex items-center gap-2 group px-8"
      >
        Go to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
      </Link>

      <p className="text-xs text-slate-400 font-medium italic">
        Session ID: {sessionId?.substring(0, 20)}...
      </p>
    </div>
  );
}
