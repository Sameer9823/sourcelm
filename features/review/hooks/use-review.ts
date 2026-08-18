"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReviewQueue, getReviewStats, submitQuizAnswer, submitReview } from "../lib/api";
import type { ReviewGrade } from "../lib/types";

export function useReviewQueue() {
    return useQuery({
        queryKey: ["review", "queue"],
        queryFn: getReviewQueue,
    });
}

export function useReviewStats() {
    return useQuery({
        queryKey: ["review", "stats"],
        queryFn: getReviewStats,
        staleTime: 30_000,
    });
}

export function useSubmitReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ cardId, grade }: { cardId: string; grade: ReviewGrade }) =>
            submitReview(cardId, grade),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["review", "stats"] });
        },
    });
}

export function useSubmitQuizAnswer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            cardId,
            selectedIndex,
        }: {
            cardId: string;
            selectedIndex: number;
        }) => submitQuizAnswer(cardId, selectedIndex),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["review", "stats"] });
        },
    });
}
