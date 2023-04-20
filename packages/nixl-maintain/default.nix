{ lib, mkDenoPackage, ... }: mkDenoPackage {
  pname = "nixl-maintain";
  version = "0.0.0";

  # src = ./.;
  src = lib.cleanSource;
}
