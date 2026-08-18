"use client";

import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Mirrors src/server/lib/credits-config.ts display fields (name, credits,
 * priceUsd, badge). Kept as plain display data here — client components
 * shouldn't import server-only config — but the numbers should stay in sync
 * whenever pricing changes.
 */
export const CREDIT_PACKS_DISPLAY = [
    {
        id: "pack_starter",
        name: "Starter Pack",
        credits: 200,
        priceUsd: 5,
        badge: undefined,
    },
    {
        id: "pack_pro",
        name: "Pro Pack",
        credits: 550,
        priceUsd: 12,
        badge: "Best value",
    },
    {
        id: "pack_power",
        name: "Power Pack",
        credits: 1500,
        priceUsd: 29,
        badge: undefined,
    },
] as const;

export const SUBSCRIPTION_PLANS_DISPLAY = [
    {
        id: "plan_plus",
        name: "Plus",
        monthlyCredits: 1000,
        priceUsd: 15,
        blurb: "For regular research & study sessions",
        badge: undefined,
        features: [
            "1,000 credits every month",
            "Unlimited workspaces",
            "Priority chat generation",
        ],
    },
    {
        id: "plan_pro",
        name: "Pro",
        monthlyCredits: 3500,
        priceUsd: 39,
        blurb: "For heavy daily use across many workspaces",
        badge: "Most popular",
        features: [
            "3,500 credits every month",
            "Unlimited workspaces",
            "Priority chat generation",
            "Early access to new artifact types",
        ],
    },
] as const;

type PricingSectionProps = {
    onSelectPack?: (packId: string) => void;
    onSelectPlan?: (planId: string) => void;
    pending?: string | null;
};

export function PricingSection({
    onSelectPack,
    onSelectPlan,
    pending,
}: PricingSectionProps) {
    return (
        <div className="space-y-12">
            <div>
                <div className="mb-5 flex items-baseline justify-between gap-4">
                    <h3 className="font-heading text-xl font-semibold">
                        Monthly plans
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Credits refresh automatically each billing cycle
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {SUBSCRIPTION_PLANS_DISPLAY.map((plan) => (
                        <div
                            key={plan.id}
                            className={cn(
                                "relative flex flex-col gap-4 rounded-xl border bg-card p-6",
                                plan.badge && "border-primary/50 shadow-sm",
                            )}
                        >
                            {plan.badge ? (
                                <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                                    {plan.badge}
                                </span>
                            ) : null}
                            <div>
                                <p className="font-heading text-lg font-semibold">
                                    {plan.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {plan.blurb}
                                </p>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="font-ledger text-3xl font-semibold">
                                    ${plan.priceUsd}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    /month
                                </span>
                            </div>
                            <ul className="flex-1 space-y-2 text-sm">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2"
                                    >
                                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-leaf" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button
                                nativeButton
                                onClick={() => onSelectPlan?.(plan.id)}
                                disabled={pending === plan.id}
                                variant={plan.badge ? "default" : "outline"}
                            >
                                {pending === plan.id
                                    ? "Redirecting…"
                                    : `Subscribe to ${plan.name}`}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="mb-5 flex items-baseline justify-between gap-4">
                    <h3 className="font-heading text-xl font-semibold">
                        One-time top-ups
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Credits never expire
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    {CREDIT_PACKS_DISPLAY.map((pack) => (
                        <div
                            key={pack.id}
                            className={cn(
                                "relative flex flex-col gap-3 rounded-xl border bg-card p-5",
                                pack.badge && "border-primary/50",
                            )}
                        >
                            {pack.badge ? (
                                <span className="absolute -top-3 left-5 rounded-full bg-leaf px-2.5 py-0.5 text-xs font-medium text-leaf-foreground">
                                    {pack.badge}
                                </span>
                            ) : null}
                            <p className="font-heading text-base font-semibold">
                                {pack.name}
                            </p>
                            <p className="font-ledger text-2xl font-semibold">
                                {pack.credits.toLocaleString()}
                                <span className="ml-1 text-sm font-normal text-muted-foreground">
                                    credits
                                </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                ${pack.priceUsd} one-time
                            </p>
                            <Button
                                nativeButton
                                variant="outline"
                                onClick={() => onSelectPack?.(pack.id)}
                                disabled={pending === pack.id}
                            >
                                {pending === pack.id
                                    ? "Redirecting…"
                                    : "Buy credits"}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
