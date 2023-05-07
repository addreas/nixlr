{ config, pkgs, lib, flakePkgs, ... }:
let
  nixl-maintain = pkgs.callPackage ./default {};
in
{
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

  config = {
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
