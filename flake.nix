{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs";
  inputs.disko.url = "github:nix-community/disko";
  inputs.disko.inputs.nixpkgs.follows = "nixpkgs";

  outputs = { self, nixpkgs, flake-utils, disko, ... } @ inputs:
    (flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        appScript = name: script: flake-utils.lib.mkApp { drv = pkgs.writeScriptBin name script; };
      in
      {
        apps = rec {
          hello = flake-utils.lib.mkApp { drv = self.packages.${system}.hello; };
          default = hello;

          discoveryQemu = appScript "qemu-run-discovery" ''
            #!/bin/sh
            ${pkgs.qemu}/bin/qemu-system-x86_64 \
              -kernel ${pkgs.linuxPackages_latest.kernel}/bzImage \
              -initrd ${self.packages.${system}.discoveryInitrd}/initrd \
              -m 1G \
              -cpu host \
              -enable-kvm \
              -append "console=ttyS0" -nographic # ctrl+a, x to exit
            '';
        };
        packages = rec {
          hello = pkgs.hello;
          default = hello;

          discoveryInit = pkgs.buildGoModule rec {
            pname = "discovery-init";
            version = "0.0.0";

            src = ./discovery;
            vendorHash = "sha256-TZb/1FzWJ9ZD3S0rsWu6ImVp4FBXPwbcqn8Vw1lXtzI=";
          };

          discoveryInitrd = pkgs.makeInitrdNG {
            compressor = "zstd";
            contents = [
              {
                source = "${discoveryInit}/bin/init";
                target = "/init";
              }
            # {
            #   source = "${pkgs.bash}/bin/bash";
            #   target = "/init";
            # }
            # {
            #   source = pkgs.writeScript "ok.sh" ''
            #   export PATH=${with pkgs; lib.makeBinPath [
            #         # glibc
            #         # cacert
            #         bash
            #         eudev
            #         lshw
            #         dmidecode
            #         lldpd
            #         efibootmgr
            #         usbutils
            #         pciutils
            #         util-linux
            #         coreutils
            #       ]}

            #   mkdir /proc /sys
            #   mount -t devtmpfs devtmpfs /dev
            #   mount -t proc proc /proc
            #   mount -t sysfs sysfs /sys
            #   '';
            #   target = "/init.sh";
            # }
            ] ++ (
              let
                packages =
                  with pkgs; [
                    glibc
                    cacert
                    eudev
                    lshw
                    dmidecode
                    lldpd
                    efibootmgr
                    usbutils
                    pciutils
                    util-linux
                    coreutils
                  ];
              in
              (map (p: { source = p; }) packages)
            );
          };
        };
      }
    )) // {
      nixosConfigurations =
        let
          just-a-machine = name: system: nixpkgs.lib.nixosSystem {
            inherit system;
            specialArgs = { flakePkgs = self.packages.${system}; };
            modules = [
              disko.nixosModules.disko
              "${self}/machines/${name}/configuration.nix"
            ];
          };
        in
        {
          nixl-pxe-provision = just-a-machine "nixl-pxe-provision" "x86_64-linux";
          nixl-pxe-tmpfs = just-a-machine "nixl-pxe-tmpfs" "x86_64-linux";
          test-node = just-a-machine "test-node" "x86_64-linux";
        };
    };
}
