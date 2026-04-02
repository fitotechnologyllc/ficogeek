import { FieldValue, Timestamp } from "firebase/firestore";
import { z } from "zod";

export type UserRole = "personal" | "pro" | "admin" | "owner";
export type AccountType = "customer" | "internal";
export type PromoDuration = "7_days" | "14_days" | "30_days" | "unlimited";
export type PromoStatus = "active" | "inactive" | "archived" | "expired";
export type RedemptionStatus = "active" | "expired" | "revoked";

// --- ZOD SCHEMAS FOR VALIDATION ---

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["personal", "pro", "admin", "owner"]),
  status: z.enum(["Active", "Suspended"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  subscriptionPlan: z.enum(["free", "premium", "pro", "owner_unlimited"]).optional(),
  subscriptionStatus: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  stripePriceId: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
  cancelAtEnd: z.boolean().optional(),

  photoURL: z.string().optional(),
  accountType: z.enum(["customer", "internal"]).optional(),
  billingBypass: z.boolean().optional(),
  usageBypass: z.boolean().optional(),
  isPartner: z.boolean().optional(),
  onboardingStatus: z.enum(["pending", "completed"]).default("pending"),
  onboardingCurrentStep: z.string().optional(),
  onboardingStartedAt: z.string().optional(),
  onboardingCompletedAt: z.string().optional(),
  firstLetterGeneratedAt: z.string().optional(),
  firstAiSessionAt: z.string().optional(),
});

export const DisputeSchema = z.object({
  ownerUID: z.string(),
  clientId: z.string().optional(),
  accountName: z.string().min(1),
  accountNumber: z.string().min(1),
  bureau: z.enum(["Experian", "Equifax", "TransUnion"]),
  type: z.string().min(1),
  reason: z.string().min(1),
  notes: z.string().optional(),
  status: z.string(),
  lastUpdatedBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ClientSchema = z.object({
  proUID: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  status: z.enum(["Prospect", "Active", "Inactive"]),
  onboardingStatus: z.enum(["Pending", "Complete"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const LetterSchema = z.object({
  ownerUID: z.string(),
  clientId: z.string().optional(),
  disputeId: z.string(),
  templateId: z.string(),
  type: z.string(),
  content: z.string().min(10),
  bureau: z.string(),
  status: z.enum(["Draft", "Final", "Sent", "Archived"]),
  version: z.number(),
  metadata: z.object({
    recipient: z.string(),
    address: z.string(),
    date: z.string(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AIConversationSchema = z.object({
  ownerUID: z.string(),
  title: z.string().optional(),
  status: z.enum(["active", "archived"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AIMessageSchema = z.object({
  conversationId: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  createdAt: z.string(),
});

export const AIDisputeIntakeSchema = z.object({
  ownerUID: z.string(),
  clientId: z.string().optional(), // For Pros
  conversationId: z.string(),
  status: z.enum(["draft", "completed"]),
  data: z.object({
    fullName: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    bureaus: z.array(z.string()).optional(),
    itemType: z.string().optional(),
    creditorName: z.string().optional(),
    accountNumber: z.string().optional(),
    isMasked: z.boolean().default(true),
    reason: z.string().optional(),
    resolution: z.string().optional(),
    dates: z.string().optional(),
    hasDocuments: z.boolean().default(false),
    documentNotes: z.string().optional(),
  }),
  completionPercent: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AIKnowledgeSchema = z.object({
  category: z.string(),
  question: z.string(),
  answer: z.string(),
  tags: z.array(z.string()).optional(),
  lastUpdated: z.string(),
});

// --- INTERFACES (Derived or Manual) ---

export interface UserProfile extends z.infer<typeof UserProfileSchema> {}

export interface PartnerProfile {
  uid: string;
  referralId: string;
  status: "Active" | "Pending" | "Disabled";
  commissionRate: number;
  totalClicks: number;
  totalSignups: number;
  totalRevenue: number;
  totalEarnings: number;
  unpaidEarnings: number;
  payoutMethod?: {
    type: string;
    details: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Referral {
  id: string;
  partnerUID: string;
  referredUserUID: string;
  status: "Signup" | "Converted";
  revenueGenerated: number;
  commissionEarned: number;
  createdAt: string;
}

export interface ReferralClick {
  id: string;
  partnerUID: string;
  referralId: string;
  ipHash?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Commission {
  id: string;
  partnerUID: string;
  referredUserUID: string;
  transactionId: string;
  amount: number;
  commissionAmount: number;
  status: "Pending" | "Approved" | "Paid" | "Rejected";
  createdAt: string;
}

export interface Payout {
  id: string;
  partnerUID: string;
  amount: number;
  status: "Pending" | "Processing" | "Paid" | "Failed";
  method: string;
  requestedAt: string;
  processedAt?: string;
}

export interface CouponCode {
  code: string;
  partnerUID: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  usageCount: number;
  totalRevenue: number;
  active: boolean;
  createdAt: string;
}

export interface PromoCode {
  id?: string;
  code: string; // The user-facing code (e.g. SAVE100)
  normalizedCode: string; // uppercase for quick search
  status: PromoStatus;
  accessType: "PLAN" | "FEATURE_BUNDLE";
  targetPlan?: "premium" | "pro";
  targetFeatures?: string[];
  durationType: PromoDuration;
  durationDays?: number;
  isUnlimitedDuration: boolean;
  startsAt: string;
  expiresAt: string;
  maxRedemptions: number;
  redemptionCount: number;
  perUserLimit: number;
  notes?: string;
  createdByUID: string;
  updatedByUID: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoRedemption {
  id?: string;
  promoCodeId: string;
  code: string;
  redeemedByUID: string;
  redeemedAt: string;
  grantedPlan: string;
  grantedFeatures: string[];
  startsAt: string;
  endsAt: string | null; // null if unlimited
  status: RedemptionStatus;
  createdAt: string;
  updatedAt: string;
}

export type DisputeStatus = 
  | "Draft" 
  | "In Review" 
  | "Ready to Generate" 
  | "Generated" 
  | "Sent" 
  | "Waiting Response" 
  | "Needs Follow Up" 
  | "Updated" 
  | "Resolved" 
  | "Closed" 
  | "Archived";

export interface Dispute extends z.infer<typeof DisputeSchema> {
  id?: string;
  status: DisputeStatus;
}

export interface DisputeEvent {
  id?: string;
  disputeId: string;
  actorUID: string;
  type: "STATUS_CHANGE" | "NOTE_ADDED" | "DOCUMENT_LINKED" | "LETTER_GENERATED";
  summary: string;
  timestamp: string;
}

export interface LetterTemplate {
  id?: string;
  name: string;
  type: string;
  category: string;
  body: string;
  placeholders: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Letter extends z.infer<typeof LetterSchema> {
  id?: string;
  aiGenerated?: boolean;
  intakeId?: string;
  isDraft?: boolean;
  refinedByAI?: boolean;
}

export interface AIConversation extends z.infer<typeof AIConversationSchema> {
  id?: string;
}

export interface AIMessage extends z.infer<typeof AIMessageSchema> {
  id?: string;
}

export interface AIDisputeIntake extends z.infer<typeof AIDisputeIntakeSchema> {
  id?: string;
}

export interface AIKnowledge extends z.infer<typeof AIKnowledgeSchema> {
  id?: string;
}

export interface Client extends z.infer<typeof ClientSchema> {
  id?: string;
}

export interface AuditLog {
  id?: string;
  actorUID: string;
  actorName: string;
  actorRole: UserRole | string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  metadata: any;
  timestamp: FieldValue | Timestamp | string;
}
