import { apiFetch } from "@/shared/lib/api";
import type { QuizAnswerResult, ReviewCard, ReviewGrade, ReviewStats } from "./types";

export function getReviewQueue() {
    return apiFetch<ReviewCard[]>("/api/review/queue");
}

export function getReviewStats() {
    return apiFetch<ReviewStats>("/api/review/stats");
}

export function submitReview(cardId: string, grade: ReviewGrade) {
    return apiFetch<ReviewCard>(`/api/review/${cardId}`, {
        method: "POST",
        body: JSON.stringify({ grade }),
    });
}

export function submitQuizAnswer(cardId: string, selectedIndex: number) {
    return apiFetch<QuizAnswerResult>(`/api/review/${cardId}/answer`, {
        method: "POST",
        body: JSON.stringify({ selectedIndex }),
    });
}
