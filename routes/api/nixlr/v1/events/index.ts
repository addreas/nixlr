import { defineRoute } from "$fresh/src/server/defines.ts";
import { listProvisionStatus } from "~/lib/db.ts";

export default defineRoute(async (_req) => {
  const list = await listProvisionStatus();
  return Response.json(list);
});
