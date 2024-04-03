import $, { CommandBuilder } from "https://deno.land/x/dax@0.30.1/mod.ts";

import { ProvisionInfo } from "./types.ts";

import { filesystems, mounts, partition } from "./blockfsmounts.ts";
import {
  cloneRepo,
  copyGeneratedToRepo,
  generateConfig,
  sshKeygen,
} from "./flakesetup.ts";

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

export async function provision(info: ProvisionInfo) {
  await run("partitions", partition, info);
  await run("filesystems", filesystems, info);
  await run("mounts", mounts, info);

  await run("generate-config", generateConfig, info);
  await run("ssh-keygen", sshKeygen, info);

  //  TODO: await deploy key approval

  await run("git-clone", cloneRepo, info);
  await run("git-update", copyGeneratedToRepo, info);

  await run("install", install, info);
  await $`reboot`;
}

async function run(
  phase: string,
  steps: (info: ProvisionInfo) => CommandBuilder[],
  info: ProvisionInfo
) {
  for (const command of steps(info)) {
    const output = await command.noThrow(true);

    $.request(`${info.api}/install-status/${info.hostname}/${phase}`)
      .method("POST")
      .header("Content-Type", "application/json")
      .body(JSON.stringify({ phase, command, ...output }));

    if (output.code !== 0) {
      throw new Error(`failed ${phase}`);
    }
  }
}
