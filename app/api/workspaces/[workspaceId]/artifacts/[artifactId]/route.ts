import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import {
    deleteArtifactForWorkspace,
    getArtifactForWorkspace,
} from "@/src/server/services/artifact.service";
import { artifactIdParamSchema } from "@/src/server/validators/artifact.validator";

type Params = { workspaceId: string; artifactId: string };

export const GET = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId, artifactId } = artifactIdParamSchema.parse(await params);
    const artifact = await getArtifactForWorkspace(workspaceId, artifactId, session.user.id);
    return NextResponse.json(artifact);
});

export const DELETE = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId, artifactId } = artifactIdParamSchema.parse(await params);
    await deleteArtifactForWorkspace(workspaceId, artifactId, session.user.id);
    return new NextResponse(null, { status: 204 });
});
