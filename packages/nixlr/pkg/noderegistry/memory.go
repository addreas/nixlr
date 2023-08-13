package noderegistry

import (
	"fmt"
)

func NewMemoryRegistry(defaultNetbootStorePaths NetbootNixStorePaths) *memoryRegistry {
	return &memoryRegistry{
		defaultNetbootStorePaths: defaultNetbootStorePaths,
	}
}

func (r *memoryRegistry) AddNode(mac, name, systemFlakeRef string) error {
	res, err := BuildSystemFlake(systemFlakeRef)
	if err != nil {
		return err
	}

	if node := r.getByMac(mac); node != nil {
		node.name = name
		node.netbootStorePaths = res
	} else {
		r.nodes = append(r.nodes, memoryNode{
			mac:               mac,
			name:              name,
			netbootStorePaths: res,
		})
	}
	return nil
}

type memoryNode struct {
	mac  string
	name string

	netbootStorePaths *NetbootNixStorePaths

	deployKey *string

	discoveryInfo *DiscoveryInfo
	provisionInfo *ProvisionInfo
	installStatus *InstallStatus
}

type memoryRegistry struct {
	nodes []memoryNode

	defaultNetbootStorePaths NetbootNixStorePaths

	lockHolder *string
}

func (r *memoryRegistry) getByMac(mac string) *memoryNode {
	for _, node := range r.nodes {
		if mac == node.mac {
			return &node
		}
	}
	return nil
}

func (r *memoryRegistry) getByName(name string) *memoryNode {
	for _, node := range r.nodes {
		if name == node.name {
			return &node
		}
	}
	return nil
}

func (r *memoryRegistry) ShouldBoot(mac string) bool {
	node := r.getByMac(mac)
	return node != nil && node.installStatus == nil
}

func (r *memoryRegistry) GetNetbootNixStorePaths(mac string) *NetbootNixStorePaths {
	node := r.getByMac(mac)
	if node == nil {
		return nil
	} else if node.netbootStorePaths == nil {
		return &r.defaultNetbootStorePaths
	} else {
		return node.netbootStorePaths
	}
}

func (r *memoryRegistry) PutDiscovery(mac string, info DiscoveryInfo) error {
	node := r.getByMac(mac)
	if node == nil {
		return fmt.Errorf("no node with mac %s", mac)
	}
	node.discoveryInfo = &info
	return nil
}
func (r *memoryRegistry) GetProvisionInfo(mac string) (*ProvisionInfo, error) {
	node := r.getByMac(mac)
	if node == nil {
		return nil, fmt.Errorf("no node with mac %s", mac)
	}
	return node.provisionInfo, nil
}
func (r *memoryRegistry) PutDeployKey(name string, key string) error {
	node := r.getByName(name)
	if node == nil {
		return fmt.Errorf("no node with name %s", name)
	}
	node.deployKey = &key
	return nil
}
func (r *memoryRegistry) PutInstallStatus(name string, status InstallStatus) error {
	node := r.getByName(name)
	if node == nil {
		return fmt.Errorf("no node with name %s", name)
	}
	node.installStatus = &status
	return nil
}

func (r *memoryRegistry) LockAquire(name string) error {
	if r.lockHolder != nil && *r.lockHolder != name {
		return fmt.Errorf("lock already held by %s", *r.lockHolder)
	}
	return nil
}
func (r *memoryRegistry) LockRelease(name string) error {
	if r.lockHolder == nil {
		return nil
	}

	if *r.lockHolder != name {
		return fmt.Errorf("lock not held by %s", name)
	}

	r.lockHolder = nil
	return nil
}

func (r *memoryRegistry) GetDiscovery() []DiscoveryInfo {
	ret := []DiscoveryInfo{}
	for _, node := range r.nodes {
		if node.discoveryInfo != nil {
			ret = append(ret, *node.discoveryInfo)
		}
	}
	return ret
}

func (r *memoryRegistry) PutProvisionInfo(name string, info ProvisionInfo) error {
	node := r.getByName(name)
	if node == nil {
		return fmt.Errorf("no node with name %s", name)
	}
	node.provisionInfo = &info
	return nil
}
func (r *memoryRegistry) GetInstallStatus(name string) (*InstallStatus, error) {
	node := r.getByName(name)
	if node == nil {
		return nil, fmt.Errorf("no node with name %s", name)
	}
	return node.installStatus, nil
}
