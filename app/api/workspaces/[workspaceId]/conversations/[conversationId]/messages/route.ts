import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { getConversationMessagesForWorkspace } from "@/src/server/services/chat.service";
import { conversationIdParamSchema } from "@/src/server/validators/chat.validator";

type Params = { workspaceId: string; conversationId: string };

export const GET = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId, conversationId } = conversationIdParamSchema.parse(
        await params,
    );
    const messages = await getConversationMessagesForWorkspace(
        workspaceId,
        conversationId,
        session.user.id,
    );
    return NextResponse.json(messages);
});
