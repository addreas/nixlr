package main

import (
	"fmt"

	"github.com/addreas/nixlr/packages/nixlr/pkg/apis/admin"
	"github.com/addreas/nixlr/packages/nixlr/pkg/apis/node"
	"github.com/addreas/nixlr/packages/nixlr/pkg/apis/pixiecore"
	"github.com/addreas/nixlr/packages/nixlr/pkg/github"
	"github.com/addreas/nixlr/packages/nixlr/pkg/noderegistry"
	"github.com/gin-gonic/gin"
	"github.com/spf13/pflag"
)

var (
	hostname = pflag.String("hostname", "localhost", "domain name where api will be available for nodes")
	certFile = pflag.String("cert", "./tls.crt", "tls cert file")
	keyFile  = pflag.String("key", "./tls.key", "tls key file")

	nixlrApiPort = pflag.Int("port", 9813, "port for nixlr api")

	pixiecoreApiPort = pflag.Int("pixiecore-api-port", 9814, "port for the pixiecore api responder")

	defaultSystemFlake = pflag.String("default-system-flake", ".#nixosConfigurations.nixl-pxe-tmpfs", "a reference to a nixosConfiguration in a flake")

	githubClientId = pflag.String("github-client-id", "asdfasdf", "github client id for deploy key upload functionality")
)

func main() {
	pflag.Parse()

	defaultSystemPaths, err := noderegistry.BuildSystemFlake(*defaultSystemFlake)
	if err != nil {
		panic(err)
	}

	registry := noderegistry.NewMemoryRegistry(*defaultSystemPaths)
	registry.AddNode("aa:aa:aa:aa:aa:aa", "test", ".#nixosConfigurations.test")

	github.Login(*githubClientId)

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.SetTrustedProxies(nil)

	nodeGroup := router.Group("/node")
	node.MountPaths(nodeGroup, registry)

	adminGroup := router.Group("/admin")
	admin.MountPaths(adminGroup, registry)

	pixieRouter := gin.New()
	pixieRouter.Use(gin.Logger())
	pixieRouter.Use(gin.Recovery())
	pixieRouter.SetTrustedProxies(nil)

	pixiecore.MountPaths(pixieRouter.Group("/"), fmt.Sprintf("https://%s:9813", *hostname), registry)

	go pixieRouter.Run(fmt.Sprintf("localhost:%d", *pixiecoreApiPort))
	router.RunTLS(fmt.Sprintf("0.0.0.0:%d", *nixlrApiPort), *certFile, *keyFile)
}
