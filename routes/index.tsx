import { FreshContext, Handlers } from "$fresh/server.ts";
import { ComponentProps, ComponentChild } from "preact";

import {
  listPixiecoreBootAttempts,
  listPixiecoreParams,
  listDiscoveryInfo,
  listProvisionInfo,
  listProvisionStatus,
  setPixiecoreParams,
  deletePixiecoreParams,
} from "~/lib/db.ts";

import { Button } from "~/components/Button.tsx";

const actions = {
  async allow(mac: string) {
    await setPixiecoreParams(mac, {
      kernel: "something",
      cmdline: [],
      initrd: [],
    });
  },
  async disallow(mac: string) {
    await deletePixiecoreParams(mac);
  },
};

export const handler: Handlers = {
  async POST(req, _ctx) {
    const data = await req.formData();
    req.headers.get("Content-Type") === "application/x-www-form-urlencoded";

    for (const [action, value] of data.entries()) {
      await actions[action as keyof typeof actions](value.toString());
    }

    return Response.redirect(req.url);
  },
};

export default async function Home(_req: Request, _ctx: FreshContext) {
  const bootAttempts = await listPixiecoreBootAttempts();
  const bootParams = await listPixiecoreParams();
  const discoveryInfo = await listDiscoveryInfo();
  const provisionInfo = await listProvisionInfo();
  const provisionStatus = await listProvisionStatus();

  return (
    <form method="POST">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <Card heading="Boot attempts">
            <ul>
              {bootAttempts.map(([mac, attempts]) => (
                <li class="flex justify-between">
                  <span>
                    {mac}: {attempts.toString()}
                  </span>
                  <Button name="allow" value={mac}>
                    Allow
                  </Button>
                </li>
              ))}
            </ul>
          </Card>

          <Card heading="Boot params">
            <ul>
              {bootParams.map(([mac, params]) => (
                <li class="flex justify-between">
                  <div>
                    {mac}: <pre>{JSON.stringify(params, null, 2)}</pre>
                  </div>
                  <Button name="disallow" value={mac}>
                    Disallow
                  </Button>
                </li>
              ))}
            </ul>
          </Card>

          <Card heading="Discovery Info">
            <ul>
              {discoveryInfo.map((info) => (
                <li>{info.mac}</li>
              ))}
            </ul>
          </Card>

          <Card heading="Provision Info">
            <ul>
              {provisionInfo.map((info) => (
                <li>
                  {info.mac} - {info.name}
                </li>
              ))}
            </ul>
          </Card>

          <Card heading="Provision Status">
            <ul>
              {provisionStatus.map((info) => (
                <li>{info.name}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </form>
  );
}

function Card({
  children,
  heading,
  ...rest
}: { heading: ComponentChild } & ComponentProps<"div">) {
  return (
    <div {...rest} class="p-4 border-solid shadow-md w-full">
      <h2 class="mb-2 text-xl border-b-2 w-full">{heading}</h2>
      {children}
    </div>
  );
}
