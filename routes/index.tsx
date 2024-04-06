import { FreshContext } from "$fresh/server.ts";

import {
  listPixiecoreBootAttempts,
  listPixiecoreParams,
  listDiscoveryInfo,
  listProvisionInfo,
  listProvisionStatus,
} from "~/lib/db.ts";

import { getName } from "~/lib/name-generator.ts";

import { Button } from "~/components/Button.tsx";
import { Card } from "~/components/Card.tsx";

export default async function Home(_req: Request, _ctx: FreshContext) {
  const bootAttempts = await listPixiecoreBootAttempts();
  const bootParams = await listPixiecoreParams();
  const discoveryInfo = await listDiscoveryInfo();
  const provisionInfo = await listProvisionInfo();
  const provisionStatus = await listProvisionStatus();

  return (
    <div class="px-4 py-8 mx-auto">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <Card heading="Boot attempts">
          <ul>
            {bootAttempts.map(([mac, attempts]) => (
              <form action="/api/nixlr/v1/discovery/allow" method="POST">
                <li class="flex justify-between">
                  <span>
                    {mac}: {attempts.toString()}
                  </span>
                  <input type="hidden" name="mac" value={mac} />
                  <input
                    type="text"
                    name="hostname"
                    placeholder="hostname"
                    defaultValue={getName()}
                  />
                  <Button>Allow</Button>
                </li>
              </form>
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
              <li>
                <pre>{JSON.stringify(info, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </Card>

        <Card heading="Provision Info">
          <ul>
            {provisionInfo.map((info) => (
              <li>
                <pre>{JSON.stringify(info, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </Card>

        <Card heading="Provision Status">
          <ul>
            {provisionStatus.map((info) => (
              <li>
                <pre>{JSON.stringify(info, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
