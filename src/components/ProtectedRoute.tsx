"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode;
  requiredRole?: "personal" | "pro" | "admin";
}) => {
  const { user, profile, loading } = useAuth();
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
      if (profile && profile.onboardingStatus !== "completed" && !isOnboardingPage && profile.role !== 'admin' && profile.role !== 'owner') {
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
    };

    performGuardCheck();
    initialCheckPerformed.current = true;
  }, [user, profile, loading, router, requiredRole, pathname]);

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

  return user ? <>{children}</> : null;
};
