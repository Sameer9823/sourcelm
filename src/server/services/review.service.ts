import prisma from "../lib/db";
import {
    countDueCards,
    countReviewsToday,
    countTotalCards,
    createReviewLog,
    deleteReviewCardsBeyondIndex,
    findQueueForUser,
    findRecentReviewDays,
    findReviewCardById,
    updateReviewCardSchedule,
    upsertReviewCard,
} from "../repositories/review.repository";
import { computeStreak, scheduleNextReview } from "../lib/spaced-repetition";
import { NotFoundError, ValidationError } from "../types/app-error";
import type { ArtifactRecord } from "../repositories/artifact.repository";
import type { ReviewGrade } from "../../generated/prisma/client";

const DEFAULT_QUEUE_LIMIT = 20;
const STREAK_LOOKBACK_DAYS = 60;

/**
 * Creates/refreshes one ReviewCard per flashcard or quiz question whenever a
 * FLASHCARDS or QUIZ artifact finishes generating. Called from the artifact
 * processing pipeline — never from the client — so review cards always
 * mirror the latest generated deck without the learner doing anything extra.
 *
 * Existing cards keep their SRS progress (upsert only touches content
 * fields); only genuinely new indices start fresh at repetitions: 0.
 *
 * @param artifact - A READY artifact whose `content` matches its `type`
 *
 */
export async function syncReviewCardsFromArtifact(artifact: ArtifactRecord) {
    if (artifact.type !== "FLASHCARDS" && artifact.type !== "QUIZ") return;

    const workspaceId = artifact.workspaceId;
    const userId = await resolveWorkspaceOwnerId(workspaceId);
    if (!userId) return;

    const rows =
        artifact.type === "FLASHCARDS"
            ? buildFlashcardRows(artifact, userId)
            : buildQuizRows(artifact, userId);

    if (rows.length === 0) return;

    await Promise.all(rows.map((row) => upsertReviewCard(row)));

    // If the deck shrank on regeneration, drop the now-orphaned tail cards.
    await deleteReviewCardsBeyondIndex(artifact.id, rows.length);
}

function buildFlashcardRows(artifact: ArtifactRecord, userId: string) {
    const content = artifact.content as
        | { cards?: { front: string; back: string }[] }
        | null;
    const cards = content?.cards ?? [];

    return cards.map((card, index) => ({
        userId,
        workspaceId: artifact.workspaceId,
        artifactId: artifact.id,
        cardIndex: index,
        cardType: "FLASHCARD" as const,
        front: card.front,
        back: card.back,
    }));
}

function buildQuizRows(artifact: ArtifactRecord, userId: string) {
    const content = artifact.content as
        | {
              questions?: {
                  question: string;
                  options: string[];
                  correctIndex: number;
                  explanation: string;
              }[];
          }
        | null;
    const questions = content?.questions ?? [];

    return questions.map((q, index) => ({
        userId,
        workspaceId: artifact.workspaceId,
        artifactId: artifact.id,
        cardIndex: index,
        cardType: "QUIZ" as const,
        front: q.question,
        back: q.options[q.correctIndex] ?? "",
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
    }));
}

async function resolveWorkspaceOwnerId(workspaceId: string) {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { userId: true },
    });
    return workspace?.userId ?? null;
}

/**
 * Builds today's review session for a user: overdue cards first, then
 * never-reviewed cards to fill out the session.
 *
 * @param userId - Authenticated user's id
 * @param limit - Max cards to return (default 20)
 *
 */
export async function getReviewQueue(
    userId: string,
    limit = DEFAULT_QUEUE_LIMIT,
) {
    return findQueueForUser(userId, limit);
}

export async function getReviewStats(userId: string) {
    const now = new Date();
    const [due, total, reviewedToday, recentLogs] = await Promise.all([
        countDueCards(userId, now),
        countTotalCards(userId),
        countReviewsToday(userId),
        findRecentReviewDays(userId, STREAK_LOOKBACK_DAYS),
    ]);

    const streak = computeStreak(recentLogs.map((log) => log.reviewedAt));

    return { dueCount: due, totalCards: total, reviewedToday, streak };
}

/**
 * Grades a FLASHCARD card and reschedules it via SM-2.
 *
 * @param userId - Must own the card being reviewed
 * @param cardId - Review card being graded
 * @param grade - AGAIN / HARD / GOOD / EASY (the learner's self-assessment)
 * @returns The rescheduled card
 * @throws {NotFoundError} When the card doesn't exist or belongs to another user
 * @throws {ValidationError} When the card is a QUIZ card (use `submitQuizAnswer` instead)
 *
 */
export async function submitReview(
    userId: string,
    cardId: string,
    grade: ReviewGrade,
) {
    const card = await findReviewCardById(cardId);
    if (!card || card.userId !== userId) {
        throw new NotFoundError("Review card not found");
    }
    if (card.cardType !== "FLASHCARD") {
        throw new ValidationError(
            "This is a quiz card — submit an answer instead of a grade",
        );
    }
    if (!["AGAIN", "HARD", "GOOD", "EASY"].includes(grade)) {
        throw new ValidationError("Invalid grade");
    }

    return applySchedule(userId, card, grade);
}

/**
 * Grades a QUIZ card objectively: the learner picks one of the card's
 * `options`, correctness against `correctIndex` maps automatically to a
 * grade (GOOD when correct, AGAIN when incorrect) and reschedules via the
 * same SM-2 curve as flashcards.
 *
 * @param userId - Must own the card being reviewed
 * @param cardId - Review card being answered
 * @param selectedIndex - Index into the card's `options` array the learner picked
 * @returns The rescheduled card plus whether the answer was correct
 * @throws {NotFoundError} When the card doesn't exist or belongs to another user
 * @throws {ValidationError} When the card is a FLASHCARD card, or the index is out of range
 *
 */
export async function submitQuizAnswer(
    userId: string,
    cardId: string,
    selectedIndex: number,
) {
    const card = await findReviewCardById(cardId);
    if (!card || card.userId !== userId) {
        throw new NotFoundError("Review card not found");
    }
    if (card.cardType !== "QUIZ") {
        throw new ValidationError(
            "This is a flashcard — submit a grade instead of an answer",
        );
    }
    if (
        !Number.isInteger(selectedIndex) ||
        selectedIndex < 0 ||
        selectedIndex >= card.options.length
    ) {
        throw new ValidationError("selectedIndex is out of range");
    }

    const correct = selectedIndex === card.correctIndex;
    const grade: ReviewGrade = correct ? "GOOD" : "AGAIN";

    const updated = await applySchedule(userId, card, grade);

    return { card: updated, correct, correctIndex: card.correctIndex };
}

async function applySchedule(
    userId: string,
    card: Awaited<ReturnType<typeof findReviewCardById>>,
    grade: ReviewGrade,
) {
    if (!card) throw new NotFoundError("Review card not found");

    const now = new Date();
    const next = scheduleNextReview(
        {
            easeFactor: card.easeFactor,
            intervalDays: card.intervalDays,
            repetitions: card.repetitions,
        },
        grade,
        now,
    );

    const [updated] = await Promise.all([
        updateReviewCardSchedule(card.id, {
            easeFactor: next.easeFactor,
            intervalDays: next.intervalDays,
            repetitions: next.repetitions,
            dueAt: next.dueAt,
            lastReviewedAt: now,
            lastGrade: grade,
        }),
        createReviewLog(userId, card.id, grade),
    ]);

    return updated;
}
