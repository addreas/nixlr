package node

import (
	"github.com/gin-gonic/gin"

	"github.com/addreas/nixlr/packages/nixlr/pkg/noderegistry"
)

func MountPaths(router *gin.RouterGroup, reg noderegistry.Registry) {
	router.PUT("/discovery/:mac", func(c *gin.Context) {})
	router.GET("/provision-info/:mac", func(c *gin.Context) {})

	router.PUT("/deploy-key/:name", func(c *gin.Context) {})
	router.PUT("/install-status/:name", func(c *gin.Context) {})

	router.GET("/secret/bootstraptoken", func(c *gin.Context) {})

	router.GET("/lock/:name/aquire", func(c *gin.Context) {})
	router.PUT("/lock/:name/release", func(c *gin.Context) {})
}
