package apis

import "nixlr.com/types"

#AdminPaths: {
	GET: "/login/device-code": response: {
		user_code:        string
		verification_uri: string
	}

	GET: "/discovery": response: [...types.#DiscoveryInfo]
	GET: "/install-status/:name": response: types.#InstallStatus

	PUT: "/provision-info/:name": request: types.#ProvisionInfo
}
