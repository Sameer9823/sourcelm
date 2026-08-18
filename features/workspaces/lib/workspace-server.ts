import { getSession } from "@/features/auth/lib/auth-server";
import { getWorkspaceByIdForUser } from "@/src/server/services/workspace.service";
import { NotFoundError } from "@/src/server/types/app-error";
import type { Workspace } from "./types";

/**
 * Looks up a workspace for the current session directly through the service
 * layer, for use in Server Components (page.tsx files).
 *
 * This intentionally does NOT go through `fetch("/api/workspaces/...")` —
 * calling the service function directly avoids an unnecessary network hop
 * back into the same Next.js process. (An earlier version of this file did
 * self-fetch, and pointed at a leftover `API_URL`/`localhost:8080` from
 * before the Express backend was merged into this app — that address no
 * longer exists, which is why workspace pages were failing with
 * `ECONNREFUSED`.)
 *
 * @param id - Workspace id from the route params
 * @returns The workspace if it exists and belongs to the current user, otherwise `null`
 *
 */
export async function getWorkspaceOrNull(id: string): Promise<Workspace | null> {
    const session = await getSession();
    if (!session?.user) return null;

    try {
        const workspace = await getWorkspaceByIdForUser(id, session.user.id);

        return {
            id: workspace.id,
            title: workspace.title,
            description: workspace.description,
            icon: workspace.icon,
            defaultModel: workspace.defaultModel,
            createdAt: workspace.createdAt.toISOString(),
            updatedAt: workspace.updatedAt.toISOString(),
        };
    } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
    }
}
