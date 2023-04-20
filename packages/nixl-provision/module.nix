{ config, pkgs, lib, ... }:
let
  nixl-provision = pkgs.callPackage ./default {};
in
{
  options = {
    services.nixl-provision.enabled = lib.mkEnableOption "nixl provision";
    services.nixl-provision.mode = lib.mkOption {
      type = lib.types.enum ["ephemeral" "firstboot"];
      default = "firstboot";
    };
  };

  config = lib.mkIf config.services.nixl-provision.enabled {

    networking.hostName = ""; # these have to be set via kernel cmdline

    system.activationScripts.cmdline-setup = ''
      HOSTNAME=$(${nixl-provision}/bin/cmdline hostname)
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
        # TODO: api cmdline?
        ExecStart = ''
          ${nixl-provision}/bin/nixl-provision \
            --mac=$(${nixl-provision}/bin/cmdline mac) \
            --api=$(${nixl-provision}/bin/cmdline api) \
            --mode=${config.services.nixl-provision.mode}
        '';
        StandardOutput = "journal+console";
      };
    };
  };
}
