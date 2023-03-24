{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs";

  outputs = { self, nixpkgs }: 
  let
    system = "x86_64-linux";
  in with import nixpkgs { inherit system; }; rec {
    packages.${system} = {
      nixlr =  callPackage ./packages/nixlr { };
      nixl-maintain =  callPackage ./packages/nixl-maintain { };
      nixl-provision =  callPackage ./packages/nixl-provision { };
      nixlr-ui =  callPackage ./packages/nixlr-ui { };
    };

    nixosConfigurations = {
      nixl-pxe-provision = nixpkgs.lib.nixosSystem {
        inherit system;
        modules = [ "${self}/machines/nixl-pxe-provision" ] ;
      };

      test-node = nixpkgs.lib.nixosSystem {
        inherit system;
        modules = [ "${self}/machines/test-node"] ;
      };
    };
  };
}
