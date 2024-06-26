{ config, pkgs, lib, flakePkgs, ... }:
let
  cfg = config.services.nixl;
in
{
  options.services.nixl = {
    enabled = lib.mkEnableOption "nixl";
    package = lib.mkOption {
      type = lib.types.package;
      default = flakePkgs.nixl;
    };
  };

  options.services.nixl.provision = {
    enabled = lib.mkEnableOption "nixl provision daemon";
    mode = lib.mkOption {
      type = lib.types.enum [ "ephemeral" "firstboot" ];
    };
  };

  options.services.nixl.maintain = {
    enabled = lib.mkEnableOption "nixl maintain daemon";
  };

  options.services.nixl.self-deploy = {
    enabled = lib.mkEnableOption "nixl self deploy";
    settings.repo = lib.mkOption { type = lib.types.string; };
    settings.timer = lib.mkOption { type = lib.types.string; };
  };

  config = lib.mkIf cfg.enabled {
    services.lldpd.enable = true;
    services.avahi.enable = true;

    systemd.services.nixl-provision = lib.mkIf cfg.provision.enabled {
      description = "Run the nixl-provision daemon";
      wantedBy = [ "multi-user.target" ];
      serviceConfig = {
        # ExecStart = "${cfg.package}/bin/nixl-provision --mode=${cfg.mode}";
        StandardOutput = "journal+console";
        Restart = "always";
        RestartSec = "5min";
      };
    };

    systemd.services.nixl-maintain = lib.mkIf cfg.maintain.enabled {
      description = "Run the nixl-maintain daemon";
      wantedBy = [ "multi-user.target" ];
      serviceConfig = {
        # ExecStart = "${cfg.package}/bin/nixl-maintain";
        StandardOutput = "journal+console";
      };
    };

    systemd.services.nixl-self-deploy = lib.mkIf cfg.self-deploy.enabled {
      description = "Run the nixl-self-deploy script";
      # TODO: serviceConfig for nixl-self-deploy
    };

    programs.ssh.knownHostsFiles = [
      (pkgs.writeText "github.keys" ''
        github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
        github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=
      '')
    ];
  };
}
