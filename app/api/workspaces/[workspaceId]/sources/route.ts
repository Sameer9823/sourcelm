import { NextResponse } from "next/server";
import { withRoute, requireSession, queryToObject } from "@/src/server/lib/http";
import {
    createTextOrMarkdownSource,
    listSourcesForWorkspace,
} from "@/src/server/services/source.service";
import {
    createSourceSchema,
    listSourcesQuerySchema,
    workspaceIdParamSchema,
} from "@/src/server/validators/source.validator";

type Params = { workspaceId: string };

export const GET = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const filters = listSourcesQuerySchema.parse(queryToObject(req.url));
    const sources = await listSourcesForWorkspace(
        workspaceId,
        session.user.id,
        filters,
    );
    return NextResponse.json(sources);
});

export const POST = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const input = createSourceSchema.parse(await req.json());
    const source = await createTextOrMarkdownSource(
        workspaceId,
        session.user.id,
        input,
    );
    return NextResponse.json(source, { status: 201 });
});
