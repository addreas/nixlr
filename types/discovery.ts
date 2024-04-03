
import { IpLink, IpRoute, IpRule } from "./iproute.ts";
import { LsblkDev } from "./lsblk.ts";
import {  LshwNode } from "./lshw.ts";

export type DiscoveryInfo = {
  "hardware-configuration.nix": string;

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
