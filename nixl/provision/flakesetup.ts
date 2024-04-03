import $, {
  CommandBuilder,
  build$,
} from "https://deno.land/x/dax@0.30.1/mod.ts";
import { ProvisionInfo } from "~/types/provision.ts";

export function sshKeygen(info: ProvisionInfo) {
  return [
    $`ssh-keygen -t ed25519 -C ${info.hostname} -f /mnt/${info.deployKeyPath}`,
    $`chmod 600 /mnt/${info.deployKeyPath}`,
    $`chmod 600 /mnt/${info.deployKeyPath}.pub`,
    $`curl -d /mnt/${info.deployKeyPath}.pub ${info.api}/deploy-key/${info.hostname}`,
  ];
}

export function cloneRepo(info: ProvisionInfo) {
  const $ = build$({
    commandBuilder: new CommandBuilder().env({
      GIT_SSH_COMMAND: `ssh -i ${info.deployKeyPath}`,
    }),
  });
  return [$`git clone ${info.flakeRepo} -o /mnt/etc/nixos`];
}
