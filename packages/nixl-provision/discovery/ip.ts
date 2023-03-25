
export type IpLink = {
    ifindex: number; // 1 | 2 | 3 | ... | 112
    link_index?: number; // 2 | 9 | 11 | ... | 111
    link?: string; // "cilium_net" | "cilium_host"
    ifname: string; // "eno1" | "eth0" | "sit0" | "tun0" | "bond0" | "cilium_host" | "cilium_net"
    flags: (
      | "LOOPBACK"
      | "BROADCAST"
      | "MULTICAST"
      | "MASTER"
      | "NOARP"
      | "UP"
      | "LOWER_UP"
    )[];
    mtu: number; // 1500 | 65536
    qdisc: "mq" | "noop" | "noqueue";
    operstate: "UP" | "DOWN" | "UNKNOWN";
    group: string; // "default"
    txqlen: number; // 1000
    link_type:
      | "ether"
      | "loopback"
      | "bridge"
      | "bridge_slave"
      | "bond"
      | "bond_slave"
      | "can"
      | "dummy"
      | "hsr"
      | "ifb"
      | "ipoib"
      | "macvlan"
      | "macvtap"
      | "vcan"
      | "veth"
      | "vlan"
      | "vxlan"
      | "ip6tnl"
      | "ipip"
      | "sit"
      | "gre"
      | "gretap"
      | "erspan"
      | "ip6gre"
      | "ip6gretap"
      | "ip6erspan"
      | "vti"
      | "vrf"
      | "nlmon"
      | "ipvlan"
      | "lowpan"
      | "geneve"
      | "macsec";

    address: string; // "00:15:5d:6f:77:f9"
    broadcast: string; // "ff:ff:ff:ff:ff:ff"
    link_netnsid?: number; // 1 | 2
    altnames?: string[]; // ["enp0s31f6"]
    addr_info: IpAddr[];

    [unknown: string]: unknown;
  };

  export type IpAddr = {
    family: "inet" | "inet6";
    local: string; // "172.29.123.239" | "fe80::215:5dff:fe6f:77f9"
    broadcast?: string; // "172.29.127.255";
    label?: string; // "eth0" | "lo"
    prefixlen: number; // 24 | 64
    scope: "host" | "link" | "global";
    valid_life_time: number; // 4294967295
    preferred_life_time: number; // 4294967295

    [unknown: string]: unknown;
  };

  export type IpRule = {
    priority: number;
    src: "all";
    fwmark?: `0x${string}`;
    fwmask?: `0x${string}`;
    table: string; // main | default | 2004 | 2005

    [unknown: string]: unknown;
  };

  export type IpRoute = {
    dst: `${string}/${number}`;
    gateway: string;
    dev: string; // eno1 | cilium_host
    protocol?: "kernel" | "boot" | "static" | "ra" | "dhcp";
    scope: "host" | "link" | "global";
    prefsrc?: string; // "192.168.1.106"
    metric?: number; // 1024
    metrics?: { mtu: number }[];
    flags: [];

    [unknown: string]: unknown;
  };
