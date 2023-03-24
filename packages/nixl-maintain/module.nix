{ config, pkgs, lib, ... }: 
let
  nixl-maintain = pkgs.callPackage ./default {};
in
{
  options = {
    services.nixl-self-deploy.enabled = lib.mkEnableOption "nixl self deploy";
    services.nixl-self-deploy.settings.repo = lib.mkOption {
      type = lib.types.string;
    };
  };

  config = {
    systemd.services.nixl-maintain = {
      description = "Run the nixl-maintain daemon";
      wantedBy = [ "multi-user.target" ];
      serviceConfig = {
        ExecStart = "${nixl-maintain}/bin/nixl-maintain";
        StandardOutput = "journal+console";
      };
    };

    systemd.services.nixl-self-deploy = {
      description = "Run the nixl-self-deploy script";
    };

  };
}
