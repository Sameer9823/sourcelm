import { z } from "zod";

export const cardIdParamSchema = z.object({
    cardId: z.string().trim().min(1),
});

export const submitReviewSchema = z.object({
    grade: z.enum(["AGAIN", "HARD", "GOOD", "EASY"]),
});

export const submitQuizAnswerSchema = z.object({
    selectedIndex: z.number().int().min(0),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
export type SubmitQuizAnswerInput = z.infer<typeof submitQuizAnswerSchema>;
