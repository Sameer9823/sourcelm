import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import {
    createWorkspaceRecord,
    findWorkspacesByUserId,
} from "@/src/server/repositories/workspace.repository";
import { createWorkspaceSchema } from "@/src/server/validators/workspace.validator";

export const GET = withRoute(async () => {
    const session = await requireSession();
    const workspaces = await findWorkspacesByUserId(session.user.id);
    return NextResponse.json(workspaces);
});

export const POST = withRoute(async (req) => {
    const session = await requireSession();
    const input = createWorkspaceSchema.parse(await req.json());
    const workspace = await createWorkspaceRecord(session.user.id, input);
    return NextResponse.json(workspace, { status: 201 });
});
