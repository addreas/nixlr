package pixiecore

import (
	"fmt"

	"github.com/gin-gonic/gin"

	"github.com/addreas/nixlr/packages/nixlr/pkg/noderegistry"
)

var (
	toplevelDrv = "/nix/store/..." // for nixosSystem.config.system.build.toplevel
	kernelDrv   = "/nix/store/..." // for nixosSystem.config.system.build.kernel
	initrdDrv   = "/nix/store/..." // for nixosSystem.config.system.build.netbootRamdisk
)

func MountPaths(router *gin.RouterGroup, nixlrApi string, reg noderegistry.Registry) {
	// https://github.com/danderson/netboot/blob/main/pixiecore/README.api.md
	router.GET("/v1/boot/:mac", func(c *gin.Context) {
		mac := c.Param("mac")
		if !reg.ShouldBoot(mac) {
			c.AbortWithStatus(404)
			return
		}

		c.JSON(200, gin.H{
			"kernel": fmt.Sprintf("file:///%s/bzImage", kernelDrv),
			"initrd": []string{fmt.Sprintf("file:///%s/initrd", initrdDrv)},
			"cmdline": []string{
				fmt.Sprintf("init=%s/init", toplevelDrv),
				fmt.Sprintf("nixlr-api=%s", nixlrApi),
				fmt.Sprintf("mac=%s", mac),
			},
		})
	})
}
