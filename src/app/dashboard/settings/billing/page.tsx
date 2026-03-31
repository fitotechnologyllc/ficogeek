"use client";

import { useState } from "react";
import { 
  Check, 
  Zap, 
  ShieldCheck, 
  Users, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  PlusCircle, 
  HelpCircle,
  Clock,
  Briefcase
} from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";

const PLANS = [
  {
    id: "free",
    name: "Sovereign Individual",
    price: "$0",
    description: "Self-help tools for the standard consumer.",
    features: [
      "Up to 3 Dispute Letters / Month",
      "Standard Document Vault",
      "Basic Status Tracking",
      "Email Support"
    ],
    icon: ShieldCheck,
    color: "text-slate-500",
    buttonText: "Current Plan",
    highlight: false
  },
  {
    id: "premium",
    name: "Elite Dispute Pro",
    price: "$29",
    description: "Advanced automation for serious credit builders.",
    features: [
      "Unlimited Dispute Letters",
      "Priority PDF Generation",
      "Advanced Vault Tagging",
      "Priority Dispute Logic",
      "Priority Support"
    ],
    icon: Zap,
    color: "text-primary-blue",
    buttonText: "Upgrade to Elite",
    highlight: true
  },
  {
    id: "pro",
    name: "Enterprise Workspace",
    price: "$99",
    description: "The complete OS for credit entrepreneurs.",
    features: [
      "Manage up to 50 Clients",
      "Client Intake Workflows",
      "Custom Letter Branding",
      "Client Dashboard Access",
      "Dedicated Account Manager"
    ],
    icon: Briefcase,
    color: "text-secondary-teal",
    buttonText: "Launch Pro Firm",
    highlight: false
  }
];

export default function BillingPage() {
  const { plan, upgradePlan } = useSubscription();
  const { profile } = useAuth();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    try {
      await upgradePlan(planId as any);
      alert("Plan upgraded successfully!");
    } catch (e) {
      alert("Upgrade failed. Please try again.");
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-outfit text-primary-navy">Membership & Billing</h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">Select the tier that best matches your workflow. All plans are backed by the FICO Geek Sovereign Ledger.</p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {PLANS.map((p) => {
           const isCurrent = plan === p.id;
           return (
             <div 
               key={p.id} 
               className={`premium-card p-10 flex flex-col justify-between group transition-all duration-500 relative overflow-hidden ${
                 p.highlight ? "border-primary-blue shadow-2xl scale-105 z-10" : "hover:-translate-y-2"
               }`}
             >
                {p.highlight && (
                  <div className="absolute top-0 right-0 p-4">
                     <span className="bg-primary-blue text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</span>
                  </div>
                )}
                
                <div className="space-y-8">
                   <div className="space-y-4">
                      <div className={`w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center ${p.color} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                         <p.icon className="w-8 h-8" />
                      </div>
                      <h2 className="text-2xl font-bold font-outfit text-primary-navy">{p.name}</h2>
                      <p className="text-sm font-medium text-slate-400 leading-relaxed">{p.description}</p>
                   </div>

                   <div className="flex items-baseline gap-1 pt-4 border-t border-slate-100">
                      <span className="text-5xl font-bold font-outfit text-primary-navy tracking-tight">{p.price}</span>
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">/ Per Month</span>
                   </div>

                   <ul className="space-y-4 pt-4">
                      {p.features.map(f => (
                        <li key={f} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                           <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${p.highlight ? "text-primary-blue" : "text-emerald-500"}`} />
                           {f}
                        </li>
                      ))}
                   </ul>
                </div>

                <button 
                  disabled={isCurrent || !!upgrading}
                  onClick={() => handleUpgrade(p.id)}
                  className={`mt-10 w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                    isCurrent 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : upgrading === p.id
                        ? "bg-slate-200 text-slate-500 animate-pulse"
                        : p.highlight 
                          ? "bg-primary-blue text-white shadow-xl shadow-blue-900/20 hover:bg-primary-blue-muted active:scale-95" 
                          : "bg-primary-navy text-white hover:bg-primary-navy-muted active:scale-95"
                  }`}
                >
                   {isCurrent ? <Check className="w-5 h-5" /> : upgrading === p.id ? <Clock className="w-5 h-5 animate-spin" /> : null}
                   {isCurrent ? "Current Plan" : upgrading === p.id ? "Processing..." : p.buttonText}
                </button>
             </div>
           );
         })}
      </div>

      {/* Usage Analytics */}
      <div className="premium-card p-10 space-y-8 bg-slate-50/50">
         <div className="flex items-center justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary-navy text-white flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
               </div>
               <h2 className="text-xl font-bold font-outfit text-primary-navy">Monthly Utilization</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next reset: April 15, 2026</span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
               <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dispute Letter Logic</span>
                  <span className="text-sm font-bold text-primary-navy text-[10px]">1 / 3 Letters Used</span>
               </div>
               <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full w-1/3 bg-gradient-to-r from-primary-blue to-primary-navy rounded-full shadow-inner" />
               </div>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Client Files</span>
                  <span className="text-sm font-bold text-slate-400 text-[10px]">Tier Restricted (Upgrade Required)</span>
               </div>
               <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 opacity-40">
                  <div className="h-full w-0 bg-slate-300 rounded-full" />
               </div>
            </div>
         </div>
      </div>

      {/* FAQ / Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="premium-card p-8 flex items-start gap-6 group hover:border-primary-blue transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all shadow-inner">
               <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
               <h4 className="font-bold text-primary-navy">Enterprise Licensing</h4>
               <p className="text-sm text-slate-500 font-medium leading-relaxed">Need more than 50 clients or custom legal integrations? Contact our Sovereign Accounts team for custom quotes.</p>
            </div>
         </div>
         <div className="premium-card p-8 flex items-start gap-6 group hover:border-secondary-teal transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-secondary-teal/5 text-secondary-teal flex items-center justify-center shrink-0 group-hover:scale-110 transition-all shadow-inner">
               <PlusCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
               <h4 className="font-bold text-primary-navy">White Labeling</h4>
               <p className="text-sm text-slate-500 font-medium leading-relaxed">Pro subscribers can now add their own law firm or credit agency logo to all generated dispute correspondence.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
