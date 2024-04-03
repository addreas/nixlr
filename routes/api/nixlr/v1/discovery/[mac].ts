import { Handlers } from "$fresh/server.ts";
import { setDiscoveryInfo } from "~/lib/db.ts";

export const handler: Handlers = {
  async PUT(req, ctx) {
    const data = await req.json()
    // TODO: validate data :)
    await setDiscoveryInfo(ctx.params.mac, data)
    return Response.json(data);
  },
};
