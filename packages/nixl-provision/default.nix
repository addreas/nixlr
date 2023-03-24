{ lib, stdenvNoCC, pkgs, ... }:
let
  lockfile = lib.importJSON ./deno.lock;
  deptodep = url: sha256: {
    inherit url;
    name = "./" + (lib.strings.remotePrefix "https://" url);
    path = fetchurl { inherit url sha256 };
  };
  dependencies = lib.attrsets.mapAttrsToList deptodep lockfile.remote;
  import-map = pkgs.writeFile "import-map.json" (builtins.toJSON {
    imports = lib.list.listToAttrs dependencies (dep: {
      key = dep.url;
      value = dep.name;
    });
  });
  deno-cache = pkgs.linkfarm "deno-cache" (dependencies [ import-map ]);
in
stdenvNoCC.mkDerivation rec {
  pname = "nixl-provision";
  version = "0.0.0";

  # src = ./.;
  src = lib.cleanSource ./.;

  postPatch = ''
    substituteInPlace bin/${pname} \
      --replace deno "${pkgs.deno}/bin/deno --import-map ${deno-cache}/import-map.json"
    substituteInPlace bin/cmdline \
      --replace "/usr/bin/env python3" ${pkgs.python3}/bin/python3
  '';

  buildPhase =  ''
    mkdir -p $out
    cp -r . $out
  '';

  dontConfigure = true;
  dontInstall = true;
}
