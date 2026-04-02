"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { logAuditAction } from "@/lib/audit";

/**
 * List of UIDs that are authorized to be owners.
 * In a real production app, these would come from an environment variable.
 */
const AUTHORIZED_OWNER_UIDS = [
  "hirma-authorized-id-placeholder", // Replace with actual user ID for the user
  "donholmes805-placeholder"
];

const ADMIN_SECRET = "FICO_GEEK_SOVEREIGN_2026"; // Simple secret for manual seeding if UIDs unknown

/**
 * Higher-level role assignment that can only be done by Owner or via Secret.
 */
export async function assignOwnerRoleAction(targetUID: string, secret?: string) {
  try {
    if (secret !== ADMIN_SECRET) {
      throw new Error("Unauthorized role assignment attempt.");
    }

    const profileRef = doc(db, "profiles", targetUID);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) throw new Error("User profile not found.");

    await updateDoc(profileRef, {
      role: "owner",
      accountType: "internal",
      subscriptionPlan: "owner_unlimited",
      subscriptionStatus: "active",
      billingBypass: true,
      usageBypass: true,
      updatedAt: new Date().toISOString()
    });

    await logAuditAction(
      "SYSTEM",
      "Sovereign Core",
      "system",
      "ROLE_ASSIGNED",
      `Assigned Owner role to UID: ${targetUID}`,
      "USER",
      targetUID
    );

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function isSeededOwner(uid: string) {
  return AUTHORIZED_OWNER_UIDS.includes(uid);
}
