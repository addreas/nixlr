package gocode

import (
	"fmt"
	"strings"
	"text/template"

	"cuelang.org/go/cue"
	"cuelang.org/go/cue/ast"
	cueformat "cuelang.org/go/cue/format"

	"github.com/gobeam/stringy"
)

type structDef struct {
	Name   string
	Embeds []string
	Fields []structField
}

type structField struct {
	Name  string
	Type  string
	Attrs string
	Doc   string
}

var structTemplate = template.Must(template.New("structdef").Parse(`
type {{ .Name }} struct {
{{- range $embed := .Embeds }}
	{{ $embed }}
{{- end }}
{{ range $field := .Fields }}
	{{ if $field.Doc | ne  "" }}// {{ $field.Doc }}{{ end -}}
	{{ $field.Name }} {{ $field.Type }} {{ $field.Attrs }}
{{- end }}
}
`))

type enumDef struct {
	Name   string
	Values []string
}

func capitalize(in string) string {
	return stringy.New(in).CamelCase()
}

var enumTemplate = template.Must(template.New("enumdef").Funcs(template.FuncMap{
	"capitalize": capitalize,
}).Parse(`
type {{ .Name }} string
const (
	{{- range $val := .Values }}
		{{ $.Name }}{{ $val | capitalize }} {{ $.Name }} = "{{ $val }}"
	{{- end }}
)
`))

func (g *generator) handleStruct(path cue.Path, val cue.Value) (string, error) {
	name := strings.TrimPrefix(path.String(), "#")
	typeDef := structDef{
		Name:   name,
		Embeds: []string{},
		Fields: []structField{},
	}

	_, exprs := val.Expr()
	for _, ex := range exprs {
		if ref, path := ex.ReferencePath(); ref.Exists() {

			var prefix string
			switch ex.Source().(type) {
			case *ast.SelectorExpr:
				prefix = ex.Source().(*ast.SelectorExpr).X.(*ast.Ident).Name + "."
			}

			typeDef.Embeds = append(typeDef.Embeds, prefix+strings.TrimPrefix(path.String(), "#"))
		} else {
			fields, err := ex.Value().Fields(cue.Optional(true))
			if err != nil {
				return "", err
			}
			for fields.Next() {
				jsonName := strings.Trim(fields.Selector().String(), "\"")
				goAttribute := fields.Value().Attribute("go")
				goName, _ := goAttribute.String(0)
				if goName == "" {
					goName = stringy.New(jsonName).CamelCase(":")
				}
				goType, _ := goAttribute.String(1)
				if goType == "" {
					goType, err = g.defaultTypeFor(fields.Value(), fields.IsOptional())
					if err != nil {
						return "", err
					}
				}
				maybeOmitEmpty := ""
				if fields.IsOptional() {
					maybeOmitEmpty = ",omitempty"
				}
				var src []byte
				switch fields.Value().Source().(type) {
				case *ast.Field:
					src, _ = cueformat.Node(fields.Value().Source().(*ast.Field).Value)
				default:
					src = []byte(fmt.Sprintf("%s", fields.Value()))
				}
				typeDef.Fields = append(typeDef.Fields, structField{
					Name:  goName,
					Type:  goType,
					Attrs: fmt.Sprintf("`json:\"%s%s\" cue:\"%s\"`", jsonName, maybeOmitEmpty, src),
				})
			}
		}
	}
	g.structs = append(g.structs, typeDef)
	return name, nil
}

func (g *generator) defaultTypeFor(val cue.Value, optional bool) (string, error) {
	t, err := g._defaultTypeFor(val.Path(), val)
	if optional && val.IncompleteKind() != cue.ListKind {
		return fmt.Sprintf("*%s", t), err
	}
	return t, err

}

func (g *generator) handleStringEnum(name string, operands []cue.Value) (string, error) {
	values := []string{}
	for _, op := range operands {
		values = append(values, strings.Trim(fmt.Sprint(op), "\""))
	}
	g.enums = append(g.enums, enumDef{
		Name:   name,
		Values: values,
	})

	return name, nil
}

func nameForPath(path cue.Path) string {
	res := ""
	for _, sel := range path.Selectors() {
		res += stringy.New(sel.String()).CamelCase("?", ".", "#", "")
	}
	return res
}

func (g *generator) _defaultTypeFor(path cue.Path, val cue.Value) (string, error) {
	if ref, path := val.ReferencePath(); ref.Exists() {
		return nameForPath(path), nil
	}

	if op, operands := val.Expr(); op != cue.NoOp {
		switch op {
		case cue.OrOp:
			if val.IncompleteKind().IsAnyOf(cue.NullKind) {
				var exprs []ast.Expr
				for _, o := range operands {
					if o.Kind() != cue.NullKind {
						exprs = append(exprs, o.Source().(ast.Expr))
					}
				}
				t, err := g._defaultTypeFor(val.Path(), val.Context().BuildExpr(ast.NewBinExpr(cue.OrOp.Token(), exprs...)))
				// fmt.Printf("default nullable %s: %s\n", path, val)
				return fmt.Sprintf("*%s", t), err
			} else if val.IncompleteKind() == cue.StringKind {
				// fmt.Printf("default enum %s: %s\n", path, val)
				return g.handleStringEnum(nameForPath(path), operands)
			}
		default:
			// return "", fmt.Errorf("no handler for op: %s (%s)", op, val)
		}
	}

	switch val.IncompleteKind() {
	case cue.StringKind:
		return "string", nil
	case cue.BoolKind:
		return "bool", nil
	case cue.BytesKind:
		return "bytes", nil
	case cue.IntKind:
		return "int", nil
	case cue.FloatKind:
		return "float64", nil
	case cue.NumberKind:
		return "float64", nil
	case cue.ListKind:
		// fmt.Printf("default list %#v\n", val)
		name, err := g._defaultTypeFor(path, val.LookupPath(cue.MakePath(cue.AnyIndex)))
		return fmt.Sprintf("[]%s", name), err
	case cue.TopKind:
		return "interface{}", nil
	case cue.StructKind:
		// fmt.Printf("recursive struct %s: %s\n", path, val)
		return g.handleStruct(path, val)
	case cue.StringKind | cue.NumberKind:
		return "json.RawValue", nil
	default:
		return "", fmt.Errorf("no handler for kind: %s (%s)", val.IncompleteKind(), val)
	}
}
