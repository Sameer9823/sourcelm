export type ReviewGrade = "AGAIN" | "HARD" | "GOOD" | "EASY";

export type ReviewCardType = "FLASHCARD" | "QUIZ";

export type ReviewCard = {
    id: string;
    userId: string;
    workspaceId: string;
    artifactId: string;
    cardIndex: number;
    cardType: ReviewCardType;
    front: string;
    back: string;
    options: string[];
    correctIndex: number | null;
    explanation: string | null;
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    dueAt: string;
    lastReviewedAt: string | null;
    lastGrade: ReviewGrade | null;
    artifact: { title: string };
    workspace: { id: string; title: string };
};

export type QuizAnswerResult = {
    card: ReviewCard;
    correct: boolean;
    correctIndex: number;
};

export type ReviewStats = {
    dueCount: number;
    totalCards: number;
    reviewedToday: number;
    streak: number;
};
