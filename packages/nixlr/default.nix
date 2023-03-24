{ lib, stdenvNoCC, pkgs, ... }:
stdenvNoCC.mkDerivation rec {
  pname = "nixlr";
  version = "0.0.0";

  src = ./.;

  dontBuild = true;
  dontConfigure = true;
  dontInstall = true;
}
