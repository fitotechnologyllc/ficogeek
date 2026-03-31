"use server";

import { adminDb } from "@/lib/firebase-admin";
import { UserProfileSchema } from "@/lib/schema";
import { revalidatePath } from "next/cache";

export async function upgradeSubscriptionAction(userId: string, newPlan: "premium" | "pro") {
    // 1. Verify User Session (In a real app, use auth() from next-auth or firebase-admin)
    // For now, we assume userId is passed securely or validated via token
    
    const amountPaid = newPlan === "premium" ? 29 : newPlan === "pro" ? 99 : 0;
    
    try {
        await adminDb.runTransaction(async (transaction) => {
            const userRef = adminDb.collection("profiles").doc(userId);
            const userDoc = await transaction.get(userRef);
            
            if (!userDoc.exists) throw new Error("User not found");
            
            // 1. Update user profile plan
            transaction.update(userRef, {
                subscriptionPlan: newPlan,
                updatedAt: new Date().toISOString()
            });

            // 2. Handle Referral Logic
            const referralSnap = await adminDb.collection("referrals")
                .where("referredUserUID", "==", userId)
                .limit(1)
                .get();

            if (!referralSnap.empty && amountPaid > 0) {
                const referralDoc = referralSnap.docs[0];
                const partnerUID = referralDoc.data().partnerUID;
                const partnerRef = adminDb.collection("partners").doc(partnerUID);
                const partnerDoc = await transaction.get(partnerRef);

                if (partnerDoc.exists) {
                    const partnerData = partnerDoc.data();
                    const commissionAmount = (amountPaid * (partnerData?.commissionRate || 20) / 100);

                    // Record Commission
                    const commissionId = `com_${Date.now()}`;
                    const commissionRef = adminDb.collection("commissions").doc(commissionId);
                    transaction.set(commissionRef, {
                        id: commissionId,
                        partnerUID,
                        referredUserUID: userId,
                        transactionId: `txn_server_${Date.now()}`,
                        amount: amountPaid,
                        commissionAmount,
                        status: "Approved",
                        createdAt: new Date().toISOString()
                    });

                    // Update Partner Totals
                    transaction.update(partnerRef, {
                        totalRevenue: admin.firestore.FieldValue.increment(amountPaid),
                        totalEarnings: admin.firestore.FieldValue.increment(commissionAmount),
                        unpaidEarnings: admin.firestore.FieldValue.increment(commissionAmount)
                    });

                    // Update Referral Status
                    transaction.update(referralDoc.ref, {
                        status: "Converted",
                        revenueGenerated: admin.firestore.FieldValue.increment(amountPaid),
                        commissionEarned: admin.firestore.FieldValue.increment(commissionAmount)
                    });
                }
            }
        });

        revalidatePath("/dashboard/settings/billing");
        return { success: true };
    } catch (error: any) {
        console.error("Subscription Upgrade Server Error:", error);
        return { success: false, error: error.message };
    }
}

// Helper import for increment
import * as admin from "firebase-admin";
