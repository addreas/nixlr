package admin

import (
	"github.com/gin-gonic/gin"

	"github.com/addreas/nixlr/packages/nixlr/pkg/noderegistry"
)

func MountPaths(router *gin.RouterGroup, reg noderegistry.Registry) {
	router.GET("/login", func(c *gin.Context) {})
	router.GET("/discovery", func(c *gin.Context) {})

	router.PUT("/provision-info/:name", func(c *gin.Context) {})
	router.GET("/install-status/:name", func(c *gin.Context) {})
}
