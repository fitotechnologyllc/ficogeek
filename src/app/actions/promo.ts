"use server";

import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit, 
  runTransaction,
  serverTimestamp 
} from "firebase/firestore";
import { PromoCode, PromoRedemption, UserProfile } from "@/lib/schema";
import { logAuditAction } from "@/lib/audit";

/**
 * Creates a new promo code.
 * Restricted to Owner/Admin on the caller side.
 */
export async function createPromoCodeAction(args: Partial<PromoCode>, creatorUID: string, creatorName: string) {
  try {
    const promoRef = collection(db, "promo_codes");
    const normalized = (args.code || "").toUpperCase();
    
    // Check if code already exists
    const q = query(promoRef, where("normalizedCode", "==", normalized));
    const snap = await getDocs(q);
    if (!snap.empty) throw new Error("Promo code already exists.");

    const newPromo: PromoCode = {
      code: args.code!,
      normalizedCode: normalized,
      status: "active",
      accessType: args.accessType || "PLAN",
      targetPlan: args.targetPlan,
      targetFeatures: args.targetFeatures || [],
      durationType: args.durationType || "30_days",
      durationDays: args.durationDays || 30,
      isUnlimitedDuration: args.isUnlimitedDuration || false,
      startsAt: args.startsAt || new Date().toISOString(),
      expiresAt: args.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      maxRedemptions: args.maxRedemptions || 100,
      redemptionCount: 0,
      perUserLimit: args.perUserLimit || 1,
      notes: args.notes,
      createdByUID: creatorUID,
      updatedByUID: creatorUID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(promoRef, newPromo);
    
    await logAuditAction(
      creatorUID, 
      creatorName, 
      "owner", 
      "PROMO_CREATED", 
      `Created promo code: ${normalized}`,
      "PROMO",
      docRef.id
    );

    return { success: true, id: docRef.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

/**
 * Redeems a promo code for a user.
 */
export async function redeemPromoCodeAction(code: string, userUID: string, userName: string) {
  try {
    const normalized = code.trim().toUpperCase();
    
    return await runTransaction(db, async (transaction) => {
      // 1. Fetch the Promo Code
      const promoQuery = query(collection(db, "promo_codes"), where("normalizedCode", "==", normalized), limit(1));
      const promoSnap = await getDocs(promoQuery); // Note: Transaction constraints on query are tricky in JS SDK for Web, but this is server-side.
      
      if (promoSnap.empty) throw new Error("Invalid promo code.");
      
      const promoDoc = promoSnap.docs[0];
      const promo = { id: promoDoc.id, ...promoDoc.data() } as PromoCode;

      // 2. Validate Status
      if (promo.status !== "active") throw new Error("Promo code is no longer active.");
      
      const now = new Date();
      if (now < new Date(promo.startsAt)) throw new Error("Promo code is not yet active.");
      if (now > new Date(promo.expiresAt)) throw new Error("Promo code has expired.");

      // 3. Check Limits
      if (promo.redemptionCount >= promo.maxRedemptions) throw new Error("Maximum redemptions reached for this code.");

      // 4. Check Per-User Limit
      const redemptionsQuery = query(
        collection(db, "promo_redemptions"),
        where("promoCodeId", "==", promo.id),
        where("redeemedByUID", "==", userUID)
      );
      const userRedemptions = await getDocs(redemptionsQuery);
      if (userRedemptions.size >= promo.perUserLimit) throw new Error("You have already used this promo code.");

      // 5. Calculate Duration
      let endsAt: string | null = null;
      if (!promo.isUnlimitedDuration) {
        const durationMap = { "7_days": 7, "14_days": 14, "30_days": 30, "unlimited": 0 };
        const days = promo.durationDays || durationMap[promo.durationType as keyof typeof durationMap] || 30;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        endsAt = endDate.toISOString();
      }

      // 6. Create Redemption Record
      const redemptionRef = doc(collection(db, "promo_redemptions"));
      const redemption: PromoRedemption = {
        promoCodeId: promo.id!,
        code: normalized,
        redeemedByUID: userUID,
        redeemedAt: now.toISOString(),
        grantedPlan: promo.targetPlan || "premium",
        grantedFeatures: promo.targetFeatures || [],
        startsAt: now.toISOString(),
        endsAt: endsAt,
        status: "active",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      transaction.set(redemptionRef, redemption);

      // 7. Increment Redemption Count
      transaction.update(promoDoc.ref, { 
        redemptionCount: promo.redemptionCount + 1,
        updatedAt: now.toISOString() 
      });

      // 8. Update User Profile
      const profileRef = doc(db, "profiles", userUID);
      transaction.update(profileRef, {
        subscriptionPlan: promo.targetPlan || "premium",
        subscriptionStatus: "active_promo",
        updatedAt: now.toISOString()
      });

      return { success: true, grantedPlan: promo.targetPlan };
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    console.error("Redemption Error:", err);
    return { success: false, error: errorMessage };
  }
}
