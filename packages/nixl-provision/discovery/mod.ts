import $ from "https://deno.land/x/dax@0.30.1/mod.ts";

import { IpLink, IpRoute, IpRule } from "./ip.ts";
import { LsblkDev } from "./lsblk.ts";
import { reqJson } from "../util.ts";
import { convertLshwXmlOutput, LshwNode } from "./lshw.ts";

type DiscoveryInfo = {
  lsblk: LsblkDev[];
  ip: {
    addr: IpLink[];
    rule: IpRule[];
    route: IpRoute[];
  };
  lshw: LshwNode;
  cpuinfo: string;

  // lspci: string; // pciutils
  // lscpu: string;
  // lsmem: string;
  // lsusb: string;
  // dmidecode: string;
  // efibootmgr: string;
  // lldp: string;
};

export async function discovery(): Promise<DiscoveryInfo> {
  // https://maas.io/docs/commissioning-logs-reference
  // TODO: move abstract each command into `<command>.ts`
  return {
    lsblk: await $`lsblk --output-all --json`.json().then(({ blockdevices }) => blockdevices), // util-linux
    ip: {
      // iproute2
      addr: await $`ip --json addr show`.json(),
      rule: await $`ip --json rule show`.json(),
      route: await $`ip --json route show`.json(),
    },
    lshw: convertLshwXmlOutput(await $`lshw -xml`.text()), // lshw
    cpuinfo: await $`cat /proc/cpuinfo`.text(),
    // lspci: await $`lspci`.text(), // pciutils
    // lsusb: await $`lsusb`.text(), // usbutils
    // dmidecode: await $`dmidecode`.text(), // dmidecode
    // efibootmgr: await $`efibootmgr`.text(),  // efibootmgr
    // lldp: await $`lldpctl`.text(),  // lldpd (services.lldpd.enable)
  };
}
