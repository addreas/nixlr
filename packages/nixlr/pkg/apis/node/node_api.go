package node

import (
	"github.com/gin-gonic/gin"

	"github.com/addreas/nixlr/packages/nixlr/pkg/noderegistry"
)

func MountPaths(router *gin.RouterGroup, reg noderegistry.Registry) {
	router.PUT("/discovery/:mac", func(c *gin.Context) {
		mac := c.Params.ByName("name")
		var info noderegistry.DiscoveryInfo
		c.BindJSON(info)
		err := reg.PutDiscovery(mac, info)
		if err != nil {
			c.AbortWithError(500, err)
		} else {
			c.JSON(200, info)
		}
	})

	router.GET("/provision-info/:mac", func(c *gin.Context) {
		mac := c.Params.ByName("name")
		info, err := reg.GetProvisionInfo(mac)
		if err != nil {
			c.AbortWithError(500, err)
		} else if info == nil {
			c.AbortWithStatus(404)
		} else {
			c.JSON(200, info)
		}
	})

	router.PUT("/deploy-key/:name", func(c *gin.Context) {
		name := c.Params.ByName("name")
		data, err := c.GetRawData()
		if err != nil {
			c.AbortWithError(500, err)
		} else {
			reg.PutDeployKey(name, string(data))
			// TODO: github.PutDeployKey(name, key)
		}
	})
	router.PUT("/install-status/:name", func(c *gin.Context) {
		name := c.Params.ByName("name")
		var status noderegistry.InstallStatus
		c.BindJSON(status)
		err := reg.PutInstallStatus(name, status)
		if err != nil {
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
		err := reg.LockAquire(name)
		if err != nil {
			c.AbortWithError(500, err)
		} else {
			c.Status(201)
		}
	})
	router.PUT("/lock/:name/release", func(c *gin.Context) {
		name := c.Params.ByName("name")
		reg.LockRelease(name)
		err := reg.LockAquire(name)
		if err != nil {
			c.AbortWithError(500, err)
		} else {
			c.Status(201)
		}
	})
}
