import { stripe } from "@/lib/stripe";
import { updateSubscription } from "@/lib/stripe-actions";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      console.warn("[StripeWebhook] Missing signature or secret.");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`[StripeWebhook] Error verifying webhook: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  console.log(`[StripeWebhook] Received event type: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.firebaseUID;
        const subscriptionId = session.subscription as string;

        if (uid && subscriptionId) {
          await updateSubscription(subscriptionId, uid);
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = subscription.metadata?.firebaseUID;
        if (uid) {
          await updateSubscription(subscription.id, uid);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = subscription.metadata?.firebaseUID;
        if (uid) {
          await updateSubscription(subscription.id, uid);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[StripeWebhook] Payment failed for invoice ${invoice.id}`);
        break;
      }
      default:
        console.log(`[StripeWebhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`[StripeWebhook] Error processing event: ${errorMessage}`);
    return NextResponse.json({ error: `Processing failed: ${errorMessage}` }, { status: 500 });
  }
}
