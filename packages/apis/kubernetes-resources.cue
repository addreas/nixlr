package apis

#NixNode: {
	// #TypeMeta
	// #ObjectMeta
	spec:   #NixNodeSpec
	status: #NixNodeStatus
}

#NixNodeSpec: {
	pxe: {
		mac:  string
		mode: "persistent" | "ephemeral"
	}
	disks: {}
	filesystems: {}
	mounts: {}
	systemFlakeSource: {}
	deployKey: {}
}

#NixNodeStatus: {
	conditions: _ // discovered, deployed, something else
	lsblk: {}
	ipaddr: {}
	systemctl: {}
}
