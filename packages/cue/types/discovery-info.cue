package types

#DiscoveryInfo: {
	lsblk: [...#LsblkDev]
	ip: {
		addr: [...#IpLink]
		rule: [...#IpRule]
		route: [...#IpRoute]
	}
	lshw:    #LshwNode
	cpuinfo: string

	lspci?:      string // pciutils
	lscpu?:      string
	lsmem?:      string
	lsusb?:      string
	dmidecode?:  string
	efibootmgr?: string
	lldp?:       string
}

#IpLink: {
	ifindex:     number // 1 | 2 | 3 | ... | 112
	link_index?: number // 2 | 9 | 11 | ... | 111
	link?:       string // "cilium_net" | "cilium_host"
	ifname:      string // "eno1" | "eth0" | "sit0" | "tun0" | "bond0" | "cilium_host" | "cilium_net"
	flags: [...("LOOPBACK" | "BROADCAST" | "MULTICAST" | "MASTER" | "NOARP" | "UP" | "LOWER_UP")]
	mtu:       number // 1500 | 65536
	qdisc:     "mq" | "noop" | "noqueue"
	operstate: "UP" | "DOWN" | "UNKNOWN"
	group:     string // "default"
	txqlen:    number // 1000
	link_type: "ether" | "loopback" | "bridge" | "bridge_slave" | "bond" | "bond_slave" | "can" | "dummy" | "hsr" | "ifb" | "ipoib" | "macvlan" | "macvtap" | "vcan" | "veth" | "vlan" | "vxlan" | "ip6tnl" | "ipip" | "sit" | "gre" | "gretap" | "erspan" | "ip6gre" | "ip6gretap" | "ip6erspan" | "vti" | "vrf" | "nlmon" | "ipvlan" | "lowpan" | "geneve" | "macsec"

	address:       string // "00:15:5d:6f:77:f9"
	broadcast:     string // "ff:ff:ff:ff:ff:ff"
	link_netnsid?: number // 1 | 2
	altnames?: [...string] // ["enp0s31f6"]
	addr_info: [...#IpAddr]

	...
}

#IpAddr: {
	family:              "inet" | "inet6"
	local:               string // "172.29.123.239" | "fe80::215:5dff:fe6f:77f9"
	broadcast?:          string // "172.29.127.255"
	label?:              string // "eth0" | "lo"
	prefixlen:           number // 24 | 64
	scope:               "host" | "link" | "global"
	valid_life_time:     number // 4294967295
	preferred_life_time: number // 4294967295

	...
}

#IpRule: {
	priority: number
	src:      "all"
	fwmark?:  =~#"0x\w+"# // "0x\(string)"
	fwmask?:  =~#"0x\w+"# // "0x\(string)"
	table:    string      // main | default | 2004 | 2005

	...
}

#IpRoute: {
	dst:       =~#".*/\d+"# // "\(string)/\(number)"
	gateway:   string
	dev:       string // eno1 | cilium_host
	protocol?: "kernel" | "boot" | "static" | "ra" | "dhcp"
	scope:     "host" | "link" | "global"
	prefsrc?:  string // "192.168.1.106"
	metric?:   number // 1024
	metrics?: [...{mtu: number}]
	flags: [...string]

	...
}

#LshwNode: {
	id:      string
	claimed: bool
	class:   string
	handle:  string

	modalias?:    string
	description?: string
	product?:     string
	vendor?:      string
	physid?:      string | number
	businfo?:     string
	logicalname?: string
	dev?:         string
	version?:     string | number
	date?:        string
	serial?:      string | number
	slot?:        string

	size?: {
		unit:  string
		value: number
	}
	capacity?: {
		unit:  string
		value: number
	}
	widthBits?: number
	clockHz?:   number
	capabilities?: [...{id: string, description?: string}]
	configuration?: [string]: string | number
	resources?: [string]:     string | number
	hints?: [string]:         string

	children?: [...#LshwNode]
}

#LsblkDev: {
	// alignment offset
	alignment: number // 0

	// discard alignment offset
	"disc-aln": number // 0

	// dax-capable device
	dax: bool // false

	// discard granularity
	"disc-gran": number // 512

	// discard max bytes
	"disc-max": number

	// discard zeroes data
	"disc-zero": bool // false

	// filesystem size available
	fsavail: null | number

	// mounted filesystem roots
	fsroots: [...string]

	// filesystem size
	fssize: null | number

	// filesystem type
	fstype: null | string // null | "ext4" | "btrfs" | "vfat"

	// filesystem size used
	fsused: null | number

	// filesystem use percentage
	"fsuse%": null | =~#"\d+%"# // "\(number)%"

	// filesystem version
	fsver: null | string // null | "1" | "1.0" | "FAT32"

	// group name
	group: "disk" | "cdrom"

	// Host:Channel:Target:Lun for SCSI
	hctl: null | =~#"\d+:\d+:\d+:\d+"# // "\(number):\(number):\(number):\(number)"

	// removable or hotplug device (usb, pcmcia, ...)
	hotplug: bool

	// internal kernel device name
	kname: string // "s\(string)" | "nvme\(string)"

	// filesystem LABEL
	label: null | string

	// logical sector size
	"log-sec": number // 512

	// major:minor device number
	"maj:min": =~#"\d+:\d+"# //  "\(number):\(number)"

	// minimum I/O size
	"min-io": number // 512 | 4096

	// device node permissions
	mode: string // "brw-rw----"

	// device identifier
	model: string // "VIRTUAL-DISK" | "\(")AMSUNG" | "KINGSTON" | "ADATA" | "SanDisk"} \(string)" | "ST\(string)-\(string)" |

	// device name
	name: string // "s\(string)" | "nvme\(string)"

	// optimal I/O size
	"opt-io": number // 0

	// user name
	owner: "root"

	// partition flags
	partflags: null | string

	// partition LABEL
	partlabel: null | string

	// partition type code or UUID
	parttype: null | string

	// partition type name
	parttypename: null | string // "Linux" | "Linux swap / Solaris" | "EFI System" | "Linux filesystem"

	// partition UUID
	partuuid: null | string

	// path to the device node
	path: string // "/dev/s\(string)" | "/dev/nvme\(string)"

	// physical sector size
	"phy-sec": number // 512 | 4096

	// internal parent kernel device name
	pkname: null | string // "sdb"  | "sdd" | "nvme1n1"

	// partition table type
	pttype: null | "dos" | "gpt"

	// partition table identifier (usually UUID)
	ptuuid: null | string

	// read-ahead of the device
	ra: number // 128

	// adds randomness
	rand: bool

	// device revision
	rev: null | string // "0000" | "0001" | /[A-Z0-9]{4}/

	// removable device
	rm: bool

	// read-only device
	ro: bool

	// rotational device
	rota: bool

	// request queue size
	"rq-size": number // 64 | 226 | 256 | 1023

	// I/O scheduler name
	sched: string // "none" | "mq-deadline"

	// disk serial number
	serial: null | string // "WD-\(string)" | "S\(0)2|3}\(string)" | "beaf\(number)" | "\(number)"

	// size of the device
	size: number

	// partition start offset
	start: null | number

	// state of the device
	state: null | "live" | "running"

	// de-duplicated chain of subsystems
	subsystems: string // "block:nvme:pci" | "block:scsi:pci" | "block:scsi"

	// where the device is mounted
	mountpoint: string | null

	// all locations where device is mounted
	mountpoints: [...(string | null)]

	// device transport type
	tran: null | "nvme" | "sata" | "sas" | "iscsi"

	// device type
	type: "part" | "disk" | "rom"

	// filesystem UUID
	uuid: null | string

	// device vendor
	vendor: null | string // null | "ATA     " | "IET     " | "TSSTcorp"

	// write same max bytes
	wsame: number // 0

	// unique storage identifier
	wwn: null | string // "0x\(string)" | "eui.\(string)"

	// zone model
	zoned: "none"

	// zone size
	"zone-sz": number // 0

	// zone write granularity
	"zone-wgran": number // 0

	// zone append max bytes
	"zone-app": number // 0

	// number of zones
	"zone-nr": number // 0

	// maximum number of open zones
	"zone-omax": number // 0

	// maximum number of active zones
	"zone-amax": number // 0

	// child devices
	children: [...#LsblkDev]
}
