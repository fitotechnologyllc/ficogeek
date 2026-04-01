"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("[ProtectedRoute] No user found, redirecting to login.");
        router.push("/login");
      } else if (requiredRole && profile?.role !== requiredRole && profile?.role !== "admin") {
        console.warn(`[ProtectedRoute] Insufficient permissions for role: ${profile?.role || "NONE"}. Redirecting to safety.`);
        router.push("/dashboard");
      } else if (user && !profile) {
        // This is a safety guard for the first few seconds of a Google login bootstrap
        console.log("[ProtectedRoute] User exists but profile is pending. Allowing retry in context.");
      }
    }
  }, [user, profile, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-light">
        <Loader2 className="w-10 h-10 animate-spin text-primary-blue" />
      </div>
    );
  }

  return user ? <>{children}</> : null;
};
