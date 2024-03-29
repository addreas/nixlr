{
  inputs.nixpkgs.url = "nixpkgs/nixos-23.05";
  inputs.pnpm2nix.url = "github:pupbrained/pnpm2nix";
  inputs.pnpm2nix.flake = false;

  outputs = { self, nixpkgs, pnpm2nix }:
    let
      system = "x86_64-linux";
    in
    with import nixpkgs { inherit system; }; rec {
      packages.${system} =
        let
          openapi-typescript = import ./lib/openapi-typescript.nix { inherit pkgs pnpm2nix; };
          oapi-codegen = import ./lib/oapi-codegen.nix { inherit pkgs; };
          mkDenoPackage = import ./lib/deno.nix { inherit lib pkgs; };
        in
        {
          cmdline = callPackage ./packages/cmdline { inherit mkDenoPackage; };

          nixlr = callPackage ./packages/nixlr { };
          nixl-maintain = callPackage ./packages/nixl-maintain { inherit mkDenoPackage; };
          nixl-provision = callPackage ./packages/nixl-provision { inherit mkDenoPackage; };
          nixlr-ui = callPackage ./packages/nixlr-ui { };

          typescript-types = callPackage ./packages/cue/nix/typescript-codegen.nix { inherit openapi-typescript; };
          go-types = callPackage ./packages/cue/nix/go-codegen.nix { inherit oapi-codegen; };
        };

      nixosConfigurations =
        let
          just-a-machine = name: nixpkgs.lib.nixosSystem {
            inherit system;
            specialArgs = { flakePkgs = self.packages.${system};};
            modules = [ "${self}/machines/${name}/configuration.nix" ];
          };
        in
        {
          nixl-pxe-provision = just-a-machine "nixl-pxe-provision";
          nixl-pxe-tmpfs = just-a-machine "nixl-pxe-tmpfs";

          test = nixpkgs.lib.nixosSystem { inherit system; modules = [
            (nixpkgs + "/nixos/modules/installer/netboot/netboot-minimal.nix")
          ]; };
          # test-node = just-a-machine "test-node";
        };
    };
}
