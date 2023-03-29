package pixiecore

import (
	"fmt"

	"github.com/gin-gonic/gin"

	"github.com/addreas/nixlr/packages/nixlr/pkg/noderegistry"
)

func MountPaths(router *gin.RouterGroup, nixlrApi string, reg noderegistry.Registry) {
	// https://github.com/danderson/netboot/blob/main/pixiecore/README.api.md
	router.GET("/v1/boot/:mac", func(c *gin.Context) {
		mac := c.Param("mac")
		if !reg.ShouldBoot(mac) {
			c.AbortWithStatus(404)
			return
		}

		paths := reg.GetNetbootNixStorePaths(mac)

		c.JSON(200, gin.H{
			"kernel": fmt.Sprintf("file:///%s/bzImage", paths.Kernel),
			"initrd": []string{fmt.Sprintf("file:///%s/initrd", paths.Initrd)},
			"cmdline": []string{
				fmt.Sprintf("init=%s/init", paths.TopLevel),
				fmt.Sprintf("nixlr-api=%s", nixlrApi),
				fmt.Sprintf("mac=%s", mac),
			},
		})
	})
}
