import $ from "https://deno.land/x/dax/mod.ts";

type DiscoveryInfo = unknown

export async function discovery(api: string, mac: string) {
  const discoveryInfo = await getDiscoveryInfo();
  console.log("discovering", discoveryInfo)
  await sendDiscoveryInfo(api, mac, discoveryInfo);

  while (await fetch(`${api}/provision/${mac}`).then((r) => !r.ok)) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await sendDiscoveryInfo(api, mac, discoveryInfo);
  }
}

async function sendDiscoveryInfo(api: string, mac: string, discoveryInfo: DiscoveryInfo) {
  await fetch(`${api}/discovery/${mac}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(discoveryInfo),
  });
}

async function getDiscoveryInfo(): Promise<DiscoveryInfo> {
  // https://maas.io/docs/commissioning-logs-reference
  return {
    lsblk: await $`lsblk --output-all  --json`.json(), // util-linux
    ipaddr: await $`ip --json addr show`.json(), // iproute2
    lshw: await $`lshw --xml`.text(), // lshw
    lspci: await $`lspci`.text(), // pciutils
    lsusb: await $`lsusb`.text(), // usbutils
    dmidecode: await $`dmidecode`.text(), // dmidecode
    efibootmgr: await $`efibootmgr`.text(),  // efibootmgr
    lldp: await $`lldpctl`.text(),  // lldpd (services.lldpd.enable)
    cpuinfo: await $`cat /proc/cpuinfo`.text(),
  };
}
