import $ from "https://deno.land/x/dax@0.30.1/mod.ts";
import { DiscoveryInfo } from "../types/discovery.ts";

import { convertLshwXmlOutput } from "./lshw.ts";

export async function discovery(hostname: string): Promise<DiscoveryInfo> {
  // https://maas.io/docs/commissioning-logs-reference
  // TODO: move abstract each command into `<command>.ts`
  return {
    "hardware-configuration.nix":
      await $`nixos-generate-config --no-filesystems --show-hardware-config`.text(),

    hostname,
    deployKey: await sshKeygen(hostname),

    lsblk: await $`lsblk --output-all --json`
      .json()
      .then(({ blockdevices }) => blockdevices), // util-linux
    ip: {
      // iproute2
      addr: await $`ip --json addr show`.json(),
      rule: await $`ip --json rule show`.json(),
      route: await $`ip --json route show`.json(),
    },
    lshw: convertLshwXmlOutput(await $`lshw -xml`.text()), // lshw
    lscpu: await $`lscpu --json --hierarchic=always`
      .json()
      .then((r) => r.lscpu), // util-linux
    // lspci: await $`lspci`.text(), // pciutils
    // lsusb: await $`lsusb`.text(), // usbutils
    // dmidecode: await $`dmidecode`.text(), // dmidecode
    // efibootmgr: await $`efibootmgr`.text(),  // efibootmgr
    // lldp: await $`lldpctl`.text(),  // lldpd (services.lldpd.enable)
  };
}

export async function sshKeygen(hostname: string) {
  await $`ssh-keygen -t ed25519 -C ${hostname} -f /tmp/id_ed25519`;

  await Deno.chmod("/tmp/id_ed25519", 0o600);
  await Deno.chmod("/tmp/id_ed25519.pub", 0o600);

  return Deno.readTextFile("/tmp/id_ed25519.pub");
}
