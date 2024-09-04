{ config, pkgs, lib, modulesPath, ... }: {
  imports = [
    # (modulesPath + "/installer/scan/not-detected.nix")
    # (modulesPath + "/installer/netboot/netboot-minimal.nix")
    (modulesPath + "/installer/netboot/netboot.nix")
    (modulesPath + "/profiles/headless.nix")
    (modulesPath + "/profiles/minimal.nix")
  ];

  system.stateVersion = "24.05";
  system.disableInstallerTools = true;
  nix.enable = false;
  # boot.initrd.systemd.enable = true;
  # system.etc.overlay.enable = true;

  # boot.supportedFilesystems.zfs = lib.mkForce false;
  # boot.initrd.supportedFilesystems.zfs = lib.mkForce false;
  systemd.package = pkgs.systemdMinimal;
  systemd.coredump.enable = false;
  services.timesyncd.enable = false;
  systemd.oomd.enable = false;
  systemd.suppressedSystemUnits = [
    "systemd-hibernate-clear.service"
    "systemd-bootctl@.service"
    "systemd-bootctl.socket"
    "systemd-logind.service"
    "systemd-user-sessions.service"
    "dbus-org.freedesktop.login1.service"
  ];

  # services.nixl-provision.enabled = true;
}
