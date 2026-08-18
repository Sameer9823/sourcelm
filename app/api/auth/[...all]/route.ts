import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/src/server/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
