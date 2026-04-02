import { db } from "@/lib/firebase-admin";
import { stripe } from "./stripe";
import { UserProfile } from "./schema";

export async function updateSubscription(
  subscriptionId: string,
  uid: string
) {
  // Use any to avoid the Response<Subscription> vs Subscription type confusion in this version
  const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  
  const planId = subscription.items.data[0].plan.id;
  let planName: "free" | "premium" | "pro" = "free";
  
  // Mapping Stripe Price IDs to internal plan names
  // Mapping Stripe Price IDs to internal plan names
  if (process.env.STRIPE_PREMIUM_PRICE_ID && planId === process.env.STRIPE_PREMIUM_PRICE_ID) planName = "premium";
  else if (process.env.STRIPE_PRO_PRICE_ID && planId === process.env.STRIPE_PRO_PRICE_ID) planName = "pro";
  else {
    console.warn(`[SubscriptionSync] Unmapped planId: ${planId}. Defaulting to free.`);
  }

  const updateData: Partial<UserProfile> = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: planId,
    subscriptionPlan: planName,
    subscriptionStatus: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtEnd: subscription.cancel_at_period_end,
    updatedAt: new Date().toISOString(),
  };

  // Perform Firestore update via Admin SDK
  const userRef = db.collection("profiles").doc(uid);
  await userRef.update(updateData);
  
  console.log(`[SubscriptionSync] Updated user ${uid} to plan ${planName}`);
}

export async function cancelSubscription(uid: string) {
  const userRef = db.collection("profiles").doc(uid);
  await userRef.update({
    subscriptionPlan: "free",
    subscriptionStatus: "canceled",
    updatedAt: new Date().toISOString(),
  });
}
