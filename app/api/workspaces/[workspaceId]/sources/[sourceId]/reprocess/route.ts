import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { reprocessSourceForWorkspace } from "@/src/server/services/source.service";
import { sourceIdParamSchema } from "@/src/server/validators/source.validator";

type Params = { workspaceId: string; sourceId: string };

export const POST = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId, sourceId } = sourceIdParamSchema.parse(await params);
    await reprocessSourceForWorkspace(workspaceId, sourceId, session.user.id);
    return NextResponse.json({ reprocessed: true }, { status: 202 });
});
