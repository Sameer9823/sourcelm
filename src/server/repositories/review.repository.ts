import prisma from "../lib/db";
import type { Prisma, ReviewGrade } from "../../generated/prisma/client";

export type ReviewCardUpsertData = {
    userId: string;
    workspaceId: string;
    artifactId: string;
    cardIndex: number;
    cardType: "FLASHCARD" | "QUIZ";
    front: string;
    back: string;
    options?: string[];
    correctIndex?: number;
    explanation?: string;
};

/**
 * Creates or refreshes a review card for a given flashcard/quiz position.
 * Regenerating the same artifact (e.g. via reprocess) updates the
 * content fields without resetting the learner's SRS progress.
 */
export function upsertReviewCard(data: ReviewCardUpsertData) {
    return prisma.reviewCard.upsert({
        where: {
            artifactId_cardIndex: {
                artifactId: data.artifactId,
                cardIndex: data.cardIndex,
            },
        },
        update: {
            front: data.front,
            back: data.back,
            options: data.options ?? [],
            correctIndex: data.correctIndex,
            explanation: data.explanation,
        },
        create: data,
    });
}

/** Removes review cards whose artifact no longer has that many flashcards. */
export function deleteReviewCardsBeyondIndex(
    artifactId: string,
    keepBelowIndex: number,
) {
    return prisma.reviewCard.deleteMany({
        where: { artifactId, cardIndex: { gte: keepBelowIndex } },
    });
}

export function countDueCards(userId: string, now: Date) {
    return prisma.reviewCard.count({
        where: { userId, dueAt: { lte: now } },
    });
}

export function countTotalCards(userId: string) {
    return prisma.reviewCard.count({ where: { userId } });
}

/**
 * Builds a review session: cards already due first (oldest-due first), then
 * tops up with never-reviewed cards up to `limit` so a workspace with fresh
 * flashcards still produces a session before anything is technically "due".
 */
export async function findQueueForUser(userId: string, limit: number) {
    const now = new Date();

    const due = await prisma.reviewCard.findMany({
        where: { userId, dueAt: { lte: now } },
        orderBy: { dueAt: "asc" },
        take: limit,
        include: {
            artifact: { select: { title: true } },
            workspace: { select: { id: true, title: true } },
        },
    });

    if (due.length >= limit) return due;

    const fresh = await prisma.reviewCard.findMany({
        where: { userId, repetitions: 0, dueAt: { gt: now } },
        orderBy: { createdAt: "asc" },
        take: limit - due.length,
        include: {
            artifact: { select: { title: true } },
            workspace: { select: { id: true, title: true } },
        },
    });

    return [...due, ...fresh];
}

export function findReviewCardById(cardId: string) {
    return prisma.reviewCard.findUnique({ where: { id: cardId } });
}

export function updateReviewCardSchedule(
    cardId: string,
    data: Prisma.ReviewCardUpdateInput,
) {
    return prisma.reviewCard.update({ where: { id: cardId }, data });
}

export function createReviewLog(
    userId: string,
    cardId: string,
    grade: ReviewGrade,
) {
    return prisma.reviewLog.create({ data: { userId, cardId, grade } });
}

/** Distinct calendar days (local to the DB's UTC storage) the user reviewed at least one card. */
export function findRecentReviewDays(userId: string, sinceDaysAgo: number) {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - sinceDaysAgo);

    return prisma.reviewLog.findMany({
        where: { userId, reviewedAt: { gte: since } },
        select: { reviewedAt: true },
        orderBy: { reviewedAt: "desc" },
    });
}

export function countReviewsToday(userId: string) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    return prisma.reviewLog.count({
        where: { userId, reviewedAt: { gte: startOfDay } },
    });
}

export function deleteReviewCardsByWorkspaceId(workspaceId: string) {
    return prisma.reviewCard.deleteMany({
        where: { workspaceId },
    });
}

export function deleteReviewLogsByWorkspaceId(workspaceId: string) {
    return prisma.reviewLog.deleteMany({
        where: { card: { workspaceId } },
    });
}
