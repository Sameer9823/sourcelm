import { requireAuth } from "@/features/auth";
import { BillingPageClient } from "@/features/billing/components/billing-page-client";

export default async function BillingPage() {
    await requireAuth();
    return <BillingPageClient />;
}
