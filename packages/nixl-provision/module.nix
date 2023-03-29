{ config, pkgs, lib, ... }:
let
  nixl-provision = pkgs.callPackage ./default {};
in
{
  options = {
    services.nixl-self-deploy.enabled = lib.mkEnableOption "nixl self deploy";
    services.nixl-self-deploy.settings.repo = lib.mkOption {
      type = lib.types.string;
    };
  };

  config = {
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
