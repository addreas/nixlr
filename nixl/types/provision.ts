export type ProvisionStatus = {
  hostname: string;
  events: ProvisionEvent[];
};
export type ProvisionEvent = {
  name: string;
};

export type ProvisionInfo = {
  api: string;
  hostname: string;
  installScript: string;
  /*
    nix run /tmp/etx/nixos#nixosConfigurations.${info.hostname}.config.system.build.diskoScript

    nixos-install
            --root /mnt \
            --no-root-password \
            --option extra-experimental-features auto-allocate-uids \
            --option extra-experimental-features cgroups \
            --flake /tmp/etx/nixos#${info.hostname}

    mv /tmp/etc/nixos /mnt/etc/nixos`;
    mkdir -p /mnt/root/.ssh/ && mv /tmp/id_ed25519* /mnt/root/.ssh
  */
};
