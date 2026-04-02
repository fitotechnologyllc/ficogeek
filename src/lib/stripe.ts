import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[Stripe] Warning: STRIPE_SECRET_KEY is not defined in environment variables.");
}

// Initialize Stripe with strict error handling for production readiness
if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === "production") {
  throw new Error("STRIPE_SECRET_KEY is missing. Billing cannot be initialized.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any,
  typescript: true,
});

/**
 * Stripe Price IDs for the FICO Geek plans.
 */
export const STRIPE_PLANS = {
  PREMIUM_MONTHLY: process.env.STRIPE_PREMIUM_PRICE_ID || "price_premium_placeholder",
  PRO_MONTHLY: process.env.STRIPE_PRO_PRICE_ID || "price_pro_placeholder",
};

/**
 * Returns the Stripe Customer ID for a user.
 * If the customer doesn't exist, it creates one.
 */
export async function getOrCreateStripeCustomer(uid: string, email: string, name?: string) {
  const existing = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  const customer = await stripe.customers.create({
    email,
    name: name || email,
    metadata: {
      firebaseUID: uid,
    },
  });

  return customer.id;
}
