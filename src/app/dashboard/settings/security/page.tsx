"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  ChevronRight, 
  Lock, 
  Key, 
  History, 
  ShieldAlert 
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { 
  doc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from "firebase/firestore";
import { logAuditAction } from "@/lib/audit";
import { formatDisplayDate } from "@/lib/utils";

export default function SecurityPage() {
  const { user, profile, mfaEnabled, set2faVerified } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [step, setStep] = useState(1); // 1: Info/Start, 2: QR/Verify
  const [totpData, setTotpData] = useState<{ secret: string, qrCodeUrl: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  
  // Disable 2FA states
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [disableToken, setDisableToken] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);

  const fetchAuditLogs = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "audit_logs"),
        where("actorUID", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      setAuditLogs(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Fetch logs error:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [user]);

  const startEnrollment = async () => {
    if (!user) return;
    setLoading(true);
    setStatus(null);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/2fa/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to generate 2FA secret");
      
      const data = await response.json();
      setTotpData(data);
      
      await logAuditAction(
        user.uid,
        profile?.name || "User",
        profile?.role || "personal",
        "TOTP_ENROLLMENT_START",
        "User started custom TOTP 2FA enrollment"
      );
      setStep(2);
    } catch (err: unknown) {
      console.error("TOTP Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to start TOTP enrollment.";
      setStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const finishEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !totpData) return;
    setLoading(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          token: verificationCode,
          secret: totpData.secret,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Invalid verification code.");

      await logAuditAction(
        user.uid,
        profile?.name || "User",
        profile?.role || "personal",
        "TOTP_ENROLLMENT_COMPLETE",
        "User successfully enabled custom TOTP 2FA"
      );

      setStatus({ type: 'success', message: "2FA successfully enabled!" });
      set2faVerified(true);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: unknown) {
      console.error("TOTP Verify Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Invalid code. Please try again.";
      setStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || disableToken.length !== 6) return;
    setIsDisabling(true);
    setStatus(null);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ token: disableToken }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to disable 2FA.");

      await logAuditAction(
        user.uid,
        profile?.name || "User",
        profile?.role || "personal",
        "TOTP_DISABLED",
        "User successfully disabled custom TOTP 2FA"
      );

      setStatus({ type: 'success', message: "2FA has been disabled." });
      set2faVerified(false);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      console.error("Disable 2FA Error:", err);
      setStatus({ type: 'error', message: err.message || "Invalid code." });
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
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
                 {mfaEnabled ? "Enabled via Authenticator" : "Action Required"}
              </p>
           </div>

           <div className="premium-card p-6 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Why use TOTP?</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">TOTP is more secure than SMS as it doesn&apos;t rely on your cellular network and is immune to SIM-swapping attacks.</p>
           </div>
        </div>

        <div className="lg:col-span-2">
           {!mfaEnabled ? (
              <div className="premium-card p-10 space-y-8">
                 <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                    <Key className="w-6 h-6 text-primary-blue" />
                    <h3 className="text-xl font-bold font-outfit text-primary-navy">Set Up Two-Factor Authentication</h3>
                 </div>

                 {status && (
                   <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                     {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                     <p className="text-sm font-bold">{status.message}</p>
                   </div>
                 )}

                 {step === 1 ? (
                   <div className="space-y-6">
                     <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                        <h4 className="font-bold text-primary-navy">Why switch to Authenticator Apps?</h4>
                        <ul className="space-y-3">
                           <li className="text-sm text-slate-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-primary-blue rounded-full mt-1.5 shrink-0" />
                              <span>More secure than SMS (immune to SIM swapping)</span>
                           </li>
                           <li className="text-sm text-slate-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-primary-blue rounded-full mt-1.5 shrink-0" />
                              <span>Works offline and while traveling</span>
                           </li>
                        </ul>
                     </div>
                     <button 
                       onClick={startEnrollment}
                       disabled={loading}
                       className="btn-primary py-4 px-10 flex items-center gap-3 w-full justify-center"
                     >
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                       <span>Begin Enrollment Flow</span>
                     </button>
                   </div>
                 ) : (
                   <form onSubmit={finishEnrollment} className="space-y-8">
                     <div className="flex flex-col items-center gap-8 text-center">
                        <div className="p-4 bg-white border-4 border-slate-50 rounded-[2rem] shadow-xl">
                           {totpData ? (
                              <img 
                                src={totpData.qrCodeUrl} 
                                alt="TOTP QR Code"
                                className="w-[200px] h-[200px]"
                              />
                           ) : (
                              <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-50 rounded-xl">
                                 <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                              </div>
                           )}
                        </div>
                        
                        <div className="space-y-2">
                           <p className="text-sm font-bold text-primary-navy">Scan this QR code with your authenticator app</p>
                           <p className="text-xs text-slate-400">Google Authenticator, Microsoft Authenticator, or Authy</p>
                        </div>

                        <div className="w-full space-y-4">
                           <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                 <div className="w-full border-t border-slate-100"></div>
                              </div>
                              <span className="relative px-4 bg-white text-[10px] font-bold uppercase tracking-widest text-slate-300">Or enter manually</span>
                           </div>
                           
                           <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-mono text-[10px] break-all text-slate-500">
                              {totpData?.secret}
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Enter 6-Digit Code</label>
                        <input 
                          type="text" 
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 focus:bg-white transition-all font-bold text-center text-3xl tracking-[0.5em] text-primary-blue"
                          placeholder="000000"
                          required
                        />
                        <button 
                          type="submit" 
                          disabled={loading}
                          className="w-full btn-primary py-4 px-10 flex items-center justify-center gap-3"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                          <span>Verify & Enable 2FA</span>
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="w-full text-xs font-bold text-slate-400 hover:text-primary-navy uppercase tracking-widest transition-colors">
                           Go Back
                        </button>
                     </div>
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
                     <p className="text-slate-500 font-medium">Your account is currently protected by Authenticator App Two-Factor Authentication.</p>
                  </div>

                  {status && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <p className="text-sm font-bold">{status.message}</p>
                    </div>
                  )}

                  {!showDisableForm ? (
                    <div className="pt-6">
                       <button 
                         onClick={() => setShowDisableForm(true)}
                         className="btn-secondary text-red-600 border-red-50 hover:bg-red-50 text-[10px] tracking-[0.2em] uppercase font-black px-6"
                       >
                          Disable 2FA protection
                       </button>
                    </div>
                  ) : (
                    <form onSubmit={handleDisable2FA} className="pt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 mx-auto max-w-xs">
                      <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block">
                          Enter Code to Confirm
                        </label>
                        <input 
                          type="text" 
                          maxLength={6}
                          value={disableToken}
                          onChange={(e) => setDisableToken(e.target.value)}
                          className="w-full bg-transparent border-b-2 border-slate-200 outline-none text-center text-2xl tracking-[0.5em] font-bold text-primary-navy focus:border-red-500 transition-colors"
                          placeholder="000000"
                        />
                      </div>
                      <div className="flex gap-2">
                         <button 
                           type="submit" 
                           disabled={isDisabling || disableToken.length !== 6}
                           className="flex-1 btn-primary bg-red-600 hover:bg-red-700 border-none py-3 shadow-red-200 text-[10px]"
                         >
                            {isDisabling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Disable"}
                         </button>
                         <button 
                           type="button" 
                           onClick={() => setShowDisableForm(false)}
                           className="px-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600"
                         >
                            Cancel
                         </button>
                      </div>
                    </form>
                  )}
               </div>
           )}
        </div>
      </div>

      <div className="space-y-6">
          <div className="flex items-center gap-3">
             <History className="w-6 h-6 text-slate-400" />
             <h2 className="text-2xl font-bold font-outfit text-primary-navy">Recent Security Activity</h2>
          </div>

          <div className="premium-card overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                         <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event</th>
                         <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                         <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {logsLoading ? (
                        <tr>
                           <td colSpan={3} className="px-8 py-12 text-center">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-200" />
                           </td>
                        </tr>
                      ) : auditLogs.length === 0 ? (
                        <tr>
                           <td colSpan={3} className="px-8 py-12 text-center text-sm font-medium text-slate-400 italic">
                              No recent activity detected.
                           </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                           <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-4">
                                 <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-slate-100 rounded text-slate-600 group-hover:bg-primary-blue group-hover:text-white transition-colors">
                                    {log.action.replace(/_/g, ' ')}
                                 </span>
                              </td>
                              <td className="px-8 py-4 text-sm font-medium text-slate-600">
                                 {log.summary || "No details available"}
                              </td>
                              <td className="px-8 py-4 text-[10px] font-bold text-slate-400 text-right uppercase">
                                 {formatDisplayDate(log.timestamp)}
                              </td>
                           </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
}
