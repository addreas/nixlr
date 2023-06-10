{ config, pkgs, lib, modulesPath, ... }:
let
  nukeAndInstall = pkgs.writeShellApplication
    {
      name = "nuke-nvme0n1-and-install";
      runtimeInputs = [ pkgs.parted ];
      text = builtins.readFile ./nuke.sh;
    };
in
{
  imports = [
    (modulesPath + "/installer/scan/not-detected.nix")
    (modulesPath + "/installer/netboot/netboot-minimal.nix")

    ../common/base.nix
    ../common/services.nix
  ];

  system.stateVersion = "22.11";

  services.getty.autologinUser = lib.mkForce "root";

  environment.systemPackages = [
    nukeAndInstall
  ];
}

