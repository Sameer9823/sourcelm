import {
    findWorkspaceByIdAndUserId,
    updateWorkspaceRecord,
    type WorkspaceRecord,
} from "../repositories/workspace.repository";
import { deleteWorkspaceVectors } from "../lib/pinecone";
import { NotFoundError } from "../types/app-error";
import type { UpdateWorkspaceInput } from "../validators/workspace.validator";
import {
    deleteConversationsByWorkspaceId,
} from "../repositories/conversation.repository";
import { deleteSourcesByWorkspaceId } from "../repositories/source.repository";
import { deleteArtifactsByWorkspaceId } from "../repositories/artifact.repository";
import { deletePodcastsByWorkspaceId } from "../repositories/podcast.repository";
import { deleteReviewCardsByWorkspaceId, deleteReviewLogsByWorkspaceId } from "../repositories/review.repository";
import { deleteChunksByWorkspaceId } from "../repositories/source-chunk.repository";
import { deleteMessagesByWorkspaceId } from "../repositories/message.repository";
import prisma from "../lib/db";

/**
 * Loads a workspace only if it belongs to the given user.
 *
 * @param workspaceId - Workspace to fetch
 * @param userId - Authenticated user's id
 * @returns The workspace record
 * @throws {NotFoundError} When the workspace does not exist or belongs to another user
 *
 *
 */
export async function getWorkspaceByIdForUser(
    workspaceId: string,
    userId: string,
): Promise<WorkspaceRecord> {
    const workspace = await findWorkspaceByIdAndUserId(workspaceId, userId);

    if (!workspace) {
        throw new NotFoundError("Workspace not found");
    }

    return workspace;
}

/**
 * Updates workspace settings after verifying the user owns it.
 *
 * @param workspaceId - Workspace to update
 * @param userId - Authenticated user's id
 * @param input - Partial workspace fields to change
 * @returns Updated workspace record
 * @throws {NotFoundError} When the workspace is not found for this user
 *
 */
export async function updateWorkspaceForUser(
    workspaceId: string,
    userId: string,
    input: UpdateWorkspaceInput,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    return updateWorkspaceRecord(workspaceId, input);
}

/**
 * Deletes a workspace and all associated data.
 *
 * Cleanup order:
 * 1. Pinecone vectors (best-effort)
 * 2. Database records (in transaction for atomicity)
 *
 * @param workspaceId - Workspace to delete
 * @param userId - Authenticated user's id
 * @returns Resolves when the workspace row is deleted
 * @throws {NotFoundError} When the workspace is not found for this user
 *
 */
export async function deleteWorkspaceForUser(
    workspaceId: string,
    userId: string,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    try {
        await deleteWorkspaceVectors(workspaceId);
    } catch (error) {
        console.error("Failed to delete Pinecone namespace:", error);
    }

    // Delete all associated data in a transaction for atomicity
    await prisma.$transaction(async (tx) => {
        await deleteMessagesByWorkspaceId(workspaceId);
        await deleteConversationsByWorkspaceId(workspaceId);
        await deleteSourcesByWorkspaceId(workspaceId);
        await deleteArtifactsByWorkspaceId(workspaceId);
        await deletePodcastsByWorkspaceId(workspaceId);
        await deleteReviewCardsByWorkspaceId(workspaceId);
        await deleteReviewLogsByWorkspaceId(workspaceId);
        await deleteChunksByWorkspaceId(workspaceId);
        await tx.workspace.delete({ where: { id: workspaceId } });
    });
}
