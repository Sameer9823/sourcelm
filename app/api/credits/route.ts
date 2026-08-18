import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { getBalance, listTransactions } from "@/src/server/lib/credits";

export const GET = withRoute(async () => {
    const session = await requireSession();
    const [balance, transactions] = await Promise.all([
        getBalance(session.user.id),
        listTransactions(session.user.id),
    ]);
    return NextResponse.json({ balance, transactions });
});
