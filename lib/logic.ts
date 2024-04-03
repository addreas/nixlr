// "/nix/store/...", "nixosSystem.config.system.build.kernel"
// "/nix/store/...", "nixosSystem.config.system.build.toplevel"
// "/nix/store/...", "nixosSystem.config.system.build.netbootRamdisk"
export function getNixPixiecoreParams(
  kernel: string,
  initrd: string,
  toplevel: string,
  api: string,
  hostname: string
) {
  return {
    kernel: `file:///${kernel}/bzImage`,
    initrd: [`file:///${initrd}/initrd`],
    cmdline: [`init=${toplevel}/init`, `api=${api}`, `hostname=${hostname}`],
  };
}
