import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { reprocessSourcesForWorkspace } from "@/src/server/services/source.service";
import {
    reprocessSourcesSchema,
    workspaceIdParamSchema,
} from "@/src/server/validators/source.validator";

type Params = { workspaceId: string };

export const POST = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const body = await req.json().catch(() => ({}));
    const input = reprocessSourcesSchema.parse(body ?? {});
    const result = await reprocessSourcesForWorkspace(workspaceId, session.user.id, input);
    return NextResponse.json(result);
});
