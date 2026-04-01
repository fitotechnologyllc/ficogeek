"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  CreditCard, 
  ExternalLink, 
  ShieldCheck, 
  Zap,
  Globe,
  Users,
  FileText
} from "lucide-react";
import { STRIPE_PLANS } from "@/lib/stripe";
import { logAuditAction } from "@/lib/audit";

export default function BillingPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = profile?.subscriptionPlan || "free";
  const isPremium = currentPlan === "premium";
  const isPro = currentPlan === "pro";
  const isOwner = profile?.role === "owner";

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({
          priceId,
          customerId: profile?.stripeCustomerId,
          uid: user?.uid,
          email: user?.email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        body: JSON.stringify({
          customerId: profile?.stripeCustomerId,
        }),
      });
      const data = await res.json();
      if (data.url) {
        await logAuditAction(
          user!.uid,
          profile?.name || "User",
          profile?.role || "personal",
          "BILLING_PORTAL_SESSION",
          "User accessed Stripe Billing Portal"
        );
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Portal error:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-outfit text-primary-navy">Billing & Membership</h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage your subscription and platform entitlements.</p>
        </div>
        {profile?.stripeCustomerId && (
          <button 
            onClick={handlePortal}
            disabled={loading === "portal"}
            className="btn-secondary flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> 
            {loading === "portal" ? "Opening..." : "Customer Portal"}
          </button>
        )}
      </div>

      {/* Current Plan Summary */}
      <div className="premium-card p-8 bg-gradient-to-br from-primary-navy to-slate-800 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-6 h-6 text-secondary-teal" />
             </div>
             <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] leading-none mb-1">Your Active Plan</p>
                <h3 className="text-2xl font-bold font-outfit uppercase tracking-wider">
                  {isOwner ? "Owner Unlimited" : currentPlan}
                </h3>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
             <div className="space-y-1">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Status</p>
                <p className="text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {profile?.subscriptionStatus || "Active"}
                </p>
             </div>
             <div className="space-y-1">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Next Renewal</p>
                <p className="text-lg font-bold">
                   {profile?.currentPeriodEnd ? new Date(profile.currentPeriodEnd).toLocaleDateString() : "N/A"}
                </p>
             </div>
             <div className="space-y-1">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Billing Method</p>
                <p className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  Stripe Secure
                </p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
          <Globe className="w-48 h-48" />
        </div>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PlanCard 
          name="Free"
          price="$0"
          description="Basic credit monitoring and dispute drafts."
          features={["3 Letters / Month", "Standard Templates", "Community Support"]}
          isCurrent={currentPlan === "free" && !isOwner}
          disabled={isOwner || isPremium || isPro}
          label="STAY FREE"
        />
        <PlanCard 
          name="Personal Premium"
          price="$29"
          description="Full AI logic and unlimited professional outputs."
          features={["50 Letters / Month", "AI Dispute Logic", "PDF Export", "Priority Support"]}
          isCurrent={isPremium && !isOwner}
          onSelect={() => handleCheckout(STRIPE_PLANS.PREMIUM_MONTHLY)}
          loading={loading === STRIPE_PLANS.PREMIUM_MONTHLY}
          highlight
          label={isPremium ? "CURRENT" : "UPGRADE"}
        />
        <PlanCard 
          name="Pro Universe"
          price="$99"
          description="Client management for credit repair professionals."
          features={["1000 Letters / Month", "50 Client Seats", "Compliance Engine", "Custom Branding"]}
          isCurrent={isPro && !isOwner}
          onSelect={() => handleCheckout(STRIPE_PLANS.PRO_MONTHLY)}
          loading={loading === STRIPE_PLANS.PRO_MONTHLY}
          label={isPro ? "CURRENT" : "GO PRO"}
        />
      </div>
    </div>
  );
}

function PlanCard({ name, price, description, features, highlight, isCurrent, onSelect, loading, label, disabled }: any) {
  return (
    <div className={`premium-card p-6 flex flex-col h-full transition-all border-2 ${highlight ? 'border-primary-blue ring-4 ring-primary-blue/5' : 'border-transparent'}`}>
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-start">
          <h4 className="text-xl font-bold text-primary-navy font-outfit">{name}</h4>
          {highlight && <span className="bg-primary-blue text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Popular</span>}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-primary-navy">{price}</span>
          <span className="text-slate-400 font-bold text-sm">/mo</span>
        </div>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>

      <div className="flex-1 space-y-3 mb-8">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-secondary-teal shrink-0" />
            {f}
          </div>
        ))}
      </div>

      <button 
        onClick={onSelect}
        disabled={isCurrent || loading || disabled}
        className={`w-full py-4 rounded-xl font-bold text-sm transition-all tracking-widest uppercase ${
          isCurrent 
            ? 'bg-slate-100 text-slate-400 cursor-default' 
            : highlight 
              ? 'bg-primary-blue text-white hover:bg-primary-blue-dark shadow-xl shadow-primary-blue/20' 
              : 'bg-primary-navy text-white hover:bg-primary-navy-muted'
        } ${disabled && !isCurrent ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 animate-pulse" /> Connecting...
          </span>
        ) : label}
      </button>
    </div>
  );
}
