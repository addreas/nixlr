export type ProvisionInfo = {
  api: string;

  hostname: string;
  flakeRepo: string; // "git@github.com:addreas/flakefiles.git"
  flakePath: string; // "somewhere/in/the/flake/repo" where hardware-configuration.nix will be placed
  deployKeyPath: string; // "/etc/ssh/ssh_host_ed25519_key"

  blockDevices: BlockDevice[];
  fileSystems: Filesystem[];
  mounts: Mount[];
};

type BlockDevice = {
  device: string;
  label:
    | "aix"
    | "amiga"
    | "bsd"
    | "dvh"
    | "gpt"
    | "loop"
    | "mac"
    | "msdos"
    | "pc98"
    | "sun";
  partitions: {
    partType?: "primary" | "logical" | "extended"; // part-type may be specified only with msdos and dvh partition tables, it should be one of "primary", "logical", or "extended".
    name?: string; // name is required for  GPT partition tables and fs-type is optional.
    fsType?: PartitionFsType;

    start: PartedSizeOrPercentage;
    end: PartedSizeOrPercentage;

    flags: PartitionFlag[];
  }[];
};

type Filesystem =
  | {
      type: "ext4" | "fat" | "xfs";
      device: string;
      args: string[];
    }
  | {
      type: "btrfs";
      devices: string[];
      args: string[];
      subvolumes: string[];
    };

type Mount = {
  device: string;
  path: string;
  options: string[]; // ["noatime","compress=zstd","subvol=@"]
};

type PartitionFsType =
  | "btrfs"
  | "ext2"
  | "ext3"
  | "ext4"
  | "fat16"
  | "fat32"
  | "hfs"
  | "hfs+"
  | "linux-swap"
  | "ntfs"
  | "reiserfs"
  | "udf"
  | "xfs";

type PartitionFlag =
  | "boot"
  | "root"
  | "swap"
  | "hidden"
  | "raid"
  | "lvm"
  | "lba"
  | "legacy_boot"
  | "irst"
  | "msftres"
  | "esp"
  | "chromeos_kernel"
  | "bls_boot"
  | "linux-home"
  | "no_automount"
  | "bios_grub"
  | "palo";

type PartedSizeOrPercentage =
  | `${number}${"K" | "M" | "G" | "T" | "P"}${"B" | "iB"}`
  | `${number}%`;
