import { User } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfileSchema } from "@/lib/schema";
import { logAuditAction } from "@/lib/audit";

export async function ensureUserProfile(user: User, role: "personal" | "pro" = "personal", name?: string) {
  const profileRef = doc(db, "profiles", user.uid);
  console.log(`[Bootstrap] Checking profile for user: ${user.uid} (${user.email})`);
  
  try {
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      const existingData = profileSnap.data();
      console.log(`[Bootstrap] Profile exists for role: ${existingData.role}. Skipping creation.`);
      return existingData;
    }
    } catch (error: unknown) {
      const isError = error instanceof Error;
      const errorCode = isError && "code" in error ? (error as { code: string }).code : "";
      const errorMessage = isError ? error.message : "";

      // If the error is due to being offline or unavailable, log it and proceed to update/create
      const isOffline = errorCode === 'unavailable' || errorMessage.toLowerCase().includes('offline');
      if (isOffline) {
        console.warn("[Bootstrap] Firestore is reporting as offline. Attempting background synchronization.", error);
      } else {
        // Re-throw if it's a real permission issue or other error
        console.error("[Bootstrap] Error fetching user profile:", error);
        throw error;
      }
    }

  // Create profile in Firestore
  const profileData = {
    id: user.uid,
    name: name || user.displayName || "User",
    email: user.email || "",
    role: role, // Default to personal for new users
    status: "Active" as const,
    isPartner: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    console.log(`[Bootstrap] Creating new profile for role: ${role}`);
    
    // Validate with Zod before write
    UserProfileSchema.parse(profileData);

    // Use merge: true to avoid overwriting existing fields (safety measure)
    await setDoc(profileRef, profileData, { merge: true });
    console.log("[Bootstrap] Profile successfully persisted to Firestore.");

    // Audit Log for Sign up
    await logAuditAction(
      user.uid,
      profileData.name,
      role,
      "SIGN_UP",
      `New account registered as ${role} (Google Auth Bootstrap)`,
      "USER",
      user.uid
    );
    console.log("[Bootstrap] Audit log entry created.");

    // Handle Referral Attribution
    const refUID = typeof window !== "undefined" ? sessionStorage.getItem("fico_geek_ref") : null;

    if (refUID) {
      try {
        console.log(`[Bootstrap] Processing referral attribution for partner: ${refUID}`);
        const referralId = `${refUID}_${user.uid}`;
        await setDoc(doc(db, "referrals", referralId), {
          partnerUID: refUID,
          referredUserUID: user.uid,
          status: "Signup",
          revenueGenerated: 0,
          commissionEarned: 0,
          createdAt: new Date().toISOString()
        }, { merge: true });

        // Increment signup counter for partner
        const partnerRef = doc(db, "partners", refUID);
        await updateDoc(partnerRef, {
          totalSignups: increment(1)
        });

        // Clear attribution pulses
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("fico_geek_ref");
          sessionStorage.removeItem("fico_geek_coupon");
        }
        console.log("[Bootstrap] Referral attribution completed.");
      } catch (e) {
        console.error("[Bootstrap] Referral attribution failed:", e);
      }
    }
  } catch (error) {
    console.error("[Bootstrap] Critical failure during profile creation:", error);
    throw error;
  }

  return profileData;
}
