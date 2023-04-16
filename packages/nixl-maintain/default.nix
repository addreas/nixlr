{ lib, stdenvNoCC, pkgs, ... }:
stdenvNoCC.mkDerivation rec {
  pname = "nixl-maintain";
  version = "0.0.0";

  # src = ./.;
  src = lib.sourceFilesBySuffices ./. [".ts" ".jsonc" ".lock" pname];

  # TODO: use mkDenoPackage lib

  postPatch = ''
    substituteInPlace bin/${pname} \
      --replace deno ${pkgs.deno}/bin/deno
  '';

  buildPhase =  ''
    mkdir -p $out
    cp -r . $out
  '';

  dontConfigure = true;
  dontInstall = true;
}
