{ config, pkgs, lib, ... }:
let
  nixl-provision = pkgs.callPackage ./default {};
in
{
  options = {
    services.nixl-provision.enabled = lib.mkEnableOption "nixl provision";
    services.nixl-provision.mode = lib.mkOption {
      type = lib.types.enum ["ephemeral" "firstboot"];
    };
  };

  config = lib.mkIf config.services.nixl-provision.enabled {
    systemd.services.nixl-provision = {
      description = "Run the nixl-provision daemon";
      wantedBy = [ "multi-user.target" ];
      serviceConfig = {
        # TODO: api cmdline?
        ExecStart = "${nixl-provision}/bin/nixl-provision --mac=$(${nixl-provision}/bin/cmdline mac) --api=$(${nixl-provision}/bin/cmdline api) --mode=${config.services.nixl-provision.mode}";
        StandardOutput = "journal+console";
      };
    };
  };
}
