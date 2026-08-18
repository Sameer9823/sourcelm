import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import {
    deleteSourceForWorkspace,
    getSourceForWorkspace,
} from "@/src/server/services/source.service";
import { sourceIdParamSchema } from "@/src/server/validators/source.validator";

type Params = { workspaceId: string; sourceId: string };

export const GET = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId, sourceId } = sourceIdParamSchema.parse(await params);
    const source = await getSourceForWorkspace(workspaceId, sourceId, session.user.id);
    return NextResponse.json(source);
});

export const DELETE = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId, sourceId } = sourceIdParamSchema.parse(await params);
    await deleteSourceForWorkspace(workspaceId, sourceId, session.user.id);
    return new NextResponse(null, { status: 204 });
});
