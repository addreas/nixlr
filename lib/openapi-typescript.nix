{ pkgs, pnpm2nix }:
let
  mkPnpmPackage = (import "${pnpm2nix}/default.nix" { inherit pkgs; }).mkPnpmPackage;
in
mkPnpmPackage rec {
  pname = "openapi-typescript";
  version = "6.2.0";

  src = pkgs.fetchFromGitHub {
    owner = "drwpow";
    repo = pname;
    rev = "v${version}";
    hash = "sha256-G/VgiousapxgnfdPsAXGYVaiz4dCX4DusPTcGeL1FNU=";
  };

  linkDevDependencies = true;
  postBuild = "pushd ./node_modules/openapi-typescript && npm run build && popd";
}
