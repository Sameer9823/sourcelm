import { apiFetch } from "@/shared/lib/api";
import type { CreatePodcastInput, Podcast } from "./types";

export function listPodcasts(workspaceId: string) {
    return apiFetch<Podcast[]>(`/api/workspaces/${workspaceId}/podcasts`);
}

export function getPodcast(workspaceId: string, podcastId: string) {
    return apiFetch<Podcast>(
        `/api/workspaces/${workspaceId}/podcasts/${podcastId}`,
    );
}

export function createPodcast(
    workspaceId: string,
    input: CreatePodcastInput,
) {
    return apiFetch<Podcast>(`/api/workspaces/${workspaceId}/podcasts`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function deletePodcast(workspaceId: string, podcastId: string) {
    return apiFetch<void>(
        `/api/workspaces/${workspaceId}/podcasts/${podcastId}`,
        { method: "DELETE" },
    );
}
