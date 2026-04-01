"use client";

import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, ChevronRight, PlayCircle, FileText, UploadCloud, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function OnboardingChecklist() {
  const { profile } = useAuth();

  if (!profile || profile.onboardingStatus === "completed") {
    // Return null or a completed state if we don't want to show it anymore
    return null;
  }

  const steps = [
    {
      id: "ai_session",
      title: "Start an AI Session",
      desc: "Meet FICO Geek AI and explore your options.",
      icon: PlayCircle,
      isComplete: !!profile.firstAiSessionAt,
      href: "/dashboard/ai"
    },
    {
      id: "first_letter",
      title: "Draft First Letter",
      desc: "Complete an intake and generate a preview.",
      icon: FileText,
      isComplete: !!profile.firstLetterGeneratedAt,
      href: "/dashboard/ai?mode=intake"
    },
    {
      id: "billing",
      title: "Review Billing Options",
      desc: "Unlock premium exports and multi-bureau tools.",
      icon: ShieldCheck,
      isComplete: profile.subscriptionPlan !== "free" || profile.billingBypass,
      href: "/dashboard/billing"
    }
  ];

  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.isComplete).length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="premium-card p-6 bg-gradient-to-b from-white to-slate-50 border border-slate-200 shadow-xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/5 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xl font-bold font-outfit text-primary-navy">Getting Started</h3>
            <p className="text-sm font-medium text-slate-500">Complete these steps to activate your workspace.</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic block mb-1">Progress</span>
            <span className="text-lg font-bold text-primary-blue leading-none">{progressPercent}%</span>
          </div>
        </div>

        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-primary-blue to-secondary-teal"
          />
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Link key={step.id} href={step.href}>
                <div className={`p-4 rounded-2xl border transition-all flex items-center gap-4 group ${
                  step.isComplete 
                    ? "bg-slate-50/50 border-transparent opacity-60 hover:opacity-100" 
                    : "bg-white border-slate-100 shadow-sm hover:border-primary-blue/30 hover:shadow-md cursor-pointer"
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    step.isComplete ? "bg-emerald-100 text-emerald-600" : "bg-primary-blue/10 text-primary-blue group-hover:bg-primary-blue group-hover:text-white"
                  }`}>
                    {step.isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold leading-none mb-1 ${step.isComplete ? "text-slate-600 line-through" : "text-primary-navy"}`}>
                      {step.title}
                    </h4>
                    <p className="text-xs font-medium text-slate-500">{step.desc}</p>
                  </div>
                  {!step.isComplete && (
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-blue transition-all group-hover:translate-x-1" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
