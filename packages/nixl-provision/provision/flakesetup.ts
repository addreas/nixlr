import $, {
  CommandBuilder,
  build$,
} from "https://deno.land/x/dax@0.30.1/mod.ts";
import { ProvisionInfo } from "./types.ts";

export function sshKeygen(info: ProvisionInfo) {
  return [
    $`ssh-keygen -t ed25519 -C ${info.hostname} -f /mnt/${info.deployKeyPath}`,
    $`chmod 600 /mnt/${info.deployKeyPath}`,
    $`chmod 600 /mnt/${info.deployKeyPath}.pub`,
    $`curl -d /mnt/${info.deployKeyPath}.pub ${info.api}/deploy-key/${info.hostname}`,
  ];
}

export function generateConfig(_info: ProvisionInfo) {
  return [$`nixos-generate-config --root /mnt --dir /etc/nixos-generated`];
}

export function cloneRepo(info: ProvisionInfo) {
  const $ = build$({
    commandBuilder: new CommandBuilder().env({
      GIT_SSH_COMMAND: `ssh -i ${info.deployKeyPath}`,
    }),
  });
  return [$`git clone ${info.flakeRepo} -o /mnt/etc/nixos`];
}

export function copyGeneratedToRepo(info: ProvisionInfo) {
  const $ = build$({
    commandBuilder: new CommandBuilder().cwd(
      `/mnt/etc/nixos/${info.flakePath}`
    ),
  });
  return [
    $`cp /mnt/etc/nixos-generated/* ."`,
    $`git add .`,
    $`git commit -am "add generated config for ${info.hostname}`,
    $`git push`,
  ];
}
