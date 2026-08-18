"use client";

import Link from "next/link";
import { DropletIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { billingRoutes } from "../lib/routes";
import { useCredits } from "../hooks/use-billing";

export function CreditBadge() {
    const { data, isLoading } = useCredits();

    if (isLoading) {
        return <Skeleton className="h-7 w-20 rounded-full" />;
    }

    const balance = data?.balance ?? 0;
    const low = balance <= 10;

    return (
        <Link
            href={billingRoutes.billing}
            className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
            title="View credits & billing"
        >
            <DropletIcon
                className={low ? "size-3.5 text-destructive" : "size-3.5 text-primary"}
                fill="currentColor"
                fillOpacity={0.15}
            />
            <span className="font-ledger">{balance.toLocaleString()}</span>
            <span className="hidden text-muted-foreground sm:inline">
                credits
            </span>
        </Link>
    );
}
