import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { importWebSearchSource } from "@/src/server/services/source.service";
import {
    importWebSearchSchema,
    workspaceIdParamSchema,
} from "@/src/server/validators/source.validator";

type Params = { workspaceId: string };

export const POST = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const input = importWebSearchSchema.parse(await req.json());
    const source = await importWebSearchSource(workspaceId, session.user.id, input);
    return NextResponse.json(source, { status: 201 });
});
