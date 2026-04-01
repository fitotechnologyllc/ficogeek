"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { upgradeSubscriptionAction } from "@/app/actions/subscription";
import { logAuditAction } from "@/lib/audit";
import { getEntitlements, UserEntitlements } from "@/lib/entitlements";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, onSnapshot } from "firebase/firestore";
import { PromoRedemption } from "@/lib/schema";

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
  plan: PlanType | "owner_unlimited";
  capabilities: UserEntitlements;
  activeRedemption: PromoRedemption | null;
  isUpgradeRequired: (feature: keyof UserEntitlements, currentCount?: number) => boolean;
  upgradePlan: (newPlan: PlanType) => Promise<void>;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, user } = useAuth();
  const [activeRedemption, setActiveRedemption] = useState<PromoRedemption | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setActiveRedemption(null);
      setLoading(false);
      return;
    }

    // Subscribe to active promo redemptions
    const q = query(
      collection(db, "promo_redemptions"),
      where("redeemedByUID", "==", user.uid),
      where("status", "==", "active"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setActiveRedemption({ id: snap.docs[0].id, ...snap.docs[0].data() } as PromoRedemption);
      } else {
        setActiveRedemption(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const capabilities = getEntitlements(profile, activeRedemption);
  const plan = capabilities.plan;

  const isUpgradeRequired = (feature: keyof UserEntitlements, currentCount: number = 0) => {
    // Owner bypass is already handled by getEntitlements returning high limits
    const limit = (capabilities as any)[feature];
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
      const result = await upgradeSubscriptionAction(profile.id, newPlan as "premium" | "pro");
      if (!result.success) throw new Error(result.error || "Server-side upgrade failed");

      await logAuditAction(
        profile.id,
        profile.name,
        profile.role,
        "SENSITIVE_RECORD_UPDATE",
        `Subscription plan upgraded to ${newPlan}`,
        "SUBSCRIPTION",
        profile.id
      );
    } catch (e) {
      console.error("Failed to upgrade plan securely", e);
      throw e;
    }
  };

  return (
    <SubscriptionContext.Provider value={{ 
      plan, 
      capabilities, 
      activeRedemption,
      isUpgradeRequired, 
      upgradePlan, 
      loading 
    }}>
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
