"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    ArrowLeftIcon,
    PauseIcon,
    PlayIcon,
    SkipBackIcon,
    SkipForwardIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { podcastRoutes } from "../lib/routes";
import { usePodcast } from "../hooks/use-podcasts";
import { PodcastStatusBadge } from "./podcast-status-badge";

const SPEAKER_LABEL = { HOST_A: "Host A", HOST_B: "Host B" } as const;

export function PodcastPlayer({
    workspaceId,
    podcastId,
}: {
    workspaceId: string;
    podcastId: string;
}) {
    const { data: podcast, isLoading } = usePodcast(workspaceId, podcastId);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const segments = podcast?.script ?? [];
    const active = segments[activeIndex];

    // Load the next segment's audio whenever the active index changes.
    useEffect(() => {
        if (!audioRef.current || !active) return;
        audioRef.current.src = active.audioUrl;
        if (isPlaying) {
            void audioRef.current.play();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIndex, active?.audioUrl]);

    function handleEnded() {
        if (activeIndex < segments.length - 1) {
            setActiveIndex((index) => index + 1);
        } else {
            setIsPlaying(false);
        }
    }

    function togglePlay() {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            void audioRef.current.play();
            setIsPlaying(true);
        }
    }

    function skip(delta: number) {
        setActiveIndex((index) =>
            Math.min(Math.max(index + delta, 0), segments.length - 1),
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
            <div className="flex items-center gap-3">
                <Button
                    nativeButton={false}
                    variant="ghost"
                    size="icon-sm"
                    render={<Link href={podcastRoutes.hub(workspaceId)} />}
                >
                    <ArrowLeftIcon />
                </Button>
                {isLoading || !podcast ? (
                    <Skeleton className="h-6 w-48" />
                ) : (
                    <div className="min-w-0">
                        <p className="truncate font-heading text-lg font-semibold">
                            {podcast.title}
                        </p>
                    </div>
                )}
            </div>

            {isLoading || !podcast ? (
                <Skeleton className="h-64 w-full rounded-3xl" />
            ) : podcast.status === "FAILED" ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                    Generation failed
                    {podcast.errorMessage ? `: ${podcast.errorMessage}` : "."}{" "}
                    Your credits were refunded.
                </div>
            ) : podcast.status !== "READY" ? (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
                    <PodcastStatusBadge status={podcast.status} />
                    Your hosts are recording — this usually takes a couple of
                    minutes.
                </div>
            ) : (
                <>
                    <audio ref={audioRef} onEnded={handleEnded} />

                    {/* Transcript, synced to the currently playing segment */}
                    <div className="flex-1 space-y-3 overflow-y-auto rounded-3xl border bg-card p-5">
                        {segments.map((segment, index) => (
                            <button
                                key={segment.index}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className={`flex w-full flex-col items-start gap-1 rounded-xl px-3 py-2 text-left transition-colors ${
                                    index === activeIndex
                                        ? "bg-primary/10"
                                        : "hover:bg-muted/50"
                                }`}
                            >
                                <span
                                    className={`font-ledger text-xs ${
                                        segment.speaker === "HOST_A"
                                            ? "text-primary"
                                            : "text-leaf"
                                    }`}
                                >
                                    {SPEAKER_LABEL[segment.speaker]}
                                </span>
                                <span className="text-sm leading-relaxed">
                                    {segment.text}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Transport controls */}
                    <div className="flex items-center justify-center gap-3 rounded-2xl border bg-card p-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => skip(-1)}
                            disabled={activeIndex === 0}
                        >
                            <SkipBackIcon />
                        </Button>
                        <Button
                            size="icon-lg"
                            onClick={togglePlay}
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => skip(1)}
                            disabled={activeIndex === segments.length - 1}
                        >
                            <SkipForwardIcon />
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
