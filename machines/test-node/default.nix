{ config, pkgs, lib, modulesPath, ... }:
let
  nixl-maintain = pkgs.callPackage ../../packages/nixl-maintain {};
in
{
  imports = [
    (modulesPath + "/profiles/headless.nix")
    (modulesPath + "/profiles/minimal.nix")

    ./hardware-config.nix

    ../../packages/nixl-maintain/module.nix
  ];

  system.stateVersion = "22.11";
  networking.hostName = "test-node";

  services.nixl-self-deploy.enabled = true;
  services.nixl-self-deploy.settings = {
    repo = "git@github.com:addreas/nixlr.git";
  };
}
