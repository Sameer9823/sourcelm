"use client";

import Link from "next/link";
import { FlameIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { reviewRoutes } from "../lib/routes";
import { useReviewStats } from "../hooks/use-review";

export function ReviewStreakBadge() {
    const { data, isLoading } = useReviewStats();

    if (isLoading) {
        return <Skeleton className="h-7 w-16 rounded-full" />;
    }

    if (!data || data.totalCards === 0) {
        // No flashcards generated yet anywhere — nothing to review, so stay quiet.
        return null;
    }

    const hasDue = data.dueCount > 0;

    return (
        <Link
            href={reviewRoutes.session}
            className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
            title={
                hasDue
                    ? `${data.dueCount} cards due for review`
                    : `${data.streak}-day review streak`
            }
        >
            <FlameIcon
                className={
                    data.streak > 0
                        ? "size-3.5 text-primary"
                        : "size-3.5 text-muted-foreground"
                }
                fill="currentColor"
                fillOpacity={data.streak > 0 ? 0.2 : 0}
            />
            <span className="font-ledger">{data.streak}</span>
            {hasDue ? (
                <span className="rounded-full bg-primary px-1.5 text-primary-foreground">
                    {data.dueCount}
                </span>
            ) : null}
        </Link>
    );
}
