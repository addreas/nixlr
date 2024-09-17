package main

import (
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"

	"golang.org/x/sys/unix"
)

func main() {
	fmt.Println("Hello, World!")

	//  https://github.com/siderolabs/talos/blob/8d6884a8e28e1bfa29f9a479e0f7179819cf70cd/internal/pkg/mount/pseudo.go
	mount("devtmpfs", "/dev", "devtmpfs", unix.MS_NOSUID, "mode=0755")
	mount("proc", "/proc", "proc", unix.MS_NOSUID|unix.MS_NOEXEC|unix.MS_NODEV, "")
	mount("sysfs", "/sys", "sysfs", 0, "")
	mount("tmpfs", "/run", "tmpfs", unix.MS_NOSUID|unix.MS_NOEXEC|unix.MS_RELATIME, "mode=755")
	mount("tmpfs", "/system", "tmpfs", 0, "mode=755")
	mount("tmpfs", "/tmp", "tmpfs", unix.MS_NOSUID|unix.MS_NOEXEC|unix.MS_NODEV, "size=64M,mode=755")
	mount("tmpfs", "/dev/shm", "tmpfs", unix.MS_NOSUID|unix.MS_NOEXEC|unix.MS_NODEV|unix.MS_RELATIME, "")
	mount("devpts", "/dev/pts", "devpts", unix.MS_NOSUID|unix.MS_NOEXEC, "ptmxmode=000,mode=620,gid=5")
	mount("hugetlbfs", "/dev/hugepages", "hugetlbfs", unix.MS_NOSUID|unix.MS_NODEV, "")
	mount("securityfs", "/sys/kernel/security", "securityfs", unix.MS_NOSUID|unix.MS_NOEXEC|unix.MS_NODEV|unix.MS_RELATIME, "")
	mount("securityfs", "/sys/kernel/tracing", "tracefs", unix.MS_NOSUID|unix.MS_NOEXEC|unix.MS_NODEV, "")

	path, _ := filepath.Glob("/nix/store/*/bin")
	os.Setenv("PATH", strings.Join(path, ":"))
	for _, line := range path {
		fmt.Println(line)
	}
	fmt.Println(exec.Command("ls", "/").CombinedOutput())

	res, _ := os.ReadFile("/proc/cmdline")
	fmt.Println("cmdline: ", string(res))

	c := make(chan os.Signal, 1)
	signal.Notify(c)
	<-c
}

func mount(source string, target string, fstype string, flags uintptr, data string) error {
	if _, err := os.Stat(target); os.IsNotExist(err) {
		if err = os.MkdirAll(target, 0o755); err != nil {
			return err
		}
	}

	return unix.Mount(source, target, fstype, flags, data)
}
