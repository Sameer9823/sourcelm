import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import {
    createPodcastForWorkspace,
    listPodcastsForWorkspace,
} from "@/src/server/services/podcast.service";
import {
    createPodcastSchema,
    workspaceIdParamSchema,
} from "@/src/server/validators/podcast.validator";

type Params = { workspaceId: string };

export const GET = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const podcasts = await listPodcastsForWorkspace(workspaceId, session.user.id);
    return NextResponse.json(podcasts);
});

export const POST = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);
    const body = await req.json().catch(() => ({}));
    const input = createPodcastSchema.parse(body ?? {});
    const podcast = await createPodcastForWorkspace(
        workspaceId,
        session.user.id,
        input,
    );
    return NextResponse.json(podcast, { status: 201 });
});
