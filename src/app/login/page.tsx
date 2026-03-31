"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Final redirect logic handled in layout/middleware
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-light flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[600px] h-[600px] bg-primary-blue/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-20 w-[600px] h-[600px] bg-secondary-teal/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-primary-navy p-2 rounded-xl shadow-xl">
              <ShieldCheck className="w-8 h-8 text-secondary-teal" />
            </div>
            <span className="font-outfit text-2xl font-bold tracking-tight text-primary-navy uppercase">FICO Geek</span>
          </Link>
          <h1 className="text-3xl font-bold font-outfit text-primary-navy">Welcome back</h1>
          <p className="text-slate-500 font-medium">Access your secure document ledger.</p>
        </div>

        <div className="premium-card p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <Link href="#" className="text-sm font-bold text-primary-blue hover:underline">Forgot password?</Link>
              </div>
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
              className="w-full py-4 bg-primary-navy text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-navy-muted hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-navy-900/10 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in to account"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="relative py-2 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative px-4 bg-white text-xs font-bold uppercase tracking-widest text-slate-400">Or continue with</span>
          </div>

          <button className="w-full py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-primary-navy hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
             Google Login
          </button>
        </div>

        <p className="text-center text-slate-500 font-medium">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary-blue font-bold hover:underline">Create a free account</Link>
        </p>
      </div>
    </div>
  );
}
