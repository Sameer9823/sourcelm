/**
 * Next.js route-handler adapter layer.
 *
 * The Express server used a controller/service/repository split where only the
 * controllers touched `req`/`res`. Services and repositories were framework-agnostic,
 * so porting to Next.js Route Handlers only required replacing the controller layer.
 *
 * `withRoute` gives every handler the same error mapping the old `errorHandler`
 * Express middleware provided (AppError, ZodError -> proper status codes).
 * `requireSession` replaces `requireAuth` middleware.
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError, flattenError } from "zod";
import { auth } from "./auth";
import { AppError } from "../types/app-error";
import type { Session } from "./session";

export async function requireSession(): Promise<Session> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new AppError(401, "Unauthorized");
    }

    return session as Session;
}

type RouteContext<P> = { params: Promise<P> };

/**
 * Wraps a Next.js route handler with the same error -> HTTP status mapping the
 * Express `errorHandler` middleware used to provide.
 */
export function withRoute<P = Record<string, string>>(
    handler: (req: Request, ctx: RouteContext<P>) => Promise<Response>,
) {
    return async (req: Request, ctx: RouteContext<P>) => {
        try {
            return await handler(req, ctx);
        } catch (error) {
            if (error instanceof AppError) {
                return NextResponse.json(
                    { error: error.message, details: error.details },
                    { status: error.statusCode },
                );
            }

            if (error instanceof ZodError) {
                return NextResponse.json(
                    {
                        error: "Validation failed",
                        details: flattenError(error).fieldErrors,
                    },
                    { status: 400 },
                );
            }

            const namedError = error as Error & {
                http_code?: number;
                name?: string;
            };

            if (
                namedError.name === "UnexpectedResponse" &&
                namedError.http_code === 403
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Cloudinary upload rejected: your API key is missing Upload (create) permission.",
                    },
                    { status: 400 },
                );
            }

            console.error(error);
            return NextResponse.json(
                { error: "Internal server error" },
                { status: 500 },
            );
        }
    };
}

/** Small helper for parsing `?a=b&c=d` query params into a plain object for zod. */
export function queryToObject(url: string): Record<string, string> {
    const { searchParams } = new URL(url);
    return Object.fromEntries(searchParams.entries());
}
