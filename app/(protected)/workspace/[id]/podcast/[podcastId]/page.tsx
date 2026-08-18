import { notFound } from "next/navigation";
import { requireAuth } from "@/features/auth";
import { PodcastPlayer } from "@/features/podcast";
import { getWorkspaceOrNull } from "@/features/workspaces/lib/workspace-server";
import { WorkspaceShell } from "@/features/workspaces";

type PodcastDetailPageProps = {
    params: Promise<{ id: string; podcastId: string }>;
};

export default async function PodcastDetailPage({
    params,
}: PodcastDetailPageProps) {
    await requireAuth();
    const { id, podcastId } = await params;
    const workspace = await getWorkspaceOrNull(id);

    if (!workspace) {
        notFound();
    }

    return (
        <WorkspaceShell workspace={workspace}>
            <PodcastPlayer workspaceId={workspace.id} podcastId={podcastId} />
        </WorkspaceShell>
    );
}
