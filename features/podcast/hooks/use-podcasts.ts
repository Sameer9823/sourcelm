"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createPodcast,
    deletePodcast,
    getPodcast,
    listPodcasts,
} from "../lib/api";
import type { CreatePodcastInput } from "../lib/types";

export function podcastKeys(workspaceId: string) {
    return {
        all: ["podcasts", workspaceId] as const,
        list: () => ["podcasts", workspaceId, "list"] as const,
        detail: (podcastId: string) =>
            ["podcasts", workspaceId, podcastId] as const,
    };
}

const isInFlight = (status?: string) =>
    status === "PENDING" || status === "GENERATING";

export function usePodcasts(workspaceId: string) {
    return useQuery({
        queryKey: podcastKeys(workspaceId).list(),
        queryFn: () => listPodcasts(workspaceId),
        refetchInterval: (query) => {
            const anyInFlight = query.state.data?.some((p) =>
                isInFlight(p.status),
            );
            return anyInFlight ? 3000 : false;
        },
    });
}

export function usePodcast(workspaceId: string, podcastId: string) {
    return useQuery({
        queryKey: podcastKeys(workspaceId).detail(podcastId),
        queryFn: () => getPodcast(workspaceId, podcastId),
        refetchInterval: (query) =>
            isInFlight(query.state.data?.status) ? 3000 : false,
    });
}

export function useCreatePodcast(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreatePodcastInput) =>
            createPodcast(workspaceId, input),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: podcastKeys(workspaceId).all,
            });
            // Generating a podcast spends credits — refresh the badge.
            void queryClient.invalidateQueries({ queryKey: ["credits"] });
        },
    });
}

export function useDeletePodcast(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (podcastId: string) =>
            deletePodcast(workspaceId, podcastId),
        onSuccess: (_, podcastId) => {
            queryClient.removeQueries({
                queryKey: podcastKeys(workspaceId).detail(podcastId),
            });
            void queryClient.invalidateQueries({
                queryKey: podcastKeys(workspaceId).all,
            });
        },
    });
}
