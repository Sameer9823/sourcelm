import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/src/server/lib/stripe";
import {
    handleCheckoutCompleted,
    handleInvoicePaid,
    upsertSubscriptionFromStripe,
} from "@/src/server/services/billing.service";

// Stripe requires the raw, unparsed request body to verify the webhook
// signature, so this route must NOT use the shared withRoute/JSON helpers.
export async function POST(req: Request) {
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        return NextResponse.json(
            { error: "Missing signature or webhook secret" },
            { status: 400 },
        );
    }

    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            webhookSecret,
        );
    } catch (err) {
        console.error("Stripe webhook signature verification failed", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(
                    event.data.object as Stripe.Checkout.Session,
                    event.id,
                );
                break;
            case "invoice.paid":
                await handleInvoicePaid(
                    event.data.object as Stripe.Invoice,
                    event.id,
                );
                break;
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                await upsertSubscriptionFromStripe(
                    event.data.object as Stripe.Subscription,
                );
                break;
            default:
                break;
        }
    } catch (err) {
        console.error(`Error handling Stripe event ${event.type}`, err);
        // Return 200 anyway so Stripe doesn't hammer retries on a bug we've
        // already logged; alerting on the log line is the real fix path.
    }

    return NextResponse.json({ received: true });
}
