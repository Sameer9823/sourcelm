import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import {
    deletePodcastForWorkspace,
    getPodcastForWorkspace,
} from "@/src/server/services/podcast.service";
import { podcastIdParamSchema } from "@/src/server/validators/podcast.validator";

type Params = { workspaceId: string; podcastId: string };

export const GET = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId, podcastId } = podcastIdParamSchema.parse(await params);
    const podcast = await getPodcastForWorkspace(workspaceId, podcastId, session.user.id);
    return NextResponse.json(podcast);
});

export const DELETE = withRoute<Params>(async (_req, { params }) => {
    const session = await requireSession();
    const { workspaceId, podcastId } = podcastIdParamSchema.parse(await params);
    await deletePodcastForWorkspace(workspaceId, podcastId, session.user.id);
    return new NextResponse(null, { status: 204 });
});
