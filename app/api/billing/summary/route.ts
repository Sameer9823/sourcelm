import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { getBillingSummary } from "@/src/server/services/billing.service";
import {
    CREDIT_PACKS,
    SUBSCRIPTION_PLANS,
} from "@/src/server/lib/credits-config";

export const GET = withRoute(async () => {
    const session = await requireSession();
    const summary = await getBillingSummary(session.user.id);
    return NextResponse.json({
        ...summary,
        packs: CREDIT_PACKS,
        plans: SUBSCRIPTION_PLANS,
    });
});
