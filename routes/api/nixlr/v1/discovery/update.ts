import { Handlers } from "$fresh/server.ts";
import { setDiscoveryInfo } from "~/lib/db.ts";
import { DiscoveryInfo } from "~/types/discovery.ts";

export const handler: Handlers = {
  async PUT(req, _ctx) {
    const data: DiscoveryInfo = await req.json();
    // TODO: validate data :)
    await setDiscoveryInfo(data.hostname, data);
    return Response.json(data);
  },
};
