import { defineRoute } from "$fresh/server.ts";
import { getPixiecoreParams } from "~/lib/db.ts";

export default defineRoute(async (_, ctx) => {
  try {
    const params = await getPixiecoreParams(ctx.params.mac);
    return Response.json(params);
  } catch {
    return new Response(null, { status: 404 });
  }
});
