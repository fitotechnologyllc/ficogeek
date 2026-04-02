import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { priceId, customerId, uid, email } = await req.json();
    let stripePriceId = priceId;

    // Mapping internal plan names to their price IDs
    if (priceId === "premium") {
      stripePriceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    } else if (priceId === "pro") {
      stripePriceId = process.env.STRIPE_PRO_PRICE_ID;
    }

    if (!stripePriceId || !uid || !email) {
      return NextResponse.json({ error: "Unauthorized or Invalid Plan" }, { status: 401 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId, // Correctly use the resolved stripePriceId (from env)
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/cancel`,
      metadata: {
        firebaseUID: uid,
      },
      subscription_data: {
        metadata: {
          firebaseUID: uid,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    console.error("[StripeCheckout] Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
