import { notFound } from "next/navigation";
import { requireAuth } from "@/features/auth";
import { PodcastHub } from "@/features/podcast";
import { getWorkspaceOrNull } from "@/features/workspaces/lib/workspace-server";
import { WorkspaceShell } from "@/features/workspaces";

type PodcastPageProps = {
    params: Promise<{ id: string }>;
};

export default async function PodcastPage({ params }: PodcastPageProps) {
    await requireAuth();
    const { id } = await params;
    const workspace = await getWorkspaceOrNull(id);

    if (!workspace) {
        notFound();
    }

    return (
        <WorkspaceShell workspace={workspace}>
            <PodcastHub workspaceId={workspace.id} />
        </WorkspaceShell>
    );
}
