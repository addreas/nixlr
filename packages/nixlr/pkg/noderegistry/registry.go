package noderegistry

type Registry interface {
	ShouldBoot(mac string) bool
}

func NewMockRegistry() Registry {
	return &mockRegistry{}
}

type mockRegistry struct{}

func (r *mockRegistry) ShouldBoot(mac string) bool {
	return false
}
