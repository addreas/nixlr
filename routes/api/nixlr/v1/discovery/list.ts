import { defineRoute } from "$fresh/src/server/defines.ts";
import { listDiscoveryInfo } from "~/lib/db.ts";

export default defineRoute(async (_req) => {
    const list = await listDiscoveryInfo()
    return Response.json(list)
});
