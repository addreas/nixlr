package noderegistry

type DiscoveryInfo struct{}
type ProvisionInfo struct{}
type InstallStatus struct{}

type NetbootNixStorePaths struct {
	TopLevel string
	Kernel   string
	Initrd   string
}

type Registry interface {
	// Pixie api
	ShouldBoot(mac string) bool
	GetNetbootNixStorePaths(mac string) *NetbootNixStorePaths

	// Node api
	PutDiscovery(mac string, info DiscoveryInfo) error
	GetProvisionInfo(mac string) (*ProvisionInfo, error)
	PutDeployKey(name string, key string) error
	PutInstallStatus(name string, status InstallStatus) error

	LockAquire(name string) error
	LockRelease(name string) error

	// Admin api
	GetDiscovery() []DiscoveryInfo
	PutProvisionInfo(name string, info ProvisionInfo) error
	GetInstallStatus(name string) (*InstallStatus, error)
}
