"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoIcon } from "@/components/ui/LogoIcon";
import { Mail, Lock, Loader2, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ensureUserProfile } from "@/lib/auth-utils";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"personal" | "pro">("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(userCredential.user, role, name);
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log("Starting Google Registration flow...");
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    
    try {
      console.log("Triggering signInWithPopup...");
      const result = await signInWithPopup(auth, provider);
      console.log("Google Signup successful, ensuring profile exists with role:", role, result.user.uid);
      await ensureUserProfile(result.user, role);
      console.log("Profile check complete, redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Google signup error:", err);
      
      const isError = err instanceof Error;
      const errorCode = isError && "code" in err ? (err as { code: string }).code : "";
      const errorMessage = isError ? err.message : "Google sign in failed";

      // Check for popup blocked or closed by user
      if (errorCode === "auth/popup-blocked" || errorCode === "auth/cancelled-by-user") {
        console.log("Popup blocked or closed. Falling back to redirect...");
        try {
          await signInWithRedirect(auth, provider);
          // Note: redirect won't return; page will reload
          return;
        } catch (redirectErr: unknown) {
          console.error("Redirect registration error:", redirectErr);
          setError("Multiple registration methods failed. Please check your browser settings.");
        }
      } else {
        setError(errorMessage);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-light flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[600px] h-[600px] bg-primary-blue/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-20 w-[600px] h-[600px] bg-secondary-teal/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-lg relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="flex flex-col items-center justify-center gap-6 mb-12">
            <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 ring-4 ring-primary-blue/5">
              <LogoIcon size={48} className="w-12 h-12" />
            </div>
            <span className="font-outfit text-3xl font-bold tracking-tight text-primary-navy uppercase">FICO Geek</span>
          </div>
          <h1 className="text-3xl font-bold font-outfit text-primary-navy">Register Account</h1>
          <p className="text-slate-500 font-medium tracking-tight">Choose your workspace type to continue.</p>
        </div>

        <div className="premium-card p-10 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRole("personal")}
              className={`p-4 rounded-xl border-2 transition-all text-left space-y-2 ${
                role === "personal"
                  ? "border-primary-blue bg-primary-blue/5"
                  : "border-slate-100 bg-slate-50 hover:border-slate-200"
              }`}
            >
              <div className={`p-2 rounded-lg inline-flex ${role === "personal" ? "bg-primary-blue text-white" : "bg-slate-200 text-slate-500"}`}>
                <User className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm">Personal User</p>
              <p className="text-xs text-slate-500 font-medium">Manage own credit letters & vault.</p>
            </button>
            <button
              onClick={() => setRole("pro")}
              className={`p-4 rounded-xl border-2 transition-all text-left space-y-2 ${
                role === "pro"
                  ? "border-secondary-teal bg-secondary-teal/5"
                  : "border-slate-100 bg-slate-50 hover:border-slate-200"
              }`}
            >
               <div className={`p-2 rounded-lg inline-flex ${role === "pro" ? "bg-secondary-teal text-primary-navy" : "bg-slate-200 text-slate-500"}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm">Pro User</p>
              <p className="text-xs text-slate-500 font-medium">Manage clients and dispute cases.</p>
            </button>
          </div>

          <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none transition-all font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-navy text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-navy-muted hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-navy-900/10 disabled:opacity-70 md:col-span-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete registration"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="relative py-2 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative px-4 bg-white text-xs font-bold uppercase tracking-widest text-slate-400">Or continue with</span>
          </div>

          <button 
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-primary-navy hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
             Google Registration
          </button>

          <p className="text-xs text-slate-400 text-center leading-relaxed max-w-xs mx-auto">
            By registering, you agree to our <Link href="#" className="underline">Terms of Service</Link> and recognize this as a <span className="text-slate-500 font-bold uppercase tracking-tight">self-help tool</span>.
          </p>
        </div>

        <p className="text-center text-slate-500 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-blue font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
