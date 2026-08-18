import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { submitQuizAnswer } from "@/src/server/services/review.service";
import {
    cardIdParamSchema,
    submitQuizAnswerSchema,
} from "@/src/server/validators/review.validator";

type Params = { cardId: string };

export const POST = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { cardId } = cardIdParamSchema.parse(await params);
    const { selectedIndex } = submitQuizAnswerSchema.parse(await req.json());
    const result = await submitQuizAnswer(session.user.id, cardId, selectedIndex);
    return NextResponse.json(result);
});
