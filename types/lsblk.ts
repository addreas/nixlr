
export type LsblkDev = {
    // alignment offset
    alignment: number; // 0

    // discard alignment offset
    "disc-aln": number; // 0

    // dax-capable device
    dax: boolean; // false

    // discard granularity
    "disc-gran": number; // 512

    // discard max bytes
    "disc-max": number;

    // discard zeroes data
    "disc-zero": boolean; // false

    // filesystem size available
    fsavail: null | number;

    // mounted filesystem roots
    fsroots: string[];

    // filesystem size
    fssize: null | number;

    // filesystem type
    fstype: null | string; // null | "ext4" | "btrfs" | "vfat"

    // filesystem size used
    fsused: null | number;

    // filesystem use percentage
    "fsuse%": null | `${number}%`;

    // filesystem version
    fsver: null | string; // null | "1" | "1.0" | "FAT32"

    // group name
    group: "disk" | "cdrom";

    // Host:Channel:Target:Lun for SCSI
    hctl: null | `${number}:${number}:${number}:${number}`;

    // removable or hotplug device (usb, pcmcia, ...)
    hotplug: boolean;

    // internal kernel device name
    kname: string; // `s${string}` | `nvme${string}`

    // filesystem LABEL
    label: null | string;

    // logical sector size
    "log-sec": number; // 512

    // major:minor device number
    "maj:min": `${number}:${number}`;

    // minimum I/O size
    "min-io": number; // 512 | 4096

    // device node permissions
    mode: "brw-rw----";

    // device identifier
    model: string; // "VIRTUAL-DISK" | `${"SAMSUNG" | "KINGSTON" | "ADATA" | "SanDisk"} ${string}` | `ST${string}-${string}` |

    // device name
    name: string; // `s${string}` | `nvme${string}`

    // optimal I/O size
    "opt-io": number; // 0

    // user name
    owner: "root";

    // partition flags
    partflags: null | string;

    // partition LABEL
    partlabel: null | string;

    // partition type code or UUID
    parttype: null | string;

    // partition type name
    parttypename: null | string; // "Linux" | "Linux swap / Solaris" | "EFI System" | "Linux filesystem"

    // partition UUID
    partuuid: null | string;

    // path to the device node
    path: string; // `/dev/s${string}` | `/dev/nvme${string}`

    // physical sector size
    "phy-sec": number; // 512 | 4096

    // internal parent kernel device name
    pkname: null | string; // "sdb"  | "sdd" | "nvme1n1"

    // partition table type
    pttype: null | "dos" | "gpt";

    // partition table identifier (usually UUID)
    ptuuid: null | string;

    // read-ahead of the device
    ra: number; // 128

    // adds randomness
    rand: boolean;

    // device revision
    rev: null | string; // "0000" | "0001" | /[A-Z0-9]{4}/

    // removable device
    rm: boolean;

    // read-only device
    ro: boolean;

    // rotational device
    rota: boolean;

    // request queue size
    "rq-size": number; // 64 | 226 | 256 | 1023

    // I/O scheduler name
    sched: string; // "none" | "mq-deadline"

    // disk serial number
    serial: null | string; // `WD-${string}` | `S${0|2|3}${string}` | `beaf${number}` | `${number}`

    // size of the device
    size: number;

    // partition start offset
    start: null | number;

    // state of the device
    state: null | "live" | "running";

    // de-duplicated chain of subsystems
    subsystems: string; // "block:nvme:pci" | "block:scsi:pci" | "block:scsi"

    // where the device is mounted
    mountpoint: string | null;

    // all locations where device is mounted
    mountpoints: (string | null)[];

    // device transport type
    tran: null | "nvme" | "sata" | "sas" | "iscsi";

    // device type
    type: "part" | "disk" | "rom";

    // filesystem UUID
    uuid: null | string;

    // device vendor
    vendor: null | string; // null | "ATA     " | "IET     " | "TSSTcorp"

    // write same max bytes
    wsame: number; // 0

    // unique storage identifier
    wwn: null | string; // `0x${string}` | `eui.${string}`

    // zone model
    zoned: "none";

    // zone size
    "zone-sz": number; // 0

    // zone write granularity
    "zone-wgran": number; // 0

    // zone append max bytes
    "zone-app": number; // 0

    // number of zones
    "zone-nr": number; // 0

    // maximum number of open zones
    "zone-omax": number; // 0

    // maximum number of active zones
    "zone-amax": number; // 0

    // child devices
    children: LsblkDev[];
  };
