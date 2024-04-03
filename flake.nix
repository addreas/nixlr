{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs";
  inputs.disko.url = "github:nix-community/disko";
  inputs.disko.inputs.nixpkgs.follows = "nixpkgs";

  outputs = { self, nixpkgs, pnpm2nix }:
    let
      system = "x86_64-linux";
    in
    with import nixpkgs { inherit system; }; rec {
      packages.${system} =
        let
          mkDenoPackage = import ./mk-deno-package.nix { inherit lib pkgs; };
        in
        {
          cmdline = callPackage ./packages/cmdline { inherit mkDenoPackage; };

          nixl = callPackage ./packages/nixlr/nixl { };
        };

      nixosConfigurations =
        let
          just-a-machine = name: nixpkgs.lib.nixosSystem {
            inherit system;
            specialArgs = { flakePkgs = self.packages.${system}; };
            modules = [ "${self}/machines/${name}/configuration.nix" ];
          };
        in
        {
          nixl-pxe-provision = just-a-machine "nixl-pxe-provision";
          nixl-pxe-tmpfs = just-a-machine "nixl-pxe-tmpfs";

          test = nixpkgs.lib.nixosSystem {
            inherit system; modules = [
            (nixpkgs + "/nixos/modules/installer/netboot/netboot-minimal.nix")
          ];
          };
          # test-node = just-a-machine "test-node";
        };
    };
}
