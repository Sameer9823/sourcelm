import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import {
    deleteWorkspaceForUser,
    getWorkspaceByIdForUser,
    updateWorkspaceForUser,
} from "@/src/server/services/workspace.service";
import {
    updateWorkspaceSchema,
    workspaceIdParamSchema,
} from "@/src/server/validators/workspace.validator";

type Params = { workspaceId: string };

export const GET = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const workspace = await getWorkspaceByIdForUser(
        workspaceId,
        session.user.id,
    );
    return NextResponse.json(workspace);
});

export const PATCH = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const input = updateWorkspaceSchema.parse(await req.json());
    const workspace = await updateWorkspaceForUser(
        workspaceId,
        session.user.id,
        input,
    );
    return NextResponse.json(workspace);
});

export const DELETE = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    await deleteWorkspaceForUser(workspaceId, session.user.id);
    return new NextResponse(null, { status: 204 });
});
