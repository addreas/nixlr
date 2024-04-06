{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs";
  inputs.disko.url = "github:nix-community/disko";
  inputs.disko.inputs.nixpkgs.follows = "nixpkgs";

  outputs = { self, nixpkgs, disko }:
    let
      system = "x86_64-linux";
    in
    with import nixpkgs { inherit system; }; rec {
      packages.${system} =
        let
          mkDenoPackage = import ./mk-deno-package.nix { inherit lib pkgs; };
        in
        {
          cmdline = callPackage ./nixl/cmdline { inherit mkDenoPackage; };

          nixl = callPackage ./nixlr/nixl { };
        };

      nixosConfigurations =
        let
          just-a-machine = name: nixpkgs.lib.nixosSystem {
            inherit system;
            specialArgs = { flakePkgs = self.packages.${system}; };
            modules = [
              disko.nixosModules.disko
              "${self}/machines/${name}/configuration.nix"
              "${self}/nixl/module.nix"
            ];
          };
        in
        {
          nixl-pxe-provision = just-a-machine "nixl-pxe-provision";
          nixl-pxe-tmpfs = just-a-machine "nixl-pxe-tmpfs";
          test-node = just-a-machine "test-node";
        };
    };
}
