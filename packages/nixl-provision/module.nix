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

  config = {
    # TODO: mkIf
    systemd.services.nixl-provision = {
      description = "Run the nixl-provision daemon";
      wantedBy = [ "multi-user.target" ];
      serviceConfig = {
        ExecStart = "${nixl-provision}/bin/nixl-provision";
        StandardOutput = "journal+console";
      };
    };
  };
}
