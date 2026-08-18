"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon, DropletIcon, ReceiptIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { workspaceRoutes } from "@/features/workspaces/lib/routes";
import { PricingSection } from "@/features/marketing/components/pricing-section";
import {
    useBillingPortal,
    useBillingSummary,
    useCreateCheckout,
    useCredits,
} from "../hooks/use-billing";

const TRANSACTION_LABEL: Record<string, string> = {
    SIGNUP_BONUS: "Welcome bonus",
    PURCHASE: "Purchase",
    SUBSCRIPTION_GRANT: "Subscription renewal",
    USAGE: "Usage",
    REFUND: "Refund",
    ADJUSTMENT: "Adjustment",
};

export function BillingPageClient() {
    const searchParams = useSearchParams();
    const checkoutStatus = searchParams.get("checkout");

    const { data: credits, isLoading: creditsLoading } = useCredits();
    const { data: summary } = useBillingSummary();
    const checkout = useCreateCheckout();
    const portal = useBillingPortal();

    return (
        <div className="min-h-svh bg-muted/30">
            <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 md:px-8">
                    <Button
                        nativeButton={false}
                        variant="ghost"
                        size="icon-sm"
                        render={<Link href={workspaceRoutes.list} />}
                    >
                        <ArrowLeftIcon />
                    </Button>
                    <h1 className="font-heading text-base font-semibold">
                        Credits &amp; billing
                    </h1>
                </div>
            </header>

            <main className="mx-auto max-w-5xl space-y-12 px-4 py-10 md:px-8">
                {checkoutStatus === "success" ? (
                    <div className="rounded-lg border border-leaf/40 bg-leaf/10 px-4 py-3 text-sm text-leaf">
                        Payment received — your credits have been added.
                    </div>
                ) : checkoutStatus === "cancelled" ? (
                    <div className="rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground">
                        Checkout was cancelled. No charge was made.
                    </div>
                ) : null}

                <section className="grid gap-4 sm:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-xl border bg-card p-6">
                        <p className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <DropletIcon className="size-4 text-primary" />
                            Current balance
                        </p>
                        {creditsLoading ? (
                            <Skeleton className="h-10 w-32" />
                        ) : (
                            <p className="font-ledger text-4xl font-semibold">
                                {(credits?.balance ?? 0).toLocaleString()}
                                <span className="ml-2 text-base font-normal text-muted-foreground">
                                    credits
                                </span>
                            </p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                            Chat messages cost 1 credit, source uploads cost 3,
                            and generated artifacts cost 5.
                        </p>
                    </div>

                    <div className="flex flex-col justify-between rounded-xl border bg-card p-6">
                        <div>
                            <p className="mb-1 text-sm text-muted-foreground">
                                Subscription
                            </p>
                            <p className="font-heading text-lg font-semibold">
                                {summary?.subscription
                                    ? summary.subscription.status
                                    : "None"}
                            </p>
                        </div>
                        {summary?.subscription ? (
                            <Button
                                nativeButton
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => portal.mutate()}
                                disabled={portal.isPending}
                            >
                                {portal.isPending
                                    ? "Opening…"
                                    : "Manage subscription"}
                            </Button>
                        ) : (
                            <p className="mt-4 text-xs text-muted-foreground">
                                Subscribe below for monthly credits at a
                                discount.
                            </p>
                        )}
                    </div>
                </section>

                <section>
                    <PricingSection
                        pending={checkout.isPending ? checkout.variables?.id ?? null : null}
                        onSelectPack={(id) =>
                            checkout.mutate({ kind: "pack", id })
                        }
                        onSelectPlan={(id) =>
                            checkout.mutate({ kind: "subscription", id })
                        }
                    />
                </section>

                <section>
                    <h3 className="mb-4 flex items-center gap-1.5 font-heading text-xl font-semibold">
                        <ReceiptIcon className="size-4.5" />
                        History
                    </h3>
                    <div className="overflow-hidden rounded-xl border bg-card">
                        {!credits || credits.transactions.length === 0 ? (
                            <p className="p-6 text-sm text-muted-foreground">
                                No credit activity yet.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {credits.transactions.map((tx) => (
                                    <li
                                        key={tx.id}
                                        className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {tx.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {TRANSACTION_LABEL[tx.type] ??
                                                    tx.type}{" "}
                                                &middot;{" "}
                                                {new Date(
                                                    tx.createdAt,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    },
                                                )}
                                            </p>
                                        </div>
                                        <span
                                            className={
                                                tx.amount >= 0
                                                    ? "font-ledger text-leaf"
                                                    : "font-ledger text-muted-foreground"
                                            }
                                        >
                                            {tx.amount >= 0 ? "+" : ""}
                                            {tx.amount}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
