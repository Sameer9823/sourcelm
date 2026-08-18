/**
 * Better Auth server configuration.
 *
 * Handles Google OAuth and session persistence via Prisma/PostgreSQL.
 * Mounted at `app/api/auth/[...all]/route.ts`.
 *
 * Required env vars: `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
 * Optional: `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { SIGNUP_BONUS_CREDITS } from "./credits-config";
import { grantCredits } from "./credits";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? appUrl,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [appUrl],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    // Every new account starts with free credits so people can try
                    // chat + source ingestion before hitting a paywall.
                    await grantCredits({
                        userId: user.id,
                        amount: SIGNUP_BONUS_CREDITS,
                        type: "SIGNUP_BONUS",
                        description: "Welcome bonus",
                    });
                },
            },
        },
    },
});
