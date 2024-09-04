{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs";
  inputs.disko.url = "github:nix-community/disko";
  inputs.disko.inputs.nixpkgs.follows = "nixpkgs";

  outputs = { self, nixpkgs, flake-utils, disko, ... } @ inputs: {

    packages = flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      { });

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
