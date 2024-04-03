{ lib, mkDenoPackage, ... }: mkDenoPackage {
  pname = "cmdline";
  version = "0.0.0";

  denoRunArgs = "--allow-read=/proc/cmdline";

  src = lib.cleanSource ./.;
  main = "cmdline.ts";
}
