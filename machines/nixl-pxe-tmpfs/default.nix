{ config, pkgs, lib, modulesPath, ... }: {
  imports = [
    (modulesPath + "/installer/scan/not-detected.nix")
    (modulesPath + "/installer/netboot/netboot-minimal.nix")
    (modulesPath + "/profiles/headless.nix")
    (modulesPath + "/profiles/minimal.nix")

    ../../packages/nixl-provision/module.nix
  ];

  system.stateVersion = "22.11";

  services.nixl-provision.enabled = true;
  services.nixl-provision.mode = "ephemeral";
}
