import { z } from "zod";
import { CHAT_MODELS } from "../lib/ai-config";
import { workspaceIdParamSchema } from "./workspace.validator";

export const conversationIdParamSchema = workspaceIdParamSchema.extend({
    conversationId: z.string().trim().min(1, "Conversation id is required"),
});

// UIMessage part types from AI SDK
const uiMessagePartSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("text"), text: z.string() }),
    z.object({ type: z.literal("tool-invocation"), toolInvocation: z.object({
        state: z.enum(["call", "result", "partial-call"]),
        toolCallId: z.string(),
        toolName: z.string(),
        args: z.unknown(),
        result: z.unknown().optional(),
    }) }),
    z.object({ type: z.literal("reasoning"), reasoning: z.string() }),
    z.object({ type: z.literal("source"), source: z.object({
        id: z.string(),
        sourceType: z.string(),
        title: z.string(),
        url: z.string().optional(),
    }) }),
    z.object({ type: z.literal("file"), file: z.object({
        name: z.string(),
        mediaType: z.string(),
        url: z.string(),
    }) }),
    z.object({ type: z.literal("data"), data: z.unknown() }),
]);

const uiMessageSchema = z.object({
    id: z.string(),
    role: z.enum(["user", "assistant", "system", "tool"]),
    parts: z.array(uiMessagePartSchema).min(1),
    // Optional fields from AI SDK
    content: z.string().optional(), // Deprecated but still used
    annotations: z.array(z.unknown()).optional(),
    experimental_attachments: z.array(z.unknown()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    // JSON dates come as ISO strings
    createdAt: z.string().datetime().optional(),
});

export const chatBodySchema = z.object({
    conversationId: z.string().trim().min(1).optional(),
    messages: z.array(uiMessageSchema).min(1),
    model: z.enum(CHAT_MODELS).optional(),
    webSearch: z.boolean().optional(),
});

export type ChatBody = z.infer<typeof chatBodySchema>;

export const createConversationSchema = z.object({
    title: z.string().trim().min(1).max(120).optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
