import { serve } from "inngest/next";
import { inngest } from "@/src/server/inngest/client";
import { functions } from "@/src/server/inngest/index";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions,
});
