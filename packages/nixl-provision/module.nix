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
  };
}
