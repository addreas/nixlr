package types

import metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

#NixNode: {
	metav1.#TypeMeta
	metadata: metav1.#ObjectMeta @go(Metadata,ObjectMeta)
	spec:     #NixNodeSpec       @go(Spec,NixNodeSpec)
	status:   #NixNodeStatus     @go(Status,NixNodeStatus)
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
