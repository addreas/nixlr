{ lib, mkDenoPackage, ... }: mkDenoPackage {
  pname = "nixl-provision";
  version = "0.0.0";

  denoRunArgs = "--allow-all";

  # TODO: should "https://deno.land/x/dax@0.30.1/src/lib/rs_lib_bg.wasm": "2c6e6515e0699efa1c04a78fa1b2861e5d44fede2eb91940b0458816bcac3b9d" be added to the deno.lock here instead?

  src = lib.cleanSource ./.;
}
