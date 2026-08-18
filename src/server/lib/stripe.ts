import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    // Don't throw at import time in dev/build without keys configured yet;
    // any actual Stripe call will fail loudly and obviously instead.
    console.warn("STRIPE_SECRET_KEY is not set - billing routes will fail.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2025-08-27.basil",
});
