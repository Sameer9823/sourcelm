import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { updateMemoryForUser } from "@/src/server/services/memory.service";
import { deleteUserMemory } from "@/src/server/lib/mem0";
import {
    memoryIdParamSchema,
    updateMemorySchema,
} from "@/src/server/validators/memory.validator";

type Params = { memoryId: string };

export const PATCH = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { memoryId } = memoryIdParamSchema.parse(await params);
    const input = updateMemorySchema.parse(await req.json());
    const memory = await updateMemoryForUser(session.user.id, memoryId, input);
    return NextResponse.json(memory);
});

export const DELETE = withRoute<Params>(async (_req, { params }) => {
    const { memoryId } = memoryIdParamSchema.parse(await params);
    await requireSession();
    await deleteUserMemory(memoryId);
    return new NextResponse(null, { status: 204 });
});
