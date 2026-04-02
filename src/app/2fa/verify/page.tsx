"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function TwoFactorVerifyPage() {
  const { user, profile, is2faVerified, set2faVerified, loading } = useAuth();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Redirect if already verified or if 2FA not enabled
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && profile && !profile.twoFactorEnabled) {
      router.push("/dashboard");
    } else if (!loading && is2faVerified) {
      router.push("/dashboard");
    }
  }, [user, profile, is2faVerified, loading, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setIsVerifying(true);
    setError(null);

    try {
      const idToken = await user?.getIdToken();
      const response = await fetch("/api/2fa/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ token: code }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Security verification successful.");
        set2faVerified(true);
        router.push("/dashboard");
      } else {
        setError(data.error || "Invalid verification code.");
      }
    } catch (err) {
      console.error("[2FA Verify Error]:", err);
      setError("A server error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary-blue/10 text-primary-blue rounded-3xl flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-outfit text-primary-navy">Identity Verification</h1>
            <p className="text-slate-500 text-sm px-4">
              Two-Factor Authentication is active. Enter the 6-digit code from your authenticator app to continue.
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 block ml-1">
              Authenticator Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              className="w-full h-16 text-4xl text-center font-mono tracking-[0.5em] bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 transition-all outline-none text-primary-navy placeholder:text-slate-200"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm border border-red-100 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || code.length !== 6}
            className="w-full h-14 bg-primary-navy text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary-navy/20 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
          >
            {isVerifying ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Verify Access</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 text-center">
          <button 
            onClick={() => router.push("/login")}
            className="text-xs font-bold text-slate-400 hover:text-primary-blue transition-colors uppercase tracking-widest"
          >
            Sign in as different user
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
        FICO GEEK • SECURE ACCESS GATEWAY
      </p>
    </div>
  );
}
