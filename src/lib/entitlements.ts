import { UserProfile, PromoRedemption } from "./schema";

export interface UserEntitlements {
  plan: "free" | "premium" | "pro" | "owner_unlimited";
  isUnlimited: boolean;
  canGenerateLetters: boolean;
  canExportPDF: boolean;
  canManageClients: boolean;
  maxLettersPerMonth: number;
  maxClients: number;
}

export const getEntitlements = (
  profile: UserProfile | null,
  activeRedemption: PromoRedemption | null = null
): UserEntitlements => {
  // 1. Default (Free)
  const base: UserEntitlements = {
    plan: "free",
    isUnlimited: false,
    canGenerateLetters: true,
    canExportPDF: false,
    canManageClients: false,
    maxLettersPerMonth: 3,
    maxClients: 0,
  };

  if (!profile) return base;

  // 2. Owner Bypass Logic (Highest Priority)
  if (profile.role === "owner" || profile.billingBypass) {
    return {
      plan: "owner_unlimited",
      isUnlimited: true,
      canGenerateLetters: true,
      canExportPDF: true,
      canManageClients: true,
      maxLettersPerMonth: 999999,
      maxClients: 999999,
    };
  }

  // 3. Determine Effective Plan (Promo > Current Subscription)
  let effectivePlan: "free" | "premium" | "pro" | "owner_unlimited" = (profile.subscriptionPlan as any) || "free";
  
  // Promotion bypass
  if (activeRedemption && activeRedemption.status === "active") {
    // Promo overrides if it's a higher tier
    if (activeRedemption.grantedPlan === "pro") {
      effectivePlan = "pro";
    } else if (activeRedemption.grantedPlan === "premium" && effectivePlan === "free") {
      effectivePlan = "premium";
    }
  }

  // 4. Subscription Guard: Ensure Stripe status is active/trailing
  const validStatuses = ["active", "trialing"];
  if (profile.stripeSubscriptionId && !validStatuses.includes(profile.subscriptionStatus || "")) {
    // If stripe subscription exists but is NOT active/trialing, and there's no promo, degrade to free
    if (!activeRedemption || activeRedemption.status !== "active") {
       effectivePlan = "free";
    }
  }

  // 5. Map Plan to Capabilities
  switch (effectivePlan) {
    case "pro":
      return {
        plan: "pro",
        isUnlimited: false,
        canGenerateLetters: true,
        canExportPDF: true,
        canManageClients: true,
        maxLettersPerMonth: 1000,
        maxClients: 50,
      };
    case "premium":
      return {
        plan: "premium",
        isUnlimited: false,
        canGenerateLetters: true,
        canExportPDF: true,
        canManageClients: false,
        maxLettersPerMonth: 50,
        maxClients: 0,
      };
    case "owner_unlimited":
       // Handled above, but here for completeness
       return base; 
    default:
      return base;
  }
};
