import { apiFetch } from "@/shared/lib/api";

export type CreditTransaction = {
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
};

export type CreditsResponse = {
    balance: number;
    transactions: CreditTransaction[];
};

export type BillingSummary = {
    balance: number;
    subscription: {
        planId: string;
        status: string;
        currentPeriodEnd: string;
        cancelAtPeriodEnd: boolean;
    } | null;
};

export function getCredits() {
    return apiFetch<CreditsResponse>("/api/credits");
}

export function getBillingSummary() {
    return apiFetch<BillingSummary>("/api/billing/summary");
}

export function createCheckout(input: {
    kind: "pack" | "subscription";
    id: string;
}) {
    return apiFetch<{ url: string }>("/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function openBillingPortal() {
    return apiFetch<{ url: string }>("/api/billing/portal", {
        method: "POST",
    });
}
