import $ from "https://deno.land/x/dax@0.30.1/mod.ts";
import { ProvisionInfo } from "./types.ts";

export function partition(info: ProvisionInfo) {
  return info.blockDevices.map(({ device, label, partitions }) => {
    const mkparts = partitions.map(
      ({ partType, name, fsType, start, end }) =>
        `mkpart ${partType} ${name} ${fsType} ${start} ${end}`
    );
    const setflags = partitions.flatMap(({ flags }, index) =>
      flags.map((flag) => `set ${index} ${flag} on`)
    );
    return $`parted --json --script ${device} ${[
      `mklabel ${label}`,
      ...mkparts,
      ...setflags,
    ].join(" ")}`;
  });
}

export function filesystems(info: ProvisionInfo) {
  return info.fileSystems.flatMap((fs) => {
    if (fs.type == "btrfs") {
      return [
        $`mkfs.btrfs ${fs.devices.join(" ")} ${fs.args.join(" ")}`,
        $`mount ${fs.devices[0]} /mnt`,
        ...fs.subvolumes.map((name) => $`btrfs subvolume create /mnt ${name}`),
        $`umount /mnt`,
      ];
    } else {
      return $`mkfs.${fs.type} ${fs.device} ${fs.args}`;
    }
  });
}

export function mounts(info: ProvisionInfo) {
  return info.mounts.map(
    ({ device, path, options }) =>
      $`mount "${device}" "/mnt${path}" -o ${options.join(",")}`
  );
}
