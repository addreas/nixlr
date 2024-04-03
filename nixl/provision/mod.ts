import $, { CommandBuilder } from "https://deno.land/x/dax@0.30.1/mod.ts";

import { ProvisionInfo } from "~/types/provision.ts";

import { cloneRepo, sshKeygen } from "./flakesetup.ts";
import { discovery } from "~/nixl/provision/discovery/mod.ts";

export async function provision(api: string, hostname: string) {
  await sendDiscovery(api, hostname);

  const info: ProvisionInfo = await getProvisionInfo(api, hostname);

  await run("ssh-keygen", sshKeygen, info);
  // TODO: generate ssh ekys in tmp or whatever instead of /mnt that doesnt exist yet

  //  TODO: await deploy key approval

  await run("git-clone", cloneRepo, info);

  await run("disko-script", disko, info);
  await run("nixos-install", install, info);

  //TODO: move ssh keys to finished ssytem

  await $`reboot`;
}

function disko(info: ProvisionInfo) {
  return [
    $`nix run /mnt/etx/nixos#nixosConfigurations.${info.hostname}.config.system.build.diskoScript`,
  ];
}

function install(info: ProvisionInfo) {
  return [
    $`
    nixos-install
      --root /mnt \
      --no-root-password \
      --option extra-experimental-features auto-allocate-uids \
      --option extra-experimental-features cgroups \
      --flake /mnt/etx/nixos#${info.hostname}`,
  ];
}

async function run(
  phase: string,
  steps: (info: ProvisionInfo) => CommandBuilder[],
  info: ProvisionInfo
) {
  for (const command of steps(info)) {
    const output = await command.noThrow(true);

    await sendEvent(info.api, info.hostname, phase, {
      phase,
      command,
      ...output,
    });

    if (output.code !== 0) {
      throw new Error(`failed ${phase}`);
    }
  }
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
