"use client";

import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";

/**
 * AdminGuard component
 * 
 * Provides a standardized 'Access Restricted' UI for non-owner and non-admin accounts.
 * This ensures that even if a user bypasses the layout guard, they cannot view
 * sensitive administrative modules.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdminOrOwner } = useAuth();

  if (!isAdminOrOwner) {
    return (
      <div className="premium-card p-20 text-center space-y-8 bg-slate-50/50">
        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto text-red-500 shadow-2xl border border-red-50">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold text-primary-navy font-outfit uppercase italic tracking-tight italic">Access Restricted</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            This module is reserved for Platform Owners and Sovereign Administrators. All access attempts are monitored and logged for security audit purposes.
          </p>
        </div>
        <div className="pt-4">
          <button 
            onClick={() => window.location.href = "/dashboard"}
            className="btn-primary py-4 px-10 uppercase tracking-widest text-[10px] font-bold italic"
          >
            Return to Authorized Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
