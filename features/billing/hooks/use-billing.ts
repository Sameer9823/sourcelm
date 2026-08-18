"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
    createCheckout,
    getBillingSummary,
    getCredits,
    openBillingPortal,
} from "../lib/api";

export function useCredits() {
    return useQuery({
        queryKey: ["credits"],
        queryFn: getCredits,
        // Chat/source/artifact actions spend credits from other parts of the
        // app, so keep this fairly fresh without hammering the API.
        staleTime: 15_000,
    });
}

export function useBillingSummary() {
    return useQuery({
        queryKey: ["billing", "summary"],
        queryFn: getBillingSummary,
    });
}

export function useCreateCheckout() {
    return useMutation({
        mutationFn: createCheckout,
        onSuccess: ({ url }) => {
            window.location.href = url;
        },
    });
}

export function useBillingPortal() {
    return useMutation({
        mutationFn: openBillingPortal,
        onSuccess: ({ url }) => {
            window.location.href = url;
        },
    });
}
