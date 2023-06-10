package node

import (
	"github.com/gin-gonic/gin"

	"github.com/addreas/nixlr/packages/nixlr/pkg/github"
	"github.com/addreas/nixlr/packages/nixlr/pkg/noderegistry"
)

func MountPaths(router *gin.RouterGroup, reg noderegistry.Registry) {
	router.PUT("/discovery/:mac", func(c *gin.Context) {
		mac := c.Params.ByName("name")

		var info noderegistry.DiscoveryInfo
		if err := c.BindJSON(info); err != nil {
			c.AbortWithError(500, err)
		} else if err := reg.PutDiscovery(mac, info); err != nil {
			c.AbortWithError(500, err)
		} else {
			c.JSON(200, info)
		}
	})

	router.GET("/provision-info/:mac", func(c *gin.Context) {
		mac := c.Params.ByName("name")

		if info, err := reg.GetProvisionInfo(mac); err != nil {
			c.AbortWithError(500, err)
		} else if info == nil {
			c.AbortWithStatus(404)
		} else {
			c.JSON(200, info)
		}
	})

	router.POST("/deploy-key/:name", func(c *gin.Context) {
		name := c.Params.ByName("name")

		if data, err := c.GetRawData(); err != nil {
			c.AbortWithError(500, err)
		} else if err = reg.PutDeployKey(name, string(data)); err != nil {
			c.AbortWithError(500, err)
		} else if err = github.PutDeployKey(name, string(data)); err != nil {
			c.AbortWithError(500, err)
		}
	})
	router.PUT("/install-status/:name", func(c *gin.Context) {
		name := c.Params.ByName("name")

		var status noderegistry.InstallStatus
		if err := c.BindJSON(status); err != nil {
			c.AbortWithError(500, err)
		} else if err := reg.PutInstallStatus(name, status); err != nil {
			c.AbortWithError(500, err)
		} else {
			c.JSON(200, status)
		}
	})

	router.GET("/secret/bootstraptoken", func(c *gin.Context) {
		// TODO how to handle bootstrap token?
	})

	router.GET("/lock/:name/aquire", func(c *gin.Context) {
		name := c.Params.ByName("name")

		if err := reg.LockAquire(name); err != nil {
			c.AbortWithError(500, err)
		} else {
			c.Status(201)
		}
	})
	router.PUT("/lock/:name/release", func(c *gin.Context) {
		name := c.Params.ByName("name")

		if err := reg.LockRelease(name); err != nil {
			c.AbortWithError(500, err)
		} else {
			c.Status(201)
		}
	})
}
