"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Rocket, 
  ArrowRight, 
  ShieldCheck, 
  MessageSquare, 
  BookOpen, 
  UploadCloud, 
  Compass,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { logAuditAction } from "@/lib/audit";

export default function OnboardingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const updateOnboarding = async (intent: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "profiles", user.uid), {
        onboardingCurrentStep: intent,
        onboardingStartedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      if (intent === "dispute") {
        await logAuditAction(user.uid, profile?.name || "User", profile?.role || "personal", "ONBOARDING_STARTED", "User started AI dispute onboarding");
        router.push("/dashboard/ai?mode=intake");
      } else if (intent === "learn") {
        await logAuditAction(user.uid, profile?.name || "User", profile?.role || "personal", "ONBOARDING_STARTED", "User started Learn onboarding tour");
        router.push("/dashboard/ai?mode=tour");
      } else if (intent === "upload") {
        await logAuditAction(user.uid, profile?.name || "User", profile?.role || "personal", "ONBOARDING_STARTED", "User started Upload onboarding");
        router.push("/dashboard/vault?onboarding=true");
      } else {
        await updateDoc(doc(db, "profiles", user.uid), {
          onboardingStatus: "completed",
          onboardingCompletedAt: new Date().toISOString()
        });
        await logAuditAction(user.uid, profile?.name || "User", profile?.role || "personal", "ONBOARDING_COMPLETED", "User completed onboarding by skipping to dashboard");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Onboarding update error:", err);
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-teal-50/30">
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="welcome"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="premium-card p-12 lg:p-16 text-center space-y-10 relative overflow-hidden bg-white/80 backdrop-blur-xl border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]"
            >
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-teal/5 blur-[80px] -ml-32 -mb-32 rounded-full" />

              <motion.div variants={itemVariants} className="flex justify-center">
                <div className="w-24 h-24 bg-primary-navy rounded-[2rem] flex items-center justify-center shadow-2xl relative">
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                  <div className="absolute -inset-4 bg-primary-blue/10 rounded-[2.5rem] -z-10 animate-pulse" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <h1 className="text-5xl font-bold font-outfit text-primary-navy tracking-tight">
                  Welcome to FICO Geek
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                  Let’s help you create your first dispute letter with 
                  <span className="text-primary-blue"> AI-guided support</span>, secure document tools, and a clean step-by-step process.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="btn-primary py-5 px-12 text-lg rounded-2xl flex items-center gap-3 group shadow-[0_20px_40px_-10px_rgba(10,31,68,0.3)]"
                >
                  Start with AI 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => updateOnboarding("explore")}
                  className="text-slate-400 font-bold hover:text-primary-navy transition-colors flex items-center gap-2 px-8"
                >
                  Explore Dashboard
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-8 border-t border-slate-50 flex items-center justify-center gap-10 opacity-60">
                <TrustSignal icon={<ShieldCheck className="w-4 h-4" />} label="Bank-Level Security" />
                <TrustSignal icon={<CheckCircle2 className="w-4 h-4" />} label="Compliance Verified" />
                <TrustSignal icon={<Sparkles className="w-4 h-4" />} label="AI-Powered" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="intent"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-4xl font-bold font-outfit text-primary-navy">What would you like to do first?</h2>
                <p className="text-slate-500 font-medium">Select a path to get started. You can always change this later.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IntentCard 
                  icon={<Rocket className="w-8 h-8 text-white" />}
                  bg="bg-primary-navy"
                  title="Create my first letter"
                  description="Let our AI guide you through drafting a professional dispute letter in minutes."
                  onClick={() => updateOnboarding("dispute")}
                  loading={loading}
                />
                <IntentCard 
                  icon={<BookOpen className="w-8 h-8 text-primary-blue" />}
                  bg="bg-blue-50"
                  title="Learn how it works"
                  description="New to credit repair? Take a short guided tour of the FICO Geek ecosystem."
                  onClick={() => updateOnboarding("learn")}
                  loading={loading}
                />
                <IntentCard 
                  icon={<UploadCloud className="w-8 h-8 text-secondary-teal" />}
                  bg="bg-teal-50"
                  title="Upload my documents"
                  description="Securely store your IDs and credit reports in the encrypted Document Vault."
                  onClick={() => updateOnboarding("upload")}
                  loading={loading}
                />
                <IntentCard 
                  icon={<Compass className="w-8 h-8 text-slate-400" />}
                  bg="bg-slate-50"
                  title="Just explore for now"
                  description="Go straight to your dashboard and see all the tools available to you."
                  onClick={() => updateOnboarding("explore")}
                  loading={loading}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TrustSignal({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-400 italic">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function IntentCard({ icon, title, description, onClick, bg, loading }: any) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={!loading ? onClick : undefined}
      className={`premium-card p-8 cursor-pointer group transition-all h-full flex flex-col border-none shadow-[0_16px_48px_-12px_rgba(0,0,0,0.05)] ${loading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className={`w-16 h-16 ${bg} rounded-2xl mb-6 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
        {icon}
      </div>
      <div className="space-y-2 flex-1">
        <h3 className="text-xl font-bold text-primary-navy flex items-center justify-between">
          {title}
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-blue group-hover:translate-x-1 transition-all" />
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
      </div>
    </motion.div>
  );
}
