
export type NixNode = {
	// metav1.#TypeMeta
	// metadata: metav1.#ObjectMeta @go(Metadata,ObjectMeta)
	spec:     NixNodeSpec
	status:   NixNodeStatus
}

export type NixNodeSpec = {
	pxe: {
		mac:  string
		mode: "persistent" | "ephemeral"
	}
	// disks: {}
	// filesystems: {}
	// mounts: {}
	// systemFlakeSource: {}
	// deployKey: {}
}

export type NixNodeStatus = {
	conditions: [] // discovered, deployed, something else

    // discoveryInfo: DiscoveryInfo

	// systemctl: {}
}
