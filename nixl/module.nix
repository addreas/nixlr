{ config, pkgs, lib, flakePkgs, ... }:
let
  cfg = config.services.nixl-provision;
in
{
  options.services.nixl-provision = {
    enabled = lib.mkEnableOption "nixl provision";
    package = lib.mkOption {
      type = lib.types.package;
      default = flakePkgs.nixl-provision;
    };

    mode = lib.mkOption {
      type = lib.types.enum ["ephemeral" "firstboot"];
    };

    cmdlinePackage = lib.mkOption {
      type = lib.types.package;
      default = flakePkgs.cmdline;
    };
  };

  options.services.nixl-maintain = {
    enabled = lib.mkEnableOption "nixl maintain daemon";
    package = lib.mkOption {
      type = lib.types.package;
      default = flakePkgs.nixl-maintain;
    };
  };

  options.services.nixl-self-deploy = {
    enabled = lib.mkEnableOption "nixl self deploy";
    settings.repo = lib.mkOption { type = lib.types.string; };
    settings.timer = lib.mkOption { type = lib.types.string; };
  };

  config = lib.mkIf cfg.enabled {

    networking.hostName = ""; # these have to be set via kernel cmdline

    system.activationScripts.cmdline-setup = ''
      HOSTNAME=$(${cfg.cmdlinePackage}/bin/cmdline hostname)
      if [[ "$HOSTNAME" != "" ]]; then
        hostname $HOSTNAME
        echo $HOSTNAME > /etc/hostname
      fi
    '';

    services.lldpd.enable = true;
    services.avahi.enable = true;

    systemd.services.nixl-provision = {
      description = "Run the nixl-provision daemon";
      wantedBy = [ "multi-user.target" ];
      serviceConfig = {
        ExecStart = ''
          ${cfg.package}/bin/nixl-provision \
            --mac=$(${cfg.cmdlinePackage}/bin/cmdline mac) \
            --api=$(${cfg.cmdlinePackage}/bin/cmdline api) \
            --mode=${cfg.mode}
        '';
        StandardOutput = "journal+console";
        Restart = "always";
        RestartSec = "5min";
      };
    };

     programs.ssh.knownHostsFiles = [
      (pkgs.writeText "github.keys" ''
        github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
        github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=
      '')
    ];

    systemd.services.nixl-maintain = lib.mkIf config.services.nixl-maintain.enabled {
      description = "Run the nixl-maintain daemon";
      wantedBy = [ "multi-user.target" ];
      serviceConfig = {
        ExecStart = "${config.services.nixl-maintain.package}/bin/nixl-maintain";
        StandardOutput = "journal+console";
      };
    };

    systemd.services.nixl-self-deploy = lib.mkIf config.services.nixl-self-deploy.enabled {
      description = "Run the nixl-self-deploy script";
      # TODO: serviceConfig for nixl-self-deploy
    };

    # TODO: nixl-self-deploy timer?
  };
}
