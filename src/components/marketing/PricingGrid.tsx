"use client";

import { Check, CheckCircle2, ShieldCheck, Zap, Briefcase, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const PLANS = [
  {
    name: "Sovereign Individual",
    tier: "Free",
    price: "$0",
    description: "Essential tools for self-help credit repair.",
    features: [
      "Limited AI Dispute Usage",
      "Standard Letter Templates",
      "Basic Document Tracking",
      "Community Support"
    ],
    icon: ShieldCheck,
    color: "text-slate-400",
    bg: "bg-slate-50",
    highlight: false
  },
  {
    name: "Elite Dispute Pro",
    tier: "Premium",
    price: "$29",
    description: "Advanced automation for serious credit builders.",
    features: [
      "Unlimited AI Dispute Logic",
      "Full Document Vault Access",
      "Priority PDF Generation",
      "Unlimited Tracked Letters",
      "Direct Email Support"
    ],
    icon: Zap,
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
    highlight: true
  },
  {
    name: "Enterprise Workspace",
    tier: "Pro",
    price: "$99",
    description: "The complete OS for credit professionals.",
    features: [
      "Manage Up to 50 Clients",
      "Bulk Dispute Workflows",
      "White Label Documents",
      "Team Member Access",
      "Dedicated Account Manager"
    ],
    icon: Briefcase,
    color: "text-amber-500",
    bg: "bg-amber-50",
    highlight: false
  }
];

export const PricingGrid = () => {
  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-20">
          <h2 className="text-accent-blue font-bold tracking-widest uppercase text-xs">Membership</h2>
          <h3 className="text-4xl font-bold font-outfit text-primary-navy">Transparent Pricing. No Surprises.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`premium-card p-10 flex flex-col justify-between relative overflow-hidden group transition-all duration-500 ${plan.highlight ? "border-2 border-accent-blue shadow-2xl scale-105 z-10" : "hover:-translate-y-2"}`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-accent-blue text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</span>
                </div>
              )}

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className={`w-14 h-14 rounded-2xl ${plan.bg} ${plan.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                     <plan.icon size={28} />
                  </div>
                  <h4 className="text-2xl font-bold font-outfit text-primary-navy">{plan.name}</h4>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 pt-6 border-t border-slate-100">
                  <span className="text-5xl font-bold font-outfit text-primary-navy">{plan.price}</span>
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">/ Per Month</span>
                </div>

                <ul className="space-y-4 pt-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? "text-accent-blue" : "text-emerald-500"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-10">
                <Link 
                  href="/signup" 
                  className={`w-full py-4 rounded-xl font-bold text-center block transition-all active:scale-95 ${
                    plan.highlight 
                      ? "bg-accent-blue text-white shadow-xl shadow-accent-blue/20 hover:bg-accent-blue/90" 
                      : "bg-primary-navy text-white hover:bg-primary-navy-muted"
                  }`}
                >
                  Start with {plan.tier}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center max-w-2xl mx-auto p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
           <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold tracking-widest uppercase text-xs">
              <PlusCircle size={18} />
              Enterprise Solutions
           </div>
           <p className="text-slate-500 font-medium italic">
             Need more than 50 clients or custom white-label integrations? <br />
             <Link href="mailto:support@ficogeek.com" className="text-primary-navy underline decoration-accent-blue decoration-2 underline-offset-4 hover:text-accent-blue transition-colors">Contact our Enterprise Team</Link> for custom quotes.
           </p>
        </div>
      </div>
    </section>
  );
};
