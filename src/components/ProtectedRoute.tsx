"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

export const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode;
  requiredRole?: "personal" | "pro" | "admin";
}) => {
  const { user, profile, loading, mfaEnabled } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const initialCheckPerformed = useRef(false);

  useEffect(() => {
    if (loading) return;

    const performGuardCheck = () => {
      // 1. If NO user, go to login
      if (!user) {
        console.log("[ProtectedRoute] No session. Redirecting to login.");
        router.push("/login");
        return;
      }

      // 2. If user exists but NO profile, and NOT on onboarding, force onboarding
      const isOnboardingPage = pathname === "/onboarding";
      if (!profile && !isOnboardingPage) {
        console.warn("[ProtectedRoute] No profile found. Redirecting to onboarding.");
        router.push("/onboarding");
        return;
      }

      // 3. Onboarding Enforcement (if profile exists)
      if (profile && profile.onboardingStatus !== "completed" && !isOnboardingPage && profile.role !== 'admin') {
        console.warn("[ProtectedRoute] Onboarding incomplete.");
        router.push("/onboarding");
        return;
      }

      // 4. Role-based protection
      if (requiredRole && profile) {
        const hasAccess = 
          profile.role === requiredRole || 
          profile.role === "admin" || 
          profile.role === "owner";
          
        if (!hasAccess) {
          console.warn(`[ProtectedRoute] Access denied for role: ${profile.role}`);
          router.push("/dashboard");
          return;
        }
      }

      // 5. MFA Enforcement
      const isAdminOrOwner = profile?.role === "admin" || profile?.role === "owner";
      const isSecurityPage = pathname === "/dashboard/settings/security";
      if (isAdminOrOwner && !mfaEnabled && !isSecurityPage && !isOnboardingPage) {
        router.push("/dashboard/settings/security");
        return;
      }
    };

    performGuardCheck();
    initialCheckPerformed.current = true;
  }, [user, profile, loading, router, requiredRole, mfaEnabled, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary-blue" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  // Handle high-privilege MFA gap
  const isAdminOrOwner = profile?.role === "admin" || profile?.role === "owner";
  const isSecurityPage = pathname === "/dashboard/settings/security";
  const isOnboardingPage = pathname === "/onboarding";
  
  if (user && profile && isAdminOrOwner && !mfaEnabled && !isSecurityPage && !isOnboardingPage) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center space-y-6">
           <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <ShieldAlert className="w-8 h-8" />
           </div>
           <div className="space-y-2">
              <h1 className="text-2xl font-bold font-outfit text-primary-navy">Security Clearance Required</h1>
              <p className="text-slate-500 max-w-sm">This account has elevated privileges. You must enable Two-Factor Authentication to access the dashboard.</p>
           </div>
           <button 
             onClick={() => router.push("/dashboard/settings/security")}
             className="px-8 py-3 bg-primary-navy text-white rounded-xl font-bold hover:scale-105 transition-all shadow-xl"
           >
              Enable MFA Now
           </button>
        </div>
     );
  }

  return user ? <>{children}</> : null;
};
