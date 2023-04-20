{
  fetchurl,
  fetchFromGitHub,
  openapi-typescript,
  runCommand
}:
runCommand "nixlr-typescript-types" {
  nativeBuildInputs = [openapi-typescript];
  petstore = fetchurl {
    url = "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/14c0908becbccd78252be49bd92be8c53cd2b9e3/examples/v3.0/petstore.yaml";
    hash = "sha256-q2D1naR41KwxLNn6vMbL0G+Pl1q4oaDCApsqQfZf7dU=";
  };
} ''
  openapi-typescript $petstore --export-type --output $out/petstore.d.ts
''
