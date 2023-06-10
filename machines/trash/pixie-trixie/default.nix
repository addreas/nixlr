{ config, pkgs, lib, modulesPath, ... }:
let
  setupPersistance = pkgs.writeShellApplication
    {
      name = "setup-persistance";
      runtimeInputs = [ pkgs.parted ];
      text = builtins.readFile ./setup-persistance.sh;
    };
in
{
  imports = [
    (modulesPath + "/installer/netboot/netboot-minimal.nix")
    ./hardware-configuration.nix
    ./kube.nix

    ../common/base.nix
    ../common/services.nix
  ];


  # boot.kernel.sysctl."net.ipv4.ip_forward" = 1;
  # boot.kernel.sysctl."net.ipv6.conf.all.forwarding" = 1;

  # Before changing this value read the documentation for this option
  # (e.g. man configuration.nix or on https://nixos.org/nixos/options.html).
  system.stateVersion = "22.05"; # Did you read the comment?

  # requires manual `sudo btrfs subvolume create /.snapshots`
  # services.snapper.snapshotRootOnBoot = true;
  # services.snapper.configs.root.subvolume = "@";

  networking.hostName = ""; # these have ot be set via kernel cmdline
  networking.domain = ""; # these have ot be set via kernel cmdline

  system.activationScripts.cmdline-setup = ''
    function get_cmd_val() {
      cat /proc/cmdline | tr " " "\n" | grep $1 | sed 's/.*=\(.*\)/\1/'
    }

    HOSTNAME=$(get_cmd_val hostname)
    if [[ $HOSTNAME != "null" ]]; then
      hostname $HOSTNAME
      echo $HOSTNAME > /etc/hostname
    fi

    DOMAINNAME=$(get_cmd_val domainname)
    if [[ $DOMAINNAME != "null" ]]; then
      domainname $DOMAINNAME
    fi
  '';

  # systemd.network.enable = true;
  # systemd.network.networks.lan.name = "enp4s0";
  # systemd.network.networks.lan.dns = [ "192.168.1.1" ];

  # services.tailscale.enable = true;

  virtualisation.podman.enable = true;
  virtualisation.oci-containers.backend = "podman";


  networking.firewall.allowedTCPPorts = [ 22 80 443 ];
  networking.firewall.allowedUDPPorts = [ 1900 5353 ];
}

