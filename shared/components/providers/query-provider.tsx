"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { ApiError } from "@/shared/lib/api";
import { toast } from "@/components/ui/toast";

/**
 * Every mutation in the app (create artifact, generate podcast, submit
 * review, buy credits, ...) goes through this single handler on failure.
 * Without this, a rejected mutation just vanishes as a console-only
 * "unhandledRejection" — the user sees nothing and has no idea their action
 * didn't work. `ApiError.message` already carries the server's real
 * validation message (e.g. "No ready sources found..."), so we surface it
 * directly rather than a generic "Something went wrong".
 */
function handleMutationError(error: unknown) {
    const message =
        error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.";

    toast.add({
        type: "error",
        title: "Action failed",
        description: message,
    });
}

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                mutationCache: new MutationCache({
                    onError: handleMutationError,
                }),
            }),
    );
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default QueryProvider;
