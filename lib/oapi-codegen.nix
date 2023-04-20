{ pkgs }: pkgs.buildGoModule rec {
  pname = "oapi-codegen";
  version = "1.12.4";

  src = pkgs.fetchFromGitHub {
    owner = "deepmap";
    repo = "oapi-codegen";
    rev = "v${version}";
    sha256 = "sha256-VbaGFTDfe/bm4EP3chiG4FPEna+uC4HnfGG4C7YUWHc=";
  };

  vendorHash = "sha256-o9pEeM8WgGVopnfBccWZHwFR420mQAA4K/HV2RcU2wU=";

  subPackages = [ "cmd/oapi-codegen" ];
  doCheck = false;
}
