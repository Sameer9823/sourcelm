import type { UIMessage } from "ai";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { streamWorkspaceChat } from "@/src/server/services/chat.service";
import {
    chatBodySchema,
} from "@/src/server/validators/chat.validator";
import { workspaceIdParamSchema } from "@/src/server/validators/workspace.validator";

type Params = { workspaceId: string };

// Returns the AI SDK's UI message stream directly as the Response body -
// `withRoute` still applies for AppError/ZodError/InsufficientCreditsError mapping.
export const POST = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const body = chatBodySchema.parse(await req.json());

    return streamWorkspaceChat(workspaceId, session.user.id, {
        conversationId: body.conversationId,
        messages: body.messages as unknown as UIMessage[],
        model: body.model,
        webSearch: body.webSearch,
    });
});
