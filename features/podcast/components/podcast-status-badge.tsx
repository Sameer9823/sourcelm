import { cn } from "@/lib/utils";
import type { PodcastStatus } from "../lib/types";

const LABELS: Record<PodcastStatus, string> = {
    PENDING: "Queued",
    GENERATING: "Generating",
    READY: "Ready",
    FAILED: "Failed",
};

const STYLES: Record<PodcastStatus, string> = {
    PENDING: "bg-muted text-muted-foreground",
    GENERATING: "bg-primary/15 text-primary",
    READY: "bg-leaf/15 text-leaf",
    FAILED: "bg-destructive/15 text-destructive",
};

export function PodcastStatusBadge({ status }: { status: PodcastStatus }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                STYLES[status],
            )}
        >
            {status === "GENERATING" ? (
                <span className="size-1.5 animate-pulse rounded-full bg-current" />
            ) : null}
            {LABELS[status]}
        </span>
    );
}
