import { Handlers } from "$fresh/server.ts";
import { bodyParser } from "~/lib/bodyparser.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const data = await bodyParser<{ mac: string; hostname: string }>(req);

    // remove bootparams for mac/hostname or just mark as disallowed?

    return new Response(null, {
      headers: {
        Location: "/",
      },
    });
  },
};
