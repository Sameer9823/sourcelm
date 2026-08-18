import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { createMemoryForUser } from "@/src/server/services/memory.service";
import { listUserMemories } from "@/src/server/lib/mem0";
import { createMemorySchema } from "@/src/server/validators/memory.validator";

export const GET = withRoute(async () => {
    const session = await requireSession();
    const memories = await listUserMemories(session.user.id);
    return NextResponse.json(memories);
});

export const POST = withRoute(async (req) => {
    const session = await requireSession();
    const input = createMemorySchema.parse(await req.json());
    const memory = await createMemoryForUser(session.user.id, input);
    return NextResponse.json(memory, { status: 201 });
});
