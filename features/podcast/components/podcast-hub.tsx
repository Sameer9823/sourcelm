"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MicIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { podcastRoutes } from "../lib/routes";
import { useDeletePodcast, usePodcasts } from "../hooks/use-podcasts";
import { PodcastStatusBadge } from "./podcast-status-badge";
import { GeneratePodcastDialog } from "./generate-podcast-dialog";

function formatDuration(seconds: number | null) {
    if (!seconds) return null;
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
}

export function PodcastHub({ workspaceId }: { workspaceId: string }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { data: podcasts = [], isLoading, error } = usePodcasts(workspaceId);
    const deletePodcast = useDeletePodcast(workspaceId);

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <MicIcon className="size-5" />
                        <h2 className="font-heading text-xl font-semibold">
                            Podcast
                        </h2>
                    </div>
                    <p className="max-w-xl text-sm text-muted-foreground">
                        Two AI hosts turn your sources into a spoken deep
                        dive — pick a single source, a few, or everything in
                        the workspace.
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <PlusIcon />
                    Generate episode
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Could not load episodes.
                </div>
            ) : podcasts.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-10 text-center">
                    <p className="font-medium">No episodes yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Generate your first deep-dive episode from a source
                        or your whole workspace.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {podcasts.map((podcast) => (
                        <div
                            key={podcast.id}
                            className="group relative flex flex-col gap-3 rounded-3xl border bg-card p-5"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <PodcastStatusBadge status={podcast.status} />
                                <button
                                    type="button"
                                    onClick={() =>
                                        deletePodcast.mutate(podcast.id)
                                    }
                                    className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                                    aria-label="Delete episode"
                                >
                                    <Trash2Icon className="size-4" />
                                </button>
                            </div>

                            <Link
                                href={podcastRoutes.detail(
                                    workspaceId,
                                    podcast.id,
                                )}
                                className="flex-1"
                            >
                                <p className="font-heading font-semibold leading-snug">
                                    {podcast.title}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {podcast.sourceIds.length}{" "}
                                    {podcast.sourceIds.length === 1
                                        ? "source"
                                        : "sources"}
                                    {formatDuration(podcast.durationSeconds)
                                        ? ` · ${formatDuration(podcast.durationSeconds)}`
                                        : ""}
                                </p>
                            </Link>

                            <p className="font-ledger text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                    new Date(podcast.createdAt),
                                    { addSuffix: true },
                                )}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <GeneratePodcastDialog
                workspaceId={workspaceId}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}
