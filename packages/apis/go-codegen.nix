{
  fetchurl,
  fetchFromGitHub,
  oapi-codegen,
  runCommand
}:
runCommand "nixlr-go-types" {
  nativeBuildInputs = [oapi-codegen];
  petstore = fetchurl {
    url = "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/14c0908becbccd78252be49bd92be8c53cd2b9e3/examples/v3.0/petstore.yaml";
    hash = "sha256-q2D1naR41KwxLNn6vMbL0G+Pl1q4oaDCApsqQfZf7dU=";
  };
} ''
  mkdir $out
  oapi-codegen -generate types,client,gin -package petstore $petstore  > $out/petstore.gen.go
''
