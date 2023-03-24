import $, { CommandResult } from "https://deno.land/x/dax/mod.ts";
import { reqJson } from "./util.ts";

type ProvisionInfo = {
  hostname: string; // "hostname"
  hostFlakeRepo: string; // "git@github.com:addreas/flakefiles.git"
  deployKeyPath: string; // "/etc/ssh/ssh_host_ed25519_key"
};

type ProvisionStatus = { ok: boolean } & (
  | { phase: "partitioning"; output: CommandResult }
  | { phase: "ssh-keygen"; output: CommandResult }
  | { phase: "key-publishing"; response: Response }
  | { phase: "repo-cloning"; output: CommandResult }
  | { phase: "repo-updating"; output: CommandResult }
  | { phase: "install"; output: CommandResult }
);

export async function provision(api: string, mac: string) {
  const info: ProvisionInfo = await fetch(`${api}/provision/${mac}`).then((r) =>
    r.json()
  );

  let output = await $`parted ${"str generated from provisioninfo"}`; // partition disks
  await reportStatus(api, info, { phase: "partitioning", ok: output.code == 0, output });

  output = await $`ssh-keygen -C ${info.hostname} -t ed25519 -f ${info.deployKeyPath}`;
  await reportStatus(api, info, { phase: "ssh-keygen", ok: output.code == 0, output });

  const response = await fetch(`${api}/deploy-key/${info.hostname}`, {
    method: "POST",
    body: await Deno.readTextFile(`${info.deployKeyPath}.pub`),
  });
  await reportStatus(api, info, { phase: "key-publishing", ok: response.ok, response });

  output =
    await $`git clone ${info.hostFlakeRepo} -o /etc/nixos -I ${info.deployKeyPath}`;
  await reportStatus(api, info, { phase: "repo-cloning", ok: output.code == 0, output });

  output = await $`
    nixos-generate-config
    git add hardware-config
    git commit -am "generated hardware-config.nix"
    git push
  `;
  await reportStatus(api, info, { phase: "repo-updating", ok: output.code == 0, output });

  output = await $`nixos-install --magical --flags`;
  await reportStatus(api, info, { phase: "install", ok: output.code == 0, output });
}

async function reportStatus(
  api: string,
  info: ProvisionInfo,
  status: ProvisionStatus
) {
  await fetch(`${api}/install-status/${info.hostname}/${status.phase}`, reqJson("PUT", status));

  if (!status.ok) {
    throw new Error(`command failed in phase ${status.phase}`);
  }
}
