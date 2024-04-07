import { Handlers } from "$fresh/server.ts";
import { bodyParser } from "~/lib/bodyparser.ts";
import { getPixiecoreParams } from "~/lib/build.ts";
import { setPixiecoreParams, setHostMac } from "~/lib/db.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const parsed = await bodyParser<{
      mac: string;
      hostname: string;
      api: string;
      systemFlake: string;
    }>(req);

    const { mac, hostname, api, systemFlake } = parsed;

    const params = await getPixiecoreParams(systemFlake, api, hostname);

    console.log(params);

    await setHostMac(hostname, mac);
    await setPixiecoreParams(mac, params);

    return new Response(null, {
      status: 303,
      headers: {
        Location: "/",
      },
    });
  },
};
