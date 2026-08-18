import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { createBillingPortalSession } from "@/src/server/services/billing.service";

export const POST = withRoute(async (req) => {
    const session = await requireSession();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
    const portal = await createBillingPortalSession(session.user.id, appUrl);
    return NextResponse.json({ url: portal.url });
});
