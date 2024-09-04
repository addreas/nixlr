import $ from "https://deno.land/x/dax@0.30.1/mod.ts";

import { ProvisionInfo } from "../types/provision.ts";
import { discovery } from "./discovery.ts";

export async function provision(api: string, hostname: string) {
  await sendDiscovery(api, hostname)
    .then(() => getProvisionInfo(api, hostname))
    .then((info) => runInstallScript(api, hostname, info))
    .catch((error) => sendEvent(api, hostname, "provision", { error }));

  await $`reboot`;
}

async function runInstallScript(
  api: string,
  hostname: string,
  info: ProvisionInfo
) {
  const { code, stdout, stderr } = await $`${info.installScript}`
    .env({
      GIT_SSH_COMMAND: `ssh -i /tmp/id_ed25519`,
      HOSTNAME: info.hostname,
      NIXLR_API: info.api,
    })
    .noThrow(true)
    .captureCombined(true);

  await sendEvent(api, hostname, "install-script", { code, stdout, stderr });

  await Deno.mkdir("/mnt/root/.ssh");
  await Deno.copyFile("/tmp/id_ed25519", "/mnt/rooot/.ssh/id_ed25519");
  await Deno.copyFile("/tmp/id_ed25519.pub", "/mnt/rooot/.ssh/id_ed25519.pub");
}

async function sendDiscovery(api: string, hostname: string) {
  try {
    const discoveryInfo = await discovery(hostname);
    await $.request(`${api}/api/nixlr/v1/discovery/${hostname}`)
      .method("PUT")
      .header("Content-Type", "application/json")
      .body(JSON.stringify(discoveryInfo));
  } catch (error) {
    await sendEvent(api, hostname, "discovery", { error });
    await $`reboot`; // surely a reboot will help!
  }
}

async function getProvisionInfo(api: string, hostname: string) {
  const infoUrl = `${api}/api/nixlr/v1/provision/${hostname}`;
  while (true) {
    try {
      return await $.request(infoUrl).json(); // the await here is significant to catch the error
    } catch (error) {
      await sendEvent(api, hostname, "provision", { error, retryIn: 60 });
      await new Promise((r) => setTimeout(r, 60 * 1000));
    }
  }
}

function sendEvent(
  api: string,
  hostname: string,
  event: string,
  data: unknown
) {
  return $.request(`${api}/api/nixlr/v1/events/${hostname}/${event}`)
    .method("POST")
    .header("Content-Type", "application/json")
    .body(JSON.stringify(data));
}
