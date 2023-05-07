package apis

#PixiecorePaths: {
	GET: "/v1/boot:/mac": response: {
		"kernel": string
		"initrd": [...string]
		"cmdline": [...string]
	}
}
