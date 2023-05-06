package apis

import "nixlr.com/types"

#NodePaths: {
	PUT: "/discovery/:mac": request:       types.#DiscoveryInfo
	GET: "/provision-info/:mac": response: types.#ProvisionInfo

	PUT: "/deploy-key/:namme": request:     string
	PUT: "/install-status/:namme": request: types.#InstallStatus

	GET: "/secret/bootstraptoken": response: string

	PUT: "/lock/:name": {}
	DELETE: "/lock/:name": {}
}
