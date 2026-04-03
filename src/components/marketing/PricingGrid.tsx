"use client";

import { Check, CheckCircle2, ShieldCheck, Zap, Briefcase, PlusCircle, ArrowRight } from "lucide-react";
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
    <section id="pricing" className="py-32 bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-px h-full bg-slate-100 ml-[90%] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-blue/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary-navy/5 text-primary-navy text-[9px] font-bold uppercase tracking-[0.3em] italic"
          >
             LICENSING & TIERS
          </motion.div>
          <h3 className="text-5xl md:text-7xl font-extrabold font-outfit text-primary-navy tracking-tighter leading-none italic uppercase">Professional Access.</h3>
          <p className="text-slate-400 font-medium max-w-xl mx-auto text-lg italic uppercase tracking-tight">Transparent pricing for the sovereign audit protocol. No maintenance fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
          {PLANS.map((plan, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className={`premium-card p-12 flex flex-col justify-between relative overflow-hidden group transition-all duration-700 bg-white shadow-sm border border-slate-100 ${plan.highlight ? "ring-4 ring-primary-blue/10 border-primary-blue shadow-3xl scale-105 z-10" : "hover:border-primary-blue"}`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 p-6">
                  <span className="bg-secondary-teal text-primary-navy text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] italic shadow-xl">Most Popular</span>
                </div>
              )}

              <div className="space-y-10">
                <div className="space-y-6">
                  <div className={`w-16 h-16 rounded-[1.5rem] bg-white border-2 border-slate-50 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-primary-blue transition-all duration-700`}>
                     <plan.icon size={32} className={`${plan.color}`} />
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-2xl font-extrabold font-outfit text-primary-navy italic uppercase leading-none">{plan.name}</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{plan.description}</p>
                  </div>
                </div>

                <div className="flex flex-col pt-8 border-t border-slate-50">
                  <div className="flex items-baseline gap-2">
                     <span className="text-6xl font-extrabold font-outfit text-primary-navy tracking-tighter leading-none italic">{plan.price}</span>
                     <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] italic">/ Month</span>
                  </div>
                  <p className="text-[9px] font-bold text-primary-blue uppercase tracking-widest mt-2 bg-primary-blue/5 px-3 py-1 rounded-full w-fit italic">{plan.tier} Protocol License</p>
                </div>

                <ul className="space-y-5 pt-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight italic group/feat">
                      <div className="w-5 h-5 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5 border border-slate-100 group-hover/feat:border-primary-blue transition-colors">
                         <Check className={`w-3 h-3 ${plan.highlight ? "text-primary-blue" : "text-emerald-500"}`} strokeWidth={3} />
                      </div>
                      <span className="group-hover/feat:text-primary-navy transition-colors">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-12">
                <Link 
                  href="/signup" 
                  className={`w-full py-6 rounded-[2rem] font-bold text-center block transition-all active:scale-95 text-[10px] uppercase tracking-[0.2em] italic ${
                    plan.highlight 
                      ? "bg-primary-navy text-white shadow-2xl hover:bg-slate-900" 
                      : "bg-white border-2 border-slate-100 text-primary-navy hover:border-primary-navy"
                  }`}
                >
                  Authorize {plan.tier} Access
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 max-w-4xl mx-auto p-12 md:p-16 bg-primary-navy text-white rounded-[4rem] shadow-3xl flex flex-col md:flex-row items-center gap-12 relative overflow-hidden border border-white/5">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.1),transparent)]" />
           <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center shrink-0 relative z-10">
              <PlusCircle size={40} className="text-secondary-teal" />
           </div>
           <div className="space-y-6 text-center md:text-left relative z-10">
              <div className="space-y-2">
                 <p className="text-[10px] font-bold text-secondary-teal uppercase tracking-[0.4em] italic leading-none">Global Infrastructure</p>
                 <h4 className="text-3xl font-extrabold font-outfit text-white italic uppercase tracking-tighter leading-none">Enterprise Forge.</h4>
              </div>
              <p className="text-slate-400 font-medium italic text-lg leading-relaxed uppercase tracking-tighter">
                Need more than 50 clients or custom white-label integrations? Our institutional team provides custom API deployment and professional auditing logic.
              </p>
              <Link 
                 href="mailto:support@ficogeek.com" 
                 className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-secondary-teal transition-colors italic hover:translate-x-2 transition-transform"
              >
                 Contact Institutional Sales <ArrowRight size={16} />
              </Link>
           </div>
        </div>
      </div>
    </section>
  );
};
