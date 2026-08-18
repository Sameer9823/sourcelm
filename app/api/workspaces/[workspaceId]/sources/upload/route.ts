import { NextResponse } from "next/server";
import { withRoute, requireSession } from "@/src/server/lib/http";
import { uploadPdfSource } from "@/src/server/services/source.service";
import { ValidationError } from "@/src/server/types/app-error";
import { workspaceIdParamSchema } from "@/src/server/validators/source.validator";

type Params = { workspaceId: string };

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

// Replaces the old multer middleware: Next.js route handlers read
// multipart/form-data directly off the Web Request via `.formData()`.
export const POST = withRoute<Params>(async (req, { params }) => {
    const session = await requireSession();
    const { workspaceId } = workspaceIdParamSchema.parse(await params);

    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title");

    if (!(file instanceof File)) {
        throw new ValidationError("PDF file is required");
    }
    if (file.type !== "application/pdf") {
        throw new ValidationError("Only PDF files are allowed");
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
        throw new ValidationError("PDF must be under 10MB");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const source = await uploadPdfSource(
        workspaceId,
        session.user.id,
        { buffer, originalname: file.name },
        typeof title === "string" ? title : undefined,
    );

    return NextResponse.json(source, { status: 201 });
});
