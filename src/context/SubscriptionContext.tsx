"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { upgradeSubscriptionAction } from "@/app/actions/subscription";
import { logAuditAction } from "@/lib/audit";

type PlanType = "free" | "premium" | "pro";

interface PlanCapabilities {
  maxClients: number;
  maxLettersPerMonth: number;
  canExportPDF: boolean;
  canArchive: boolean;
  hasAdminTools: boolean;
  supportLevel: "Email" | "Priority" | "Dedicated Account Manager";
}

const PLAN_LIMITS: Record<PlanType, PlanCapabilities> = {
  free: {
    maxClients: 0,
    maxLettersPerMonth: 3,
    canExportPDF: false,
    canArchive: true,
    hasAdminTools: false,
    supportLevel: "Email",
  },
  premium: {
    maxClients: 0,
    maxLettersPerMonth: 50,
    canExportPDF: true,
    canArchive: true,
    hasAdminTools: false,
    supportLevel: "Priority",
  },
  pro: {
    maxClients: 50,
    maxLettersPerMonth: 1000,
    canExportPDF: true,
    canArchive: true,
    hasAdminTools: false,
    supportLevel: "Dedicated Account Manager",
  },
};

interface SubscriptionContextType {
  plan: PlanType;
  capabilities: PlanCapabilities;
  isUpgradeRequired: (feature: keyof PlanCapabilities, currentCount?: number) => boolean;
  upgradePlan: (newPlan: PlanType) => Promise<void>;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<PlanType>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.subscriptionPlan) {
      setPlan(profile.subscriptionPlan as PlanType);
    }
    setLoading(false);
  }, [profile]);

  const capabilities = PLAN_LIMITS[plan];

  const isUpgradeRequired = (feature: keyof PlanCapabilities, currentCount: number = 0) => {
    const limit = capabilities[feature];
    if (typeof limit === "number") {
      return currentCount >= limit;
    }
    if (typeof limit === "boolean") {
      return !limit;
    }
    return false;
  };

  const upgradePlan = async (newPlan: PlanType) => {
    if (!profile) return;
    
    try {
      // 1. Trigger Server Action for secure backend transaction
      const result = await upgradeSubscriptionAction(profile.uid, newPlan as "premium" | "pro");
      
      if (!result.success) {
        throw new Error(result.error || "Server-side upgrade failed");
      }

      setPlan(newPlan);

      // 2. Audit Log for Plan Upgrade
      await logAuditAction(
        profile.uid,
        profile.name,
        profile.role,
        "SENSITIVE_RECORD_UPDATE",
        `Subscription plan upgraded to ${newPlan}`,
        "SUBSCRIPTION",
        profile.uid
      );

    } catch (e) {
      console.error("Failed to upgrade plan securely", e);
      throw e;
    }
  };

  return (
    <SubscriptionContext.Provider value={{ plan, capabilities, isUpgradeRequired, upgradePlan, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
