import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { bulkDeleteSourcesForWorkspace } from "@/src/server/services/source.service";
import {
    bulkDeleteSourcesSchema,
    workspaceIdParamSchema,
} from "@/src/server/validators/source.validator";

type Params = { workspaceId: string };

export const POST = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const input = bulkDeleteSourcesSchema.parse(await req.json());
    await bulkDeleteSourcesForWorkspace(workspaceId, session.user.id, input.sourceIds);
    return new NextResponse(null, { status: 204 });
});
