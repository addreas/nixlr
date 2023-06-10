{ config, pkgs, lib, modulesPath, ... }:
{
  imports = [
    (modulesPath + "/installer/sd-card/sd-image-aarch64-installer.nix")

    ../common/base.nix
    ../common/services.nix
    ../../packages/pixie-api/module.nix
  ];

  system.stateVersion = "22.11";

  sdImage.compressImage = false;

  networking.hostName = "pixie-pie";
  networking.domain = "localdomain";

  networking.firewall.enable = true;
  networking.interfaces.eth0.useDHCP = true;

  environment.systemPackages = with pkgs; [ tcpdump ];

  services.pixiecore-host-configs.enable = true;

  hardware.raspberry-pi."4".poe-hat.enable = true;
}
