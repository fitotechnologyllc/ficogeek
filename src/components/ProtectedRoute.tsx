"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

export const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode;
  requiredRole?: "personal" | "pro" | "admin";
}) => {
  const { user, profile, loading, isAdminOrOwner, mfaEnabled } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("[ProtectedRoute] No user found, redirecting to login.");
        router.push("/login");
      } else if (requiredRole && profile?.role !== requiredRole && profile?.role !== "admin" && profile?.role !== "owner") {
        console.warn(`[ProtectedRoute] Insufficient permissions for role: ${profile?.role || "NONE"}. Redirecting to safety.`);
        router.push("/dashboard");
      } 
      
      // Onboarding Enforcement for New Users
      const isOnboardingPage = pathname === "/onboarding";
      const isPendingOnboarding = profile && profile.onboardingStatus !== "completed";
      
      // We only force onboarding for personal/pro roles initially
      const shouldForceOnboarding = (profile?.role === "personal" || profile?.role === "pro") && isPendingOnboarding && !isOnboardingPage;

      if (user && shouldForceOnboarding) {
        console.warn("[ProtectedRoute] Onboarding Pending. Redirecting to guided flow.");
        router.push("/onboarding");
      }
      
      // MFA Enforcement for Owner/Admin
      const isSecurityPage = pathname === "/dashboard/settings/security";
      if (user && isAdminOrOwner && !mfaEnabled && !isSecurityPage && !isOnboardingPage) {
        console.warn("[ProtectedRoute] MFA Required for Elevated Privileges. Redirecting to security enrollment.");
        router.push("/dashboard/settings/security");
      }
    }
  }, [user, profile, loading, router, requiredRole, isAdminOrOwner, mfaEnabled, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-blue" />
      </div>
    );
  }

  // Show a restricted message if MFA is required but they are NOT on the security page
  // This handles the gap between the redirect and the page content
  const isSecurityPage = pathname === "/dashboard/settings/security";
  if (user && isAdminOrOwner && !mfaEnabled && !isSecurityPage) {
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
             className="btn-primary"
           >
              Enable MFA Now
           </button>
        </div>
     );
  }

  return user ? <>{children}</> : null;
};
