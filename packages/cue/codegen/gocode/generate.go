package gocode

import (
	"bytes"
	"strings"
	"text/template"

	"cuelang.org/go/cue"
	"cuelang.org/go/cue/ast"
)

type generator struct {
	imports []importSpec

	structs  []structDef
	enums    []enumDef
	handlers []handlerDef
}

type importSpec struct {
	Label   string
	Package string
}

var importsTemplate = template.Must(template.New("imports").Parse(`
import (
{{- range $import := . }}
	{{ $import.Label }} {{ $import.Package }}
{{- end }}
)
`))

func Generate(val cue.Value) ([]byte, error) {
	g := generator{
		imports:  []importSpec{},
		structs:  []structDef{},
		handlers: []handlerDef{},
	}

	val.Syntax().(*ast.File).VisitImports(func(d *ast.ImportDecl) {
		for _, spec := range d.Specs {
			label := ""
			if spec.Name != nil {
				label = spec.Name.Name
			}
			g.imports = append(g.imports, importSpec{
				Label:   label,
				Package: spec.Path.Value,
			})
		}
	})

	err := g.handleFields(val)
	if err != nil {
		return nil, err
	}
	// g.handleHandlers(val)

	output := bytes.Buffer{}

	importsTemplate.Execute(&output, g.imports)

	for _, enum := range g.enums {
		if err := enumTemplate.Execute(&output, enum); err != nil {
			return nil, err
		}
	}

	for _, typeDef := range g.structs {
		if err := structTemplate.Execute(&output, typeDef); err != nil {
			return nil, err
		}
	}

	for _, handler := range g.handlers {
		err := handlerTemplate.Execute(&output, handler)
		if err != nil {
			return nil, err
		}
	}

	return output.Bytes(), nil
	// return format.Source(output.Bytes())

}
func (g *generator) handleFields(val cue.Value) error {
	it, err := val.Fields(cue.Definitions(true))
	if err != nil {
		return err
	}

	for it.Next() {
		sel := it.Selector()
		val := it.Value()

		// fmt.Printf("%s: %s\n", sel, val)

		switch val.IncompleteKind() {
		case cue.StructKind:
			_, err := g.handleStruct(cue.MakePath(sel), val)
			if err != nil {
				return err
			}
			// fmt.Printf("generated type for %s\n", name)
		case cue.StringKind:
			if op, operands := val.Expr(); op == cue.OrOp {
				g.handleStringEnum(strings.TrimPrefix(sel.String(), "#"), operands)
			}
		}

	}

	return nil
}
