package noderegistry

import (
	"fmt"
	"os/exec"
	"strings"
)

func BuildSystemFlake(systemFlakeRef string) (*NetbootNixStorePaths, error) {
	out, err := exec.Command("nix",
		"build",
		"--no-link",
		"--print-out-paths",
		systemFlakeRef+".config.system.build.toplevel",
		systemFlakeRef+".config.system.build.kernel",
		systemFlakeRef+".config.system.build.netbootRamdisk",
	).CombinedOutput()

	if err != nil {
		return nil, fmt.Errorf("%s: %w", string(out), err)
	}

	paths := strings.Split(string(out), "\n")

	return &NetbootNixStorePaths{
		TopLevel: paths[0],
		Kernel:   paths[1],
		Initrd:   paths[2],
	}, nil
}
