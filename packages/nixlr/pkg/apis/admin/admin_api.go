package admin

import (
	"github.com/gin-gonic/gin"

	"github.com/addreas/nixlr/packages/nixlr/pkg/noderegistry"
)

func MountPaths(router *gin.RouterGroup, reg noderegistry.Registry) {
	router.GET("/discovery", func(c *gin.Context) {
		discoveredNodes := reg.GetDiscovery()
		c.JSON(200, discoveredNodes)
	})

	router.PUT("/provision-info/:name", func(c *gin.Context) {
		var info noderegistry.ProvisionInfo
		err := c.BindJSON(info)
		if err != nil {
			c.AbortWithError(500, err)
		} else {
			err := reg.PutProvisionInfo(c.Params.ByName("name"), info)
			if err != nil {
				c.AbortWithError(500, err)
			} else {
				c.JSON(200, info)
			}
		}
	})

	router.GET("/install-status/:name", func(c *gin.Context) {
		status, err := reg.GetInstallStatus(c.Params.ByName("name"))
		if err != nil {
			c.AbortWithError(500, err)
		} else if status == nil {
			c.AbortWithStatus(404)
		} else {
			c.JSON(200, status)
		}

	})
}
