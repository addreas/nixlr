{ config, pkgs, lib, modulesPath, ... }: {
  imports = [
    (modulesPath + "/profiles/headless.nix")
    (modulesPath + "/profiles/minimal.nix")

    ./hardware-config.nix
    ./disko-config.nix
  ];

  system.stateVersion = "22.11";
  networking.hostName = "test-node";

  services.nixl-self-deploy.enabled = true;
  services.nixl-self-deploy.settings = {
    repo = "git@github.com:addreas/nixlr.git";
    timer = "daily"; # TODO: implement self-deploy timer in ../../packages/nixl-maintain/module.nix
  };
}
