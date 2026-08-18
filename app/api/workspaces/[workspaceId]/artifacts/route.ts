import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import {
    createArtifactForWorkspace,
    listArtifactsForWorkspace,
} from "@/src/server/services/artifact.service";
import { createArtifactSchema } from "@/src/server/validators/artifact.validator";
import { workspaceIdParamSchema } from "@/src/server/validators/workspace.validator";

type Params = { workspaceId: string };

export const GET = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const artifacts = await listArtifactsForWorkspace(workspaceId, session.user.id);
    return NextResponse.json(artifacts);
});

export const POST = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const input = createArtifactSchema.parse(await req.json());
    const artifact = await createArtifactForWorkspace(workspaceId, session.user.id, input);
    return NextResponse.json(artifact, { status: 201 });
});
