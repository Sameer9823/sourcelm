import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import {
    createConversationForWorkspace,
    listConversationsForWorkspace,
} from "@/src/server/services/chat.service";
import {
    createConversationSchema,
} from "@/src/server/validators/chat.validator";
import { workspaceIdParamSchema } from "@/src/server/validators/workspace.validator";

type Params = { workspaceId: string };

export const GET = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const conversations = await listConversationsForWorkspace(
        workspaceId,
        session.user.id,
    );
    return NextResponse.json(conversations);
});

export const POST = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const body = await req.json().catch(() => ({}));
    const input = createConversationSchema.parse(body ?? {});
    const conversation = await createConversationForWorkspace(
        workspaceId,
        session.user.id,
        input.title,
    );
    return NextResponse.json(conversation, { status: 201 });
});
