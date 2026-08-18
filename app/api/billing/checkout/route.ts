import { NextResponse } from "next/server";
import { z } from "zod";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { createCheckoutSession } from "@/src/server/services/billing.service";

const bodySchema = z.object({
    kind: z.enum(["pack", "subscription"]),
    id: z.string().min(1),
});

export const POST = withRoute(async (req) => {
    const session = await requireSession();
    const { kind, id } = bodySchema.parse(await req.json());

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

    const checkout = await createCheckoutSession({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        kind,
        id,
        appUrl,
    });

    return NextResponse.json({ url: checkout.url });
});
