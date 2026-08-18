import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { submitReview } from "@/src/server/services/review.service";
import {
    cardIdParamSchema,
    submitReviewSchema,
} from "@/src/server/validators/review.validator";

type Params = { cardId: string };

export const POST = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { cardId } = cardIdParamSchema.parse(await params);
    const { grade } = submitReviewSchema.parse(await req.json());
    const updated = await submitReview(session.user.id, cardId, grade);
    return NextResponse.json(updated);
});
