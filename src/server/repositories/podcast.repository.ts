import prisma from "../lib/db";
import type { Prisma, PodcastStatus } from "../../generated/prisma/client";

type TransactionClient = Prisma.TransactionClient;

export type CreatePodcastData = {
    workspaceId: string;
    title: string;
    sourceIds: string[];
};

export function createPodcastRecord(data: CreatePodcastData) {
    return prisma.podcast.create({
        data: {
            workspaceId: data.workspaceId,
            title: data.title,
            sourceIds: data.sourceIds,
            status: "PENDING",
        },
    });
}

export function findPodcastsByWorkspaceId(workspaceId: string) {
    return prisma.podcast.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
    });
}

export function findPodcastById(podcastId: string) {
    return prisma.podcast.findUnique({ where: { id: podcastId } });
}

export function updatePodcastRecord(
    podcastId: string,
    data: Prisma.PodcastUpdateInput,
) {
    return prisma.podcast.update({ where: { id: podcastId }, data });
}

export function setPodcastStatus(
    podcastId: string,
    status: PodcastStatus,
    extra: Prisma.PodcastUpdateInput = {},
    tx?: TransactionClient,
) {
    const client = tx ?? prisma;
    return client.podcast.update({
        where: { id: podcastId },
        data: { status, ...extra },
    });
}

export function deletePodcastRecord(podcastId: string) {
    return prisma.podcast.delete({ where: { id: podcastId } });
}

export function deletePodcastsByWorkspaceId(workspaceId: string) {
    return prisma.podcast.deleteMany({
        where: { workspaceId },
    });
}
