{ buildGoModule, lib, pkgs, ... }:
buildGoModule rec {
  pname = "nixlr";
  version = "0.0.0";

  src = ./.;

  vendorHash = "sha256-NQnVyUYC/2/JfLyp1fVz9Xg/aT2aXBzpuHOzm7j3lBM=";
}
