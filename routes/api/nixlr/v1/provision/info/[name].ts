import { Handlers } from "$fresh/server.ts";
import { getProvisionInfo, setProvisionInfo } from "~/lib/db.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const info = await getProvisionInfo(ctx.params.name)
    return Response.json(info);
  },
  async PUT(req, ctx) {
    const data = await req.json()
    await setProvisionInfo(ctx.params.name, data)
    return Response.json(data);
  },
};
