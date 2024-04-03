import { defineRoute } from "$fresh/src/server/defines.ts";
import { listProvisionInfo } from "~/lib/db.ts";

export default defineRoute(async (_req) => {
    const list = await listProvisionInfo()
    return Response.json(list)
});
