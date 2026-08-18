/**
 * Single source of truth for all credit economics.
 *
 * Keep this file the only place that defines "how many credits does X cost /
 * grant" so pricing changes never require touching route handlers.
 */

/** Credits given automatically on account creation. */
export const SIGNUP_BONUS_CREDITS = 50;

/** Cost in credits for each metered action. Tune freely. */
export const CREDIT_COSTS = {
    /** One assistant chat turn (RAG retrieval + generation). */
    CHAT_MESSAGE: 1,
    /** Ingesting one source (PDF/website/YouTube/text) incl. embedding. */
    SOURCE_INGEST: 3,
    /** Generating one learning artifact (summary, quiz, flashcards, etc). */
    ARTIFACT_GENERATE: 5,
    /** Generating one two-host AI podcast (script + text-to-speech per segment). */
    PODCAST_GENERATE: 15,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

function getRequiredEnvVar(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(
            `Missing required environment variable: ${name}. ` +
            `This must be set for billing to work correctly.`,
        );
    }
    return value;
}

/** One-time top-up packs, sold via Stripe Checkout (mode: "payment"). */
export const CREDIT_PACKS = [
    {
        id: "pack_starter",
        name: "Starter Pack",
        credits: 200,
        priceUsd: 5,
        stripePriceId: getRequiredEnvVar("STRIPE_PRICE_PACK_STARTER"),
    },
    {
        id: "pack_pro",
        name: "Pro Pack",
        credits: 550,
        priceUsd: 12,
        stripePriceId: getRequiredEnvVar("STRIPE_PRICE_PACK_PRO"),
        badge: "Best value",
    },
    {
        id: "pack_power",
        name: "Power Pack",
        credits: 1500,
        priceUsd: 29,
        stripePriceId: getRequiredEnvVar("STRIPE_PRICE_PACK_POWER"),
    },
] as const;

/** Recurring monthly plans, sold via Stripe Checkout (mode: "subscription"). */
export const SUBSCRIPTION_PLANS = [
    {
        id: "plan_plus",
        name: "Plus",
        monthlyCredits: 1000,
        priceUsd: 15,
        stripePriceId: getRequiredEnvVar("STRIPE_PRICE_PLAN_PLUS"),
        blurb: "For regular research & study sessions",
    },
    {
        id: "plan_pro",
        name: "Pro",
        monthlyCredits: 3500,
        priceUsd: 39,
        stripePriceId: getRequiredEnvVar("STRIPE_PRICE_PLAN_PRO"),
        blurb: "For heavy daily use across many workspaces",
        badge: "Most popular",
    },
] as const;

export function findPackByPriceId(stripePriceId: string) {
    return CREDIT_PACKS.find((p) => p.stripePriceId === stripePriceId);
}

export function findPlanByPriceId(stripePriceId: string) {
    return SUBSCRIPTION_PLANS.find((p) => p.stripePriceId === stripePriceId);
}
