import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { deleteConversationForWorkspace } from "@/src/server/services/chat.service";
import { conversationIdParamSchema } from "@/src/server/validators/chat.validator";

type Params = { workspaceId: string; conversationId: string };

export const DELETE = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId, conversationId } = conversationIdParamSchema.parse(
        await params,
    );
    await deleteConversationForWorkspace(
        workspaceId,
        conversationId,
        session.user.id,
    );
    return new NextResponse(null, { status: 204 });
});
