/**
 * Credit ledger.
 *
 * Every balance change goes through here so `CreditBalance.balance` and the
 * append-only `CreditTransaction` history can never drift apart. All writes
 * happen inside a single Prisma transaction with a row lock semantics
 * (upsert + conditional update) to stay correct under concurrent requests.
 */

import prisma from "./db";
import { Prisma } from "../../generated/prisma/client";
import { InsufficientCreditsError } from "../types/app-error";
import { CREDIT_COSTS, type CreditAction } from "./credits-config";
import type { CreditTransactionType } from "../../generated/prisma/client";

export async function getOrCreateBalance(userId: string) {
    return prisma.creditBalance.upsert({
        where: { userId },
        update: {},
        create: { userId, balance: 0 },
    });
}

export async function getBalance(userId: string): Promise<number> {
    const row = await getOrCreateBalance(userId);
    return row.balance;
}

export async function grantCredits(params: {
    userId: string;
    amount: number;
    type: CreditTransactionType;
    description: string;
    metadata?: Record<string, unknown>;
}) {
    const { userId, amount, type, description, metadata } = params;

    return prisma.$transaction(async (tx) => {
        const balance = await tx.creditBalance.upsert({
            where: { userId },
            update: { balance: { increment: amount } },
            create: { userId, balance: amount },
        });

        await tx.creditTransaction.create({
            data: {
                userId,
                type,
                amount,
                balanceAfter: balance.balance,
                description,
                metadata: (metadata ?? undefined) as Prisma.InputJsonValue,
            },
        });

        return balance;
    });
}

/**
 * Deducts credits for a metered action. Throws {@link InsufficientCreditsError}
 * if the user doesn't have enough — callers should run this check BEFORE doing
 * the expensive work (LLM call, embedding, etc.) wherever possible.
 */
export async function spendCredits(params: {
    userId: string;
    action: CreditAction;
    description: string;
    metadata?: Record<string, unknown>;
}) {
    const { userId, action, description, metadata } = params;
    const amount = CREDIT_COSTS[action];

    return prisma.$transaction(async (tx) => {
        const current = await tx.creditBalance.upsert({
            where: { userId },
            update: {},
            create: { userId, balance: 0 },
        });

        if (current.balance < amount) {
            throw new InsufficientCreditsError(amount, current.balance);
        }

        const updated = await tx.creditBalance.update({
            where: { userId },
            data: {
                balance: { decrement: amount },
                lifetimeSpent: { increment: amount },
            },
        });

        await tx.creditTransaction.create({
            data: {
                userId,
                type: "USAGE",
                amount: -amount,
                balanceAfter: updated.balance,
                description,
                metadata: (metadata ?? undefined) as Prisma.InputJsonValue,
            },
        });

        return updated;
    });
}

/** Refunds a spend, e.g. when generation fails after credits were deducted. */
export async function refundCredits(params: {
    userId: string;
    action: CreditAction;
    description: string;
    metadata?: Record<string, unknown>;
}) {
    const { userId, action, description, metadata } = params;
    return grantCredits({
        userId,
        amount: CREDIT_COSTS[action],
        type: "REFUND",
        description,
        metadata,
    });
}

/** Internal: grants credits within an existing transaction. */
export async function grantCreditsTx(
    tx: import("../../generated/prisma/client").Prisma.TransactionClient,
    params: {
        userId: string;
        amount: number;
        type: CreditTransactionType;
        description: string;
        metadata?: Record<string, unknown>;
    },
) {
    const { userId, amount, type, description, metadata } = params;

    const balance = await tx.creditBalance.upsert({
        where: { userId },
        update: { balance: { increment: amount } },
        create: { userId, balance: amount },
    });

    await tx.creditTransaction.create({
        data: {
            userId,
            type,
            amount,
            balanceAfter: balance.balance,
            description,
            metadata: (metadata ?? undefined) as import("../../generated/prisma/client").Prisma.InputJsonValue,
        },
    });

    return balance;
}

/** Internal: refunds credits within an existing transaction. */
export async function refundCreditsTx(
    tx: import("../../generated/prisma/client").Prisma.TransactionClient,
    params: {
        userId: string;
        action: CreditAction;
        description: string;
        metadata?: Record<string, unknown>;
    },
) {
    const { userId, action, description, metadata } = params;
    return grantCreditsTx(tx, {
        userId,
        amount: CREDIT_COSTS[action],
        type: "REFUND",
        description,
        metadata,
    });
}

export async function listTransactions(userId: string, limit = 50) {
    return prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}
