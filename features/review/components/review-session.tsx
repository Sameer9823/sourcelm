"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckCircle2Icon, FlameIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { workspaceRoutes } from "@/features/workspaces/lib/routes";
import {
    useReviewQueue,
    useReviewStats,
    useSubmitQuizAnswer,
    useSubmitReview,
} from "../hooks/use-review";
import type { ReviewCard, ReviewGrade } from "../lib/types";

const GRADE_BUTTONS: {
    grade: ReviewGrade;
    label: string;
    hint: string;
    className: string;
}[] = [
    {
        grade: "AGAIN",
        label: "Again",
        hint: "< 1 day",
        className: "bg-destructive/10 text-destructive hover:bg-destructive/20",
    },
    {
        grade: "HARD",
        label: "Hard",
        hint: "1-3 days",
        className: "bg-accent hover:bg-accent/70",
    },
    {
        grade: "GOOD",
        label: "Good",
        hint: "~6 days",
        className: "bg-primary/10 text-primary hover:bg-primary/20",
    },
    {
        grade: "EASY",
        label: "Easy",
        hint: "weeks",
        className: "bg-leaf/10 text-leaf hover:bg-leaf/20",
    },
];

export function ReviewSession() {
    const { data: queue, isLoading } = useReviewQueue();
    const { data: stats } = useReviewStats();

    const [position, setPosition] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);

    const current = queue?.[position];

    function advance() {
        setCompletedCount((count) => count + 1);
        setPosition((index) => index + 1);
    }

    return (
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 p-6">
            <div className="flex items-center justify-between gap-3">
                <Button
                    nativeButton={false}
                    variant="ghost"
                    size="icon-sm"
                    render={<Link href={workspaceRoutes.list} />}
                >
                    <ArrowLeftIcon />
                </Button>
                <h1 className="font-heading text-lg font-semibold">Review</h1>
                {stats ? (
                    <span className="flex items-center gap-1 font-ledger text-sm text-muted-foreground">
                        <FlameIcon className="size-4 text-primary" />
                        {stats.streak}
                    </span>
                ) : (
                    <span className="w-8" />
                )}
            </div>

            {isLoading ? (
                <Skeleton className="h-72 w-full rounded-3xl" />
            ) : !queue || queue.length === 0 ? (
                <EmptyState />
            ) : !current ? (
                <SessionComplete count={completedCount} />
            ) : (
                <>
                    <p className="text-center text-xs text-muted-foreground">
                        {current.workspace.title} · {current.artifact.title}
                        {"  ·  "}
                        {position + 1} of {queue.length}
                    </p>

                    {current.cardType === "QUIZ" ? (
                        <QuizCard
                            key={current.id}
                            card={current}
                            onDone={advance}
                        />
                    ) : (
                        <FlashcardCard
                            key={current.id}
                            card={current}
                            onDone={advance}
                        />
                    )}
                </>
            )}
        </div>
    );
}

function FlashcardCard({
    card,
    onDone,
}: {
    card: ReviewCard;
    onDone: () => void;
}) {
    const [flipped, setFlipped] = useState(false);
    const submitReview = useSubmitReview();

    function handleGrade(grade: ReviewGrade) {
        submitReview.mutate({ cardId: card.id, grade });
        onDone();
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setFlipped((value) => !value)}
                className="flex min-h-64 flex-1 flex-col items-center justify-center gap-4 rounded-3xl border bg-card p-8 text-center transition-shadow hover:shadow-sm"
            >
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {flipped ? "Answer" : "Question — tap to flip"}
                </span>
                <p className="text-balance font-heading text-xl font-medium leading-snug">
                    {flipped ? card.back : card.front}
                </p>
            </button>

            {flipped ? (
                <div className="grid grid-cols-4 gap-2">
                    {GRADE_BUTTONS.map((button) => (
                        <button
                            key={button.grade}
                            type="button"
                            onClick={() => handleGrade(button.grade)}
                            className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-3 text-sm font-medium transition-colors ${button.className}`}
                        >
                            {button.label}
                            <span className="text-[10px] font-normal opacity-70">
                                {button.hint}
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-center text-xs text-muted-foreground">
                    Try to recall the answer, then tap the card.
                </p>
            )}
        </>
    );
}

function QuizCard({
    card,
    onDone,
}: {
    card: ReviewCard;
    onDone: () => void;
}) {
    const [selected, setSelected] = useState<number | null>(null);
    const [result, setResult] = useState<{ correct: boolean } | null>(null);
    const submitAnswer = useSubmitQuizAnswer();

    async function handleSelect(index: number) {
        if (selected !== null) return;
        setSelected(index);

        try {
            const response = await submitAnswer.mutateAsync({
                cardId: card.id,
                selectedIndex: index,
            });
            setResult({ correct: response.correct });
        } catch {
            // Undo the optimistic disable so the card isn't a dead end —
            // the global mutation handler already surfaced a toast with
            // the actual error.
            setSelected(null);
        }
    }

    return (
        <>
            <div className="flex min-h-64 flex-1 flex-col justify-center gap-5 rounded-3xl border bg-card p-8">
                <p className="text-balance text-center font-heading text-xl font-medium leading-snug">
                    {card.front}
                </p>

                <div className="grid gap-2">
                    {card.options.map((option, index) => {
                        const isCorrectOption = index === card.correctIndex;
                        const isSelected = index === selected;

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => void handleSelect(index)}
                                disabled={selected !== null}
                                className={cn(
                                    "rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
                                    selected === null &&
                                        "hover:border-primary/50 hover:bg-accent/40",
                                    selected !== null &&
                                        isCorrectOption &&
                                        "border-leaf bg-leaf/10 text-leaf",
                                    selected !== null &&
                                        isSelected &&
                                        !isCorrectOption &&
                                        "border-destructive bg-destructive/10 text-destructive",
                                )}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>

                {result ? (
                    <p className="text-center text-sm text-muted-foreground">
                        {result.correct
                            ? "Correct — nice recall."
                            : "Not quite."}
                        {card.explanation ? ` ${card.explanation}` : ""}
                    </p>
                ) : (
                    <p className="text-center text-xs text-muted-foreground">
                        Pick an answer — grading is automatic.
                    </p>
                )}
            </div>

            {result ? (
                <Button onClick={onDone} className="w-full">
                    Continue
                </Button>
            ) : null}
        </>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed p-10 text-center">
            <CheckCircle2Icon className="size-8 text-leaf" />
            <p className="font-medium">Nothing due right now</p>
            <p className="max-w-xs text-sm text-muted-foreground">
                Generate flashcards or a quiz from a workspace&apos;s Learn tab
                and they&apos;ll show up here on their own review schedule.
            </p>
        </div>
    );
}

function SessionComplete({ count }: { count: number }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-3xl border bg-card p-10 text-center">
            <CheckCircle2Icon className="size-8 text-leaf" />
            <p className="font-heading text-lg font-semibold">
                Session complete
            </p>
            <p className="text-sm text-muted-foreground">
                Reviewed {count} {count === 1 ? "card" : "cards"}. Come back
                tomorrow to keep the streak going.
            </p>
        </div>
    );
}
