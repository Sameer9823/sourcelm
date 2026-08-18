import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { getReviewStats } from "@/src/server/services/review.service";

export const GET = withRoute(async () => {
    const session = await requireSession();
    const stats = await getReviewStats(session.user.id);
    return NextResponse.json(stats);
});
