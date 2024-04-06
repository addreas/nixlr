import $ from "https://deno.land/x/dax@0.30.1/mod.ts";

export async function getPixiecoreParams(
  system: string,
  api: string,
  hostname: string
) {
  const [toplevel, kernel, initrd] =
    await $`nix build --no-link --print-out-paths \
            ${system}.config.system.build.toplevel \
            ${system}.config.system.build.kernel \
            ${system}.config.system.build.netbootRamdisk`.lines();

  return {
    kernel: `file:///${kernel}/bzImage`,
    initrd: [`file:///${initrd}/initrd`],
    cmdline: [`init=${toplevel}/init`, `api=${api}`, `hostname=${hostname}`],
  };
}
