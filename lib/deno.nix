{ pkgs, lib }: { pname, version, src, main ? "main.ts", denoRunArgs ? "" }:
let
  lockfile = lib.importJSON "${src}/deno.lock";
  dependencies = lib.attrsets.mapAttrsToList
    (url: sha256: {
      inherit url;
      path = pkgs.fetchurl { inherit url sha256; };
      name = "${lib.strings.removePrefix "https://" url}";
    })
    lockfile.remote;
  deno-cache = pkgs.linkFarm "deno-cache" dependencies;
  import-map = pkgs.writeText "import-map.json" (builtins.toJSON {
    imports = builtins.listToAttrs (builtins.map
      (dep: {
        name = dep.url;
        value = "${deno-cache}/${lib.strings.removePrefix "https://" dep.url}";
        # value = dep.name;
      })
      dependencies);
  });
in
pkgs.stdenvNoCC.mkDerivation rec {
  inherit pname version src;

  dontConfigure = true;
  dontBuild = true;
  installPhase = ''
    mkdir -p $out/bin
    cp -r . $out
    cp ${import-map} $out/import-map.json
    echo "${pkgs.deno}/bin/deno run --import-map $out/import-map.json ${denoRunArgs} $out/${main} '\"$@\"'" > $out/bin/${pname}
    chmod +x $out/bin/${pname}
  '';
}
