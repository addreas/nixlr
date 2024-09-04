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

export default async function Home(req: Request, _ctx: FreshContext) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());

  const bootAttempts = await listPixiecoreBootAttempts();
  const bootParams = await listPixiecoreParams();
  const discoveryInfo = await listDiscoveryInfo();
  const provisionInfo = await listProvisionInfo();
  const provisionStatus = await listProvisionStatus();

  return (
    <div class="px-4 py-8 mx-auto">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center prose">
        <Card heading="Boot attempts">
          <ul>
            {bootAttempts.map(([mac, attempts]) => (
              <li class="flex justify-between">
                <span>
                  {mac}: {attempts.toString()}
                </span>
                <a class="btn btn-primary" href={`?allowForm=1&mac=${mac}`}>
                  Allow
                </a>
              </li>
            ))}
          </ul>
        </Card>
        {params.allowForm && (
          <form action="/api/nixlr/v1/discovery/allow" method="POST">
            <aside class="fixed z-10 bg-base-300 flex flex-col gap-5 p-5 top-0 right-0 bottom-0">
              <h2>Setup system for PXE boot</h2>
              <label class="form-control w-full">
                <div class="label">
                  <span class="label-text">MAC:</span>
                </div>
                <input
                  class="input input-bordered"
                  type="text"
                  name="mac"
                  readOnly
                  value={params.mac}
                />
              </label>

              <label class="form-control w-full">
                <div class="label">
                  <span class="label-text">Hostname:</span>
                </div>
                <input
                  class="input input-bordered"
                  type="text"
                  name="hostname"
                  placeholder="hostname"
                  defaultValue={getName()}
                />
              </label>

              <label class="form-control w-full">
                <div class="label">
                  <span class="label-text">System flake</span>
                </div>
                <input
                  class="input input-bordered"
                  type="text"
                  name="systemFlake"
                  placeholder="github:org/flake#system-name"
                  defaultValue=".#nixosConfigurations.nixl-pxe-provision"
                />
              </label>

              <label class="form-control w-full">
                <div class="label">
                  <span class="label-text">Nixlr API</span>
                </div>
                <input
                  class="input input-bordered"
                  type="text"
                  name="api"
                  value={`${url.protocol}//${url.host}/`}
                />
              </label>
              <Button type="submit" class="btn btn-primary">
                Allow
              </Button>
            </aside>
          </form>
        )}

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
