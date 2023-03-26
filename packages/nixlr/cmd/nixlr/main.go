package main

import (
	"fmt"

	"github.com/addreas/nixlr/packages/nixlr/pkg/apis/admin"
	"github.com/addreas/nixlr/packages/nixlr/pkg/apis/node"
	"github.com/addreas/nixlr/packages/nixlr/pkg/apis/pixiecore"
	"github.com/addreas/nixlr/packages/nixlr/pkg/noderegistry"
	"github.com/gin-gonic/gin"
	"github.com/spf13/pflag"
)

var (
	hostname = pflag.String("hostname", "localhost", "domain name where api will be available")
	certFile = pflag.String("cert", "./tls.crt", "tls cert file")
	keyFile  = pflag.String("key", "./tls.key", "tls key file")
)

func main() {
	pflag.Parse()

	registry := noderegistry.NewMockRegistry()

	router := gin.Default()
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

	go pixieRouter.Run("localhost:9814")
	router.RunTLS("0.0.0.0:9813", *certFile, *keyFile)
}
