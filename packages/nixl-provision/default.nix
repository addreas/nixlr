{ lib, stdenvNoCC, pkgs, ... }:
stdenvNoCC.mkDerivation rec {
  pname = "nixl-provision";
  version = "0.0.0";

  # src = ./.;
  src = lib.cleanSource ./.;

  postPatch = ''
    substituteInPlace bin/${pname} \
      --replace deno ${pkgs.deno}/bin/deno
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
