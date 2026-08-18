/**
 * Podcast generation pipeline.
 *
 * ```
 * gatherSourceContext (1, several, or all workspace sources)
 *   → generatePodcastScript   (LLM writes a two-host dialogue, grounded only in the sources)
 *   → synthesizeSegment × N   (OpenAI voice agent turns each line into speech)
 *   → Cloudinary upload × N
 * ```
 *
 * Each segment is synthesized and uploaded independently (rather than
 * concatenated into one file) so the Inngest worker can retry a single
 * failed segment instead of redoing the whole episode, and so the player
 * can highlight the active line while it plays.
 */

import OpenAI from "openai";
import { generateText, Output } from "ai";
import { openai as openaiProvider } from "@ai-sdk/openai";
import { z } from "zod";
import { CHAT_MODEL, PODCAST_VOICES, TTS_MODEL, WORDS_PER_MINUTE, MAX_PODCAST_SEGMENTS } from "../lib/ai-config";
import { uploadAudioToCloudinary } from "../lib/cloudinary";
import { ValidationError } from "../types/app-error";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const scriptSchema = z.object({
    title: z.string(),
    segments: z
        .array(
            z.object({
                speaker: z.enum(["HOST_A", "HOST_B"]),
                text: z.string(),
            }),
        )
        .min(6)
        .max(MAX_PODCAST_SEGMENTS),
});

export type PodcastScriptSegment = z.infer<
    typeof scriptSchema
>["segments"][number];

const MAX_CONTEXT_CHARS = 100_000;

/**
 * Writes a two-host "deep dive" podcast script grounded only in the given
 * source text.
 *
 * @param context - Combined source text (see `gatherSourceContext`)
 * @param workspaceTitle - Used to give the episode a natural framing
 * @returns Episode title and an ordered list of HOST_A/HOST_B lines
 *
 */
export async function generatePodcastScript(
    context: string,
    workspaceTitle: string,
) {
    const trimmed = context.slice(0, MAX_CONTEXT_CHARS);

    const { output } = await generateText({
        model: openaiProvider(CHAT_MODEL),
        output: Output.object({ schema: scriptSchema }),
        prompt: `You are writing the script for a two-host "deep dive" podcast episode, in the style of a friendly, curious explainer show. The two hosts are HOST_A (drives the conversation, asks questions, frames topics) and HOST_B (the more detail-oriented one, explains and adds color).

Workspace: "${workspaceTitle}"

Ground every claim ONLY in the source material below. Do not invent facts, statistics, or quotes that aren't supported by it. If the material is thin on a topic, have the hosts say so honestly rather than fabricating detail.

Write a natural, conversational back-and-forth: short lines, interruptions, "huh, that's interesting" reactions, questions, and a clear throughline. Open with a short cold-open hook, close with a wrap-up. Aim for 12-24 segments total. Each segment is one host's line (a sentence or two, not a monologue).

Source material:
"""
${trimmed}
"""`,
    });

    return output;
}

export type SynthesizedSegment = PodcastScriptSegment & {
    index: number;
    audioUrl: string;
    durationSeconds: number;
};

/**
 * Converts a single script line to speech via the OpenAI voice agent and
 * uploads the resulting audio to Cloudinary.
 *
 * @param podcastId - Used to namespace the uploaded filename
 * @param index - Segment position (for filename + ordering)
 * @param segment - The speaker + text to synthesize
 * @returns The segment enriched with its audio URL and estimated duration
 * @throws {ValidationError} When `OPENAI_API_KEY` is not configured
 *
 */
export async function synthesizeSegment(
    podcastId: string,
    index: number,
    segment: PodcastScriptSegment,
): Promise<SynthesizedSegment> {
    if (!process.env.OPENAI_API_KEY) {
        throw new ValidationError("OpenAI is not configured on the server");
    }

    const voice = PODCAST_VOICES[segment.speaker];

    const response = await openai.audio.speech.create({
        model: TTS_MODEL,
        voice,
        input: segment.text,
        response_format: "mp3",
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const upload = await uploadAudioToCloudinary(
        buffer,
        `${podcastId}-segment-${index}.mp3`,
    );

    const wordCount = segment.text.trim().split(/\s+/).filter(Boolean).length;
    const durationSeconds = Math.max(
        1,
        Math.round((wordCount / WORDS_PER_MINUTE) * 60),
    );

    return { ...segment, index, audioUrl: upload.secureUrl, durationSeconds };
}
