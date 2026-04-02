import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type AuditAction = 
  | "LOGIN"
  | "SIGN_UP"
  | "PASSWORD_RESET"
  | "FILE_UPLOAD"
  | "FILE_ARCHIVE"
  | "FILE_DELETE"
  | "DISPUTE_CREATED"
  | "DISPUTE_EDITED"
  | "DISPUTE_STATUS_CHANGE"
  | "LETTER_GENERATED"
  | "LETTER_EXPORT"
  | "CLIENT_CREATED"
  | "CLIENT_EDITED"
  | "ADMIN_MODERATION"
  | "SENSITIVE_RECORD_UPDATE"
  | "PROMO_CREATED"
  | "PROMO_EDITED"
  | "PROMO_REDEEMED"
  | "PROMO_REVOKED"
  | "ROLE_ASSIGNED"
  | "BILLING_SUBSCRIPTION_CREATED"
  | "BILLING_PORTAL_SESSION"

  | "ONBOARDING_STARTED"
  | "ONBOARDING_STEP_COMPLETED"
  | "ONBOARDING_COMPLETED";

export const logAuditAction = async (
  userId: string,
  userName: string,
  userRole: string,
  action: AuditAction,
  summary: string,
  targetType?: string,
  targetId?: string,
  metadata?: any
) => {
  try {
    await addDoc(collection(db, "audit_logs"), {
      actorUID: userId,
      actorName: userName,
      actorRole: userRole,
      action,
      summary,
      targetType: targetType || "N/A",
      targetId: targetId || "N/A",
      metadata: metadata || {},
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Audit Log Error:", err);
  }
};
