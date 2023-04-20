import $, { CommandResult } from "https://deno.land/x/dax@0.30.1/mod.ts";
import { reqJson } from "./util.ts";

type ProvisionInfo = {
  hostname: string;
  hostFlakeRepo: string; // "git@github.com:addreas/flakefiles.git"
  deployKeyPath: string; // "/etc/ssh/ssh_host_ed25519_key"

  blockDevices: BlockDevice[];
  fileSystems: Filesystem[];
  mounts: Mount[];
};

type BlockDevice = {
  device: string;
  label: "gpt" | "dos";
  partitions: {
    label: string;
    type: string;
    start: string;
    end: string;
    flags: string[];
  }[];
};

type Filesystem = {}; // TODO: fs config types
type Mount = {}; // TODO: mount config types

// TODO: what phases actually make sense?
type ProvisionStatus = { ok: boolean } & (
  | {
      phase: "partitioning";
      device: string;
      commands: string[];
      output: CommandResult;
    }
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


  // TODO: this seems ripe for abstraction
  await partition(api, info);
  await filesystems(api, info);
  await mounts(api, info);

  await generateConfig(api, info);

  await sshKeygen(api, info);
  await cloneRepo(api, info);
  await copyGeneratedToRepo(api, info);

  await install(api, info);
  await $`reboot`;
}

async function reportStatus(
  api: string,
  info: ProvisionInfo,
  status: ProvisionStatus
) {
  await fetch(
    `${api}/install-status/${info.hostname}/${status.phase}`,
    reqJson("PUT", status)
  );

  if (!status.ok) {
    throw new Error(`command failed in phase ${status.phase}`);
  }
}

async function partition(api: string, info: ProvisionInfo) {
  for (const { device, label, partitions } of info.blockDevices) {
    const commands = [
      `mklabel ${label}`,
      ...partitions.map(
        ({ label, type, start, end }) =>
          `mkpart ${label} ${type} ${start} ${end}`
      ),
      ...partitions.flatMap(({ flags }, index) =>
        flags.map((flag) => `set ${index} ${flag} on`)
      ),
    ];

    console.log("running parted script:", "\n  ", commands.join("\n  "));

    const output = await $`parted --script ${device} ${commands.join(" ")}`; // partition disks
    await reportStatus(api, info, {
      phase: "partitioning",
      ok: output.code == 0,
      device,
      commands,
      output,
    });
  }
}

async function filesystems(api: string, info: ProvisionInfo) {} // TODO: fs provisioning
async function mounts(api: string, info: ProvisionInfo) {} // TODO: mount porvisioning

async function sshKeygen(api: string, info: ProvisionInfo) {
  const output = await $`
    ssh-keygen -t ed25519 \
      -C ${info.hostname} \
      -f ${info.deployKeyPath}`;

  await reportStatus(api, info, {
    phase: "ssh-keygen",
    ok: output.code == 0,
    output,
  });

  await $`chmod 600 ${info.deployKeyPath}.pub`;

  const response = await fetch(`${api}/deploy-key/${info.hostname}`, {
    method: "POST",
    body: await Deno.readTextFile(`${info.deployKeyPath}.pub`),
  });
  await reportStatus(api, info, {
    phase: "key-publishing",
    ok: response.ok,
    response,
  });
}

async function generateConfig(api: string, info: ProvisionInfo) {
  // TODO: whats the actual nixos-generate-config --output-dir flag?
  await $`
    nixos-generate-config --root $MNT --output-dir /etc/nixos-generated
  `;
}

async function cloneRepo(api: string, info: ProvisionInfo) {
  const output = await $`git clone ${info.hostFlakeRepo} -o /etc/nixos`.env(
    "GIT_SSH_COMMAND",
    `ssh -i ${info.deployKeyPath}`
  );
  await reportStatus(api, info, {
    phase: "repo-cloning",
    ok: output.code == 0,
    output,
  });
}

async function copyGeneratedToRepo(api: string, info: ProvisionInfo) {
  const output = await $`
    cp /etc/nixos-generated/hardware-config.nix .
    git add hardware-config.nix
    git commit -am "add generated hardware-config.nix for ${info.hostname}"
    git push`.cwd(`/etc/nixos/machines/${info.hostname}`);
  await reportStatus(api, info, {
    phase: "repo-updating",
    ok: output.code == 0,
    output,
  });
}

async function install(api: string, info: ProvisionInfo) {
  const output = await $`
    nixos-install
      --root $MNT \
      --no-root-password \
      --option extra-experimental-features auto-allocate-uids \
      --option extra-experimental-features cgroups \
      --flake "$MNT/etx/nixos#${info.hostname}"`;
  await reportStatus(api, info, {
    phase: "install",
    ok: output.code == 0,
    output,
  });
}
