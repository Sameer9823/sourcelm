import { requireAuth } from "@/features/auth";
import { ReviewSession } from "@/features/review";

export default async function ReviewPage() {
    await requireAuth();
    return <ReviewSession />;
}
