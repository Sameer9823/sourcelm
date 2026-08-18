import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { getReviewQueue } from "@/src/server/services/review.service";

export const GET = withRoute(async () => {
    const session = await requireSession();
    const queue = await getReviewQueue(session.user.id);
    return NextResponse.json(queue);
});
