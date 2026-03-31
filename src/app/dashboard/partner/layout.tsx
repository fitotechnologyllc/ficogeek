"use client";

import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Lock } from "lucide-react";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useAuth();

  // Special case: Partners can be any role, but must have isPartner flag
  if (profile && !profile.isPartner && profile.role !== "admin") {
    return (
      <div className="p-20 text-center space-y-6">
        <div className="w-24 h-24 bg-primary-blue/5 rounded-full flex items-center justify-center mx-auto text-primary-blue animate-pulse">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold font-outfit text-primary-navy">Partner Portal Locked</h2>
        <p className="text-slate-500 max-w-md mx-auto">This area is reserved for FICO Geek Partners. Join the program in your account settings to unlock.</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
