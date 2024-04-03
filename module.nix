{ config, pkgs, lib, ... }:
let
  cfg = config.services.nixlr;

  nixlr = pkgs.callPackage ./default { };
in
{
  options = {
    services.nixlr = {
      enabled = lib.mkEnableOption "nixlr";
      hostname = lib.mkOption { type = lib.types.string; };
      certFile = lib.mkOption { type = lib.types.string; };
      keyFile = lib.mkOption { type = lib.types.string; };
      defaultSystemFlake = lib.mkOption { type = lib.types.string; };

      pixiecore-api-port = lib.mkOption {
        type = lib.types.int;
        default = 9814;
      };

      github-client-id = lib.mkOption {
        default = "01ca7d6823ac66b96743";
        type = lib.types.str;
      };
    };
  };

  config = lib.mkIf cfg.enable {

    services.pixiecore = {
      enable = true;
      mode = "api";
      apiServer = "http://localhost:${builtins.toString cfg.port}";
      openFirewall = true; #incorrectly opens 4011 on TCP
      dhcpNoBind = true;
    };

    networking.firewall.allowedTCPPorts = [cfg.port];
    networking.firewall.allowedUDPPorts = [4011];

    systemd.services.nixlr = {
      description = "Run the nixlr coordinator";
      wantedBy = [ "multi-user.target" ];
      serviceConfig.ExecStart = lib.strings.concatStringsSep " " [
        ${nixlr}/bin/nixlr
          "--cert=${cfg.certFile}"
          "--key=${cfg.keyFile}"
          "--pixiecore-api-port ${builtins.toString cfg.pixiecore-api-port}"
          "--default-system-flake=${cfg.defaultSystemFlake}"
          "--github-client-id=${cfg.github-client-id}"
      ];
    };
  };
}
