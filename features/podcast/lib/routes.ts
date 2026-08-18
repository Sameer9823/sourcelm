export const podcastRoutes = {
    hub: (workspaceId: string) => `/workspace/${workspaceId}/podcast`,
    detail: (workspaceId: string, podcastId: string) =>
        `/workspace/${workspaceId}/podcast/${podcastId}`,
} as const;
