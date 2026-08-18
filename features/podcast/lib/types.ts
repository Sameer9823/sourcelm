export type PodcastStatus = "PENDING" | "GENERATING" | "READY" | "FAILED";

export type PodcastSegment = {
    index: number;
    speaker: "HOST_A" | "HOST_B";
    text: string;
    audioUrl: string;
    durationSeconds: number;
};

export type Podcast = {
    id: string;
    workspaceId: string;
    title: string;
    sourceIds: string[];
    status: PodcastStatus;
    script: PodcastSegment[] | null;
    durationSeconds: number | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CreatePodcastInput = {
    title?: string;
    /** Omit for "all sources", pass one id for single-source, several for multi-source. */
    sourceIds?: string[];
};
