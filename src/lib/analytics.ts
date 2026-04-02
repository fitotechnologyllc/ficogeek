import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type AnalyticsEvent = 
  | "onboarding_start"
  | "onboarding_complete"
  | "ai_intake_start"
  | "ai_intake_progress"
  | "ai_intake_complete"
  | "paywall_view"
  | "upgrade_click"
  | "billing_success"
  | "letter_preview_view"
  | "letter_export_click";

export async function logAnalyticsEvent(
  uid: string, 
  event: AnalyticsEvent, 
  metadata: Record<string, unknown> = {}
) {
  try {
    await addDoc(collection(db, "analytics_events"), {
      uid,
      event,
      metadata,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to log analytics event:", error);
  }
}
