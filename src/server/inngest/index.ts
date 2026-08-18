import { inngest, type SourceCreatedEvent } from "./client";
import {
    chunkSourceContent,
    embedAndIndexSource,
    extractSourceContent,
    markSourceFailed,
    markSourceProcessing,
} from "../services/source-processing.service";
import { findSourceById } from "../repositories/source.repository";
import { findChunksBySourceId } from "../repositories/source-chunk.repository";
import { processArtifactById } from "../services/artifact.service";
import { processPodcastById } from "../services/podcast.service";
import { summarizeConversationById } from "../services/conversation-memory.service";
import { gatherSourceContext } from "../services/artifact-generation.service";
import {
    generatePodcastScript,
    synthesizeSegment,
} from "../services/podcast-generation.service";
import { findPodcastById, setPodcastStatus } from "../repositories/podcast.repository";
import { NotFoundError } from "../types/app-error";

export const processSource = inngest.createFunction(
    {
        id: "process-source",
        retries: 3,
        triggers: [{ event: "source/created" }],
    },
    async ({ event, step }) => {
        const { sourceId } = event.data as SourceCreatedEvent["data"];

        // Check if source still exists before starting processing
        const sourceExists = await step.run("check-source-exists", async () => {
            const source = await findSourceById(sourceId);
            return !!source;
        });

        if (!sourceExists) {
            // Source was deleted before processing started - no need to retry
            return { sourceId, status: "SKIPPED", reason: "Source deleted" };
        }

        await step.run("mark-processing", () => markSourceProcessing(sourceId));

        try {
            const extracted = await step.run("extract-content", () =>
                extractSourceContent(sourceId),
            );

            await step.run("chunk-content", () =>
                chunkSourceContent(
                    sourceId,
                    extracted.text,
                    extracted.pages,
                ),
            );

            const result = await step.run("embed-and-index", async () => {
                const source = await findSourceById(sourceId);
                if (!source) {
                    // Source deleted during processing - skip without retry
                    return { chunkCount: 0, skipped: true as const };
                }

                const chunks = await findChunksBySourceId(sourceId);
                await embedAndIndexSource(source, chunks);

                return { chunkCount: chunks.length };
            });

            // Type guard for the result
            const resultWithSkipped = result as { chunkCount: number; skipped?: boolean };
            if (resultWithSkipped.skipped) {
                return { sourceId, status: "SKIPPED", reason: "Source deleted during processing" };
            }

            return { sourceId, status: "READY", ...result };
        } catch (error) {
            await step.run("mark-failed", async () => {
                const source = await findSourceById(sourceId);
                if (source) {
                    await markSourceFailed(sourceId, error, source.metadata);
                }
            });
            throw error;
        }
    },
);

export const generateArtifact = inngest.createFunction(
    {
        id: "generate-artifact",
        retries: 2,
        triggers: [{ event: "artifact/generate" }],
    },
    async ({ event, step }) => {
        const { artifactId } = event.data;

        await step.run("generate", () => processArtifactById(artifactId));

        return { artifactId, status: "READY" };
    },
);

export const summarizeConversation = inngest.createFunction(
    {
        id: "summarize-conversation",
        retries: 2,
        triggers: [{ event: "conversation/summarize" }],
    },
    async ({ event, step }) => {
        const { conversationId, userId } = event.data;

        await step.run("summarize", () =>
            summarizeConversationById(conversationId, userId),
        );

        return { conversationId, status: "SUMMARIZED" };
    },
);

export const generatePodcast = inngest.createFunction(
    {
        id: "generate-podcast",
        retries: 1,
        // Voice synthesis runs many sequential OpenAI calls, so give this
        // job more headroom than the other jobs before Inngest times it out.
        timeouts: { finish: "15m" },
        triggers: [{ event: "podcast/generate" }],
    },
    async ({ event, step }) => {
        const { podcastId, userId } = event.data;

        // Step 1: Gather context & generate script (single LLM call)
        const { script, context, podcast } = await step.run("generate-script", async () => {
            const podcast = await findPodcastById(podcastId);
            if (!podcast) throw new NotFoundError("Podcast not found");

            await setPodcastStatus(podcastId, "GENERATING");

            const context = await gatherSourceContext(
                podcast.workspaceId,
                podcast.sourceIds,
            );

            const script = await generatePodcastScript(
                context.text,
                podcast.title,
            );

            return { script, context, podcast };
        });

        // Step 2: Synthesize all segments IN PARALLEL using Inngest's step.run
        // Each segment runs as a separate child step - they execute concurrently
        // and can be individually retried if one fails.
        const segments = await Promise.all(
            script.segments.map((segment, index) =>
                step.run(`synthesize-segment-${index}`, async () => {
                    return synthesizeSegment(podcastId, index, segment);
                })
            )
        );

        // Step 3: Save final podcast with all segments
        await step.run("save-podcast", async () => {
            const durationSeconds = segments.reduce(
                (total, segment) => total + segment.durationSeconds,
                0,
            );

            return setPodcastStatus(podcastId, "READY", {
                title: script.title || podcast.title,
                script: segments as unknown as object,
                durationSeconds,
            });
        });

        return { podcastId, status: "READY" };
    },
);

export const functions = [
    processSource,
    generateArtifact,
    generatePodcast,
    summarizeConversation,
];