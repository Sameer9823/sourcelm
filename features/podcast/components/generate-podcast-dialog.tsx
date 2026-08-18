"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useSources } from "@/features/sources";
import { useCreatePodcast } from "../hooks/use-podcasts";

type GeneratePodcastDialogProps = {
    workspaceId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type Scope = "all" | "specific";

export function GeneratePodcastDialog({
    workspaceId,
    open,
    onOpenChange,
}: GeneratePodcastDialogProps) {
    const [title, setTitle] = useState("");
    const [scope, setScope] = useState<Scope>("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data: sources = [], isLoading } = useSources(workspaceId, {
        status: "READY",
    });
    const createPodcast = useCreatePodcast(workspaceId);

    const readyCount = sources.length;

    const scopeSummary = useMemo(() => {
        if (scope === "all") return `Uses all ${readyCount} ready sources`;
        if (selectedIds.length === 0) return "Choose at least one source";
        if (selectedIds.length === 1) return "Single-source episode";
        return `${selectedIds.length} sources combined into one episode`;
    }, [scope, selectedIds.length, readyCount]);

    function toggleSource(id: string) {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((existing) => existing !== id)
                : [...prev, id],
        );
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (scope === "specific" && selectedIds.length === 0) return;

        try {
            await createPodcast.mutateAsync({
                title: title.trim() || undefined,
                sourceIds: scope === "all" ? undefined : selectedIds,
            });
        } catch {
            return;
        }

        setTitle("");
        setScope("all");
        setSelectedIds([]);
        onOpenChange(false);
    }

    const canSubmit =
        !createPodcast.isPending &&
        readyCount > 0 &&
        (scope === "all" || selectedIds.length > 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <form onSubmit={(event) => void handleSubmit(event)}>
                    <DialogHeader>
                        <DialogTitle>Generate podcast</DialogTitle>
                        <DialogDescription>
                            Two AI hosts discuss your sources out loud. Runs
                            in the background — costs 15 credits.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="podcast-title">
                                Title (optional)
                            </Label>
                            <Input
                                id="podcast-title"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                placeholder="e.g. The chapter 3 deep dive"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Sources</Label>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setScope("all")}
                                    className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                                        scope === "all"
                                            ? "border-primary bg-primary/10"
                                            : "hover:bg-muted/50"
                                    }`}
                                >
                                    <p className="text-sm font-medium">
                                        All sources
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Everything ready in this workspace
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScope("specific")}
                                    className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                                        scope === "specific"
                                            ? "border-primary bg-primary/10"
                                            : "hover:bg-muted/50"
                                    }`}
                                >
                                    <p className="text-sm font-medium">
                                        Choose sources
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Pick one or several
                                    </p>
                                </button>
                            </div>

                            {scope === "specific" ? (
                                <div className="mt-1 max-h-48 space-y-1 overflow-y-auto rounded-xl border p-2">
                                    {isLoading ? (
                                        <>
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-8 w-full" />
                                        </>
                                    ) : readyCount === 0 ? (
                                        <p className="p-2 text-xs text-muted-foreground">
                                            No ready sources yet.
                                        </p>
                                    ) : (
                                        sources.map((source) => (
                                            <label
                                                key={source.id}
                                                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50"
                                            >
                                                <Checkbox
                                                    checked={selectedIds.includes(
                                                        source.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSource(source.id)
                                                    }
                                                />
                                                <span className="truncate">
                                                    {source.title}
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            ) : null}

                            <p className="text-xs text-muted-foreground">
                                {scopeSummary}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!canSubmit}>
                            {createPodcast.isPending
                                ? "Starting…"
                                : "Generate"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
