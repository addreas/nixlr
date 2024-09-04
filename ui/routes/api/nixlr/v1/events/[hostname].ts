import { Handlers } from "$fresh/server.ts";
import { getProvisionStatus } from "~/lib/db.ts";
import { addProvisionStatusEvent } from "~/lib/db.ts";
import { setProvisionStatus } from "~/lib/db.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const status = await getProvisionStatus(ctx.params.hostname);
    return Response.json(status);
  },
  async PUT(req, ctx) {
    const data = await req.json();
    // TODO: validate data :)
    await setProvisionStatus(ctx.params.hostname, data);
    return Response.json(data);
  },
  async POST(req, ctx) {
    const data = await req.json();
    // TODO: validate data :)
    await addProvisionStatusEvent(ctx.params.hostname, data);
    return Response.json(data);
  },
};
