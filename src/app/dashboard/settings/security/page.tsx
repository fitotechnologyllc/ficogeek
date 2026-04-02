"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  ChevronRight,
  Lock,
  Key
} from "lucide-react";
import Link from "next/link";
import { 
  multiFactor, 
  PhoneAuthProvider, 
  PhoneMultiFactorGenerator 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { logAuditAction } from "@/lib/audit";

interface RecaptchaWindow extends Window {
  recaptchaVerifier?: any; 
}

export default function SecurityPage() {
  const { user, profile, mfaEnabled } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [step, setStep] = useState(1); // 1: Input, 2: OTP
  const [recaptchaInitialized, setRecaptchaInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !recaptchaInitialized) {
      const { RecaptchaVerifier } = require("firebase/auth");
      (window as unknown as RecaptchaWindow).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          console.log("reCAPTCHA solved");
        }
      });
      setRecaptchaInitialized(true);
    }
  }, [recaptchaInitialized]);

  const startEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setStatus(null);

    try {
      const session = await multiFactor(user).getSession();
      const phoneOpts = {
        phoneNumber: phoneNumber,
        session: session
      };
      const provider = new PhoneAuthProvider(auth);
      const verifier = (window as unknown as RecaptchaWindow).recaptchaVerifier;
      const vid = await provider.verifyPhoneNumber(phoneOpts, verifier);
      await logAuditAction(
        user.uid,
        profile?.name || "User",
        profile?.role || "personal",
        "MFA_ENROLLMENT_START",
        `User started MFA enrollment for ${phoneNumber.slice(-4)}`
      );
      setVerificationId(vid);
      setStep(2);
    } catch (err: unknown) {
      console.error("MFA Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to start enrollment.";
      setStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const finishEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !verificationId) return;
    setLoading(true);

    try {
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(user).enroll(multiFactorAssertion, "Primary Phone");
      
      // Update profile
      await updateDoc(doc(db, "profiles", user.uid), {
        mfaEnabled: true,
        mfaType: "sms",
        updatedAt: new Date().toISOString()
      });

      await logAuditAction(
        user.uid,
        profile?.name || "User",
        profile?.role || "personal",
        "MFA_ENROLLMENT_COMPLETE",
        "User successfully enabled SMS MFA"
      );

      setStatus({ type: 'success', message: "2FA successfully enabled!" });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: unknown) {
      console.error("MFA Verify Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Invalid code.";
      setStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-outfit text-primary-navy">Security Controls</h1>
          <p className="text-slate-500 font-medium tracking-tight">Two-factor authentication and access logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
           <div className={`premium-card p-6 border-2 transition-all ${mfaEnabled ? 'border-emerald-100 bg-emerald-50/20' : 'border-amber-100 bg-amber-50/20'}`}>
              <div className="flex items-center gap-3 mb-4">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mfaEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-slate-800">MFA Status</h3>
              </div>
              <p className="text-2xl font-bold font-outfit text-primary-navy mb-1">{mfaEnabled ? "Protected" : "Vulnerable"}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                 {mfaEnabled ? "Enabled via SMS" : "Action Required"}
              </p>
           </div>

           <div className="premium-card p-6 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Why use 2FA?</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Protecting your account with an extra layer of security prevents unauthorized access even if your password is compromised.</p>
           </div>
        </div>

        <div className="lg:col-span-2">
           {!mfaEnabled ? (
             <div className="premium-card p-10 space-y-8">
               <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                  <Smartphone className="w-6 h-6 text-primary-blue" />
                  <h3 className="text-xl font-bold font-outfit text-primary-navy">Enroll SMS Authentication</h3>
               </div>

               {status && (
                 <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                   {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                   <p className="text-sm font-bold">{status.message}</p>
                 </div>
               )}

               {step === 1 ? (
                 <form onSubmit={startEnrollment} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number (E.164)</label>
                      <input 
                        type="tel" 
                        placeholder="+1 555 123 4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 focus:bg-white transition-all font-bold text-primary-navy"
                        required
                      />
                   </div>
                   <button 
                     type="submit" 
                     disabled={loading}
                     className="btn-primary py-4 px-10 flex items-center gap-2"
                   >
                     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                     <span>Send Verification Code</span>
                   </button>
                   {/* Recaptcha Container */}
                   <div id="recaptcha-container"></div>
                 </form>
               ) : (
                 <form onSubmit={finishEnrollment} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">6-Digit SMS Code</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 focus:bg-white transition-all font-bold text-center text-2xl tracking-[0.5em] text-primary-blue"
                        required
                      />
                   </div>
                   <button 
                     type="submit" 
                     disabled={loading}
                     className="btn-primary py-4 px-10 flex items-center gap-2"
                   >
                     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                     <span>Verify & Enable</span>
                   </button>
                   <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-slate-400 hover:text-primary-navy uppercase tracking-widest ml-4 transition-colors">
                      Change Number
                   </button>
                 </form>
               )}
             </div>
           ) : (
             <div className="premium-card p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl">
                   <ShieldCheck className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-bold font-outfit text-primary-navy">Security Fully Hardened</h3>
                   <p className="text-slate-500 font-medium">Your account is currently protected by SMS Two-Factor Authentication.</p>
                </div>
                <div className="pt-6">
                   <button className="btn-secondary text-red-600 border-red-50 hover:bg-red-50 text-[10px] tracking-[0.2em] uppercase font-black">
                      Disable 2FA (Not Recommended)
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
