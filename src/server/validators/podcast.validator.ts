import { z } from "zod";

export const workspaceIdParamSchema = z.object({
    workspaceId: z.string().trim().min(1),
});

export const podcastIdParamSchema = z.object({
    workspaceId: z.string().trim().min(1),
    podcastId: z.string().trim().min(1),
});

/**
 * `sourceIds` selects the generation scope:
 *  - omitted → every ready source in the workspace ("all sources")
 *  - one id  → single-source episode
 *  - several → multi-source episode
 */
export const createPodcastSchema = z.object({
    title: z.string().trim().min(1).max(200).optional(),
    sourceIds: z.array(z.string().trim().min(1)).max(50).optional(),
});

export type CreatePodcastInput = z.infer<typeof createPodcastSchema>;
