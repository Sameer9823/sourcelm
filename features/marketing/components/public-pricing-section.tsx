"use client";

import { useRouter } from "next/navigation";
import { authRoutes } from "@/features/auth/lib/auth-routes";
import { PricingSection } from "./pricing-section";

export function PublicPricingSection() {
    const router = useRouter();
    const goToSignIn = () => router.push(authRoutes.login);

    return (
        <PricingSection onSelectPack={goToSignIn} onSelectPlan={goToSignIn} />
    );
}
