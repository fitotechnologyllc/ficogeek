"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Home, CreditCard } from "lucide-react";
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 animate-in bounce-in duration-500">
        <AlertTriangle className="w-10 h-10" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-outfit text-primary-navy tracking-tight">Checkout Canceled</h1>
        <p className="text-slate-500 font-medium max-w-md mx-auto">
          No charges were made to your account. You can return to your billing dashboard anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
        <Link 
          href="/dashboard" 
          className="premium-card p-6 flex flex-col items-center gap-2 hover:border-slate-300 transition-all group"
        >
          <Home className="w-6 h-6 text-slate-400 group-hover:text-primary-navy" />
          <span className="font-bold text-slate-800">Return Home</span>
        </Link>
        <Link 
          href="/dashboard/billing" 
          className="premium-card p-6 flex flex-col items-center gap-2 hover:border-primary-blue transition-all group"
        >
          <CreditCard className="w-6 h-6 text-primary-blue group-hover:scale-110 transition-all transition-duration-300" />
          <span className="font-bold text-primary-navy">Go to Billing</span>
        </Link>
      </div>
    </div>
  );
}
