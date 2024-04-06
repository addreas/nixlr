import { Handlers } from "$fresh/server.ts";
import { bodyParser } from "~/lib/bodyparser.ts";
import { getPixiecoreParams } from "~/lib/build.ts";
import { setPixiecoreParams, setHostMac } from "~/lib/db.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const { mac, hostname } = await bodyParser<{
      mac: string;
      hostname: string;
    }>(req);

    const params = await getPixiecoreParams(
      ".#nixosConfigurations.nixl-pxe-provision",
      "http://localhost:8080/",
      hostname
    );

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
