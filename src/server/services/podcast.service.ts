import { gatherSourceContext } from "./artifact-generation.service";
import { getWorkspaceByIdForUser } from "./workspace.service";
import { spendCredits, refundCreditsTx } from "../lib/credits";
import { inngest } from "../inngest/client";
import {
    createPodcastRecord,
    deletePodcastRecord,
    findPodcastById,
    findPodcastsByWorkspaceId,
    setPodcastStatus,
} from "../repositories/podcast.repository";
import {
    generatePodcastScript,
    synthesizeSegment,
    type SynthesizedSegment,
} from "./podcast-generation.service";
import { NotFoundError } from "../types/app-error";
import type { CreatePodcastInput } from "../validators/podcast.validator";
import prisma from "../lib/db";

/**
 * Creates a podcast episode from one, several, or all ready sources in a
 * workspace. Credits are charged up front; generation itself runs in the
 * background via Inngest, so this returns a `PENDING` record immediately.
 *
 * `input.sourceIds` selects the scope:
 *  - omitted / empty → every READY source in the workspace ("all sources")
 *  - one id → single-source episode
 *  - multiple ids → multi-source episode
 *
 * @param workspaceId - Workspace to generate the episode in
 * @param userId - Authenticated user's id
 * @param input - Optional title and source scope
 * @returns The newly created `PENDING` podcast record
 * @throws {ValidationError} When no ready sources are found in scope
 *
 */
export async function createPodcastForWorkspace(
    workspaceId: string,
    userId: string,
    input: CreatePodcastInput,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    // Validates the source scope up front (throws if nothing is READY) before
    // we charge credits or enqueue a background job.
    const context = await gatherSourceContext(workspaceId, input.sourceIds);

    await spendCredits({
        userId,
        action: "PODCAST_GENERATE",
        description: `Generated podcast: ${input.title ?? "Untitled episode"}`,
    });

    const podcast = await createPodcastRecord({
        workspaceId,
        title:
            input.title ||
            `Deep dive · ${new Date().toLocaleDateString()}`,
        sourceIds: context.sourceIds,
    });

    await inngest.send({
        name: "podcast/generate",
        data: { podcastId: podcast.id, userId },
    });

    return podcast;
}

export async function listPodcastsForWorkspace(
    workspaceId: string,
    userId: string,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    return findPodcastsByWorkspaceId(workspaceId);
}

export async function getPodcastForWorkspace(
    workspaceId: string,
    podcastId: string,
    userId: string,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    const podcast = await findPodcastById(podcastId);

    if (!podcast || podcast.workspaceId !== workspaceId) {
        throw new NotFoundError("Podcast not found");
    }

    return podcast;
}

export async function deletePodcastForWorkspace(
    workspaceId: string,
    podcastId: string,
    userId: string,
) {
    await getPodcastForWorkspace(workspaceId, podcastId, userId);
    await deletePodcastRecord(podcastId);
}

/**
 * Runs the full podcast generation pipeline (used by the Inngest worker).
 *
 * ```
 * status: GENERATING
 *   → gatherSourceContext (using the sourceIds captured at creation time)
 *   → generatePodcastScript
 *   → synthesizeSegment × N
 *   → status: READY (or FAILED + credit refund on error)
 * ```
 *
 * @param podcastId - Podcast to generate audio for
 * @param userId - Owner, used to refund credits if generation fails
 *
 */
export async function processPodcastById(podcastId: string, userId: string) {
    const podcast = await findPodcastById(podcastId);
    if (!podcast) {
        throw new NotFoundError("Podcast not found");
    }

    await setPodcastStatus(podcastId, "GENERATING");

    try {
        const context = await gatherSourceContext(
            podcast.workspaceId,
            podcast.sourceIds,
        );

        const script = await generatePodcastScript(
            context.text,
            podcast.title,
        );

        const segments: SynthesizedSegment[] = [];
        for (let i = 0; i < script.segments.length; i++) {
            segments.push(
                await synthesizeSegment(podcastId, i, script.segments[i]),
            );
        }

        const durationSeconds = segments.reduce(
            (total, segment) => total + segment.durationSeconds,
            0,
        );

        return setPodcastStatus(podcastId, "READY", {
            title: script.title || podcast.title,
            script: segments as unknown as object,
            durationSeconds,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Generation failed";

        // Use a transaction to ensure both status update and credit refund succeed or fail together
        await prisma.$transaction(async (tx) => {
            await setPodcastStatus(
                podcastId,
                "FAILED",
                { errorMessage: message },
                tx,
            );

            await refundCreditsTx(tx, {
                userId,
                action: "PODCAST_GENERATE",
                description: `Refund: podcast generation failed (${podcast.title})`,
            });
        });

        throw error;
    }
}
