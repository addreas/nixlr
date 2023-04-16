{ config, pkgs, lib, modulesPath, ... }:
let
  # TODO: generic module for tmpfs systems
  nixl-provision = pkgs.callPackage ../../packages/nixl-provision {};
in
{
  imports = [
    (modulesPath + "/installer/scan/not-detected.nix")
    (modulesPath + "/installer/netboot/netboot-minimal.nix")
    (modulesPath + "/profiles/headless.nix")
    (modulesPath + "/profiles/minimal.nix")
  ];

  system.stateVersion = "22.11";

  networking.hostName = ""; # these have to be set via kernel cmdline

  system.activationScripts.cmdline-setup = ''
    HOSTNAME=$(${nixl-provision}/bin/cmdline hostname)
    if [[ "$HOSTNAME" != "" ]]; then
      hostname $HOSTNAME
      echo $HOSTNAME > /etc/hostname
    fi
  '';

  programs.ssh.knownHostsFiles = [
    (pkgs.writeText "github.keys" ''
      github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
      github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=
    '')
  ];

  services.lldpd.enable = true;
  services.avahi.enable = true;

  systemd.services.nixl-provision = {
    description = "Run the nixl-provision daemon";
    wantedBy = [ "multi-user.target" ];
    serviceConfig = {
      ExecStart = "${nixl-provision}/bin/nixl-provision";
      StandardOutput = "journal+console";
    };
  };
}
