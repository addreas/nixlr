package gocode

import "text/template"

type handlerDef struct {
	Method string
	Path   string
	Params []string

	RequestType  string
	RepsonseType string
}

var handlerTemplate = template.Must(template.New("handler").Parse(`
var handler = router.{{ .Method }}("{{ .Path }}", func(c *gin.Context) {
	var request *{{ .RequestType }}
	err := c.BindJSON(request)
	if err != nil {
		c.AbortWithError(500, err)
	} else {
		res, err := impl.{{ .Method }}("{{ .Path }}", request)
		if err != nil {
			c.AbortWithError(500, err)
		} else {
			c.JSON(200, res)
		}
	}
})
`))
