package gocode

import (
	"fmt"
	"strings"
	"text/template"

	"cuelang.org/go/cue"
	"cuelang.org/go/cue/ast"
	cueformat "cuelang.org/go/cue/format"
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
	return strings.ToUpper(in[:1]) + in[1:]
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

func (g *generator) handleStruct(sel cue.Selector, val cue.Value, optional bool) error {
	typeDef := structDef{
		Name:   strings.TrimPrefix(sel.String(), "#"),
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
				return err
			}
			for fields.Next() {
				jsonName := fields.Selector().String()
				goAttribute := fields.Value().Attribute("go")
				goName, _ := goAttribute.String(0)
				if goName == "" {
					goName = capitalize(jsonName)
				}
				goType, _ := goAttribute.String(1)
				if goType == "" {
					goType = g.defaultTypeFor(fields.Value(), fields.IsOptional())
				}
				maybeOmitEmpty := ""
				if fields.IsOptional() {
					maybeOmitEmpty = ",omitempty"
				}
				src, _ := cueformat.Node(fields.Value().Source().(*ast.Field).Value)
				typeDef.Fields = append(typeDef.Fields, structField{
					Name:  goName,
					Type:  goType,
					Attrs: fmt.Sprintf("`json:\"%s%s\" cue:\"%s\"`", jsonName, maybeOmitEmpty, src),
				})
			}
		}
	}
	g.structs = append(g.structs, typeDef)
	return nil
}

func (g *generator) defaultTypeFor(val cue.Value, optional bool) string {
	if op, operands := val.Expr(); op != cue.NoOp {
		switch op {
		case cue.OrOp:
			if val.IncompleteKind() == cue.StringKind {
				name := strings.Replace(strings.TrimPrefix(val.Path().String(), "#"), ".", "", -1)
				g.handleStringEnum(name, operands)
				return name
			}
		}
	}

	t := _defaultTypeFor(val)
	if optional {
		return "*" + t
	} else {
		return t
	}
}

func (g *generator) handleStringEnum(name string, operands []cue.Value) {
	values := []string{}
	for _, op := range operands {
		values = append(values, strings.Trim(fmt.Sprint(op), "\""))
	}
	g.enums = append(g.enums, enumDef{
		Name:   name,
		Values: values,
	})
}

func _defaultTypeFor(val cue.Value) string {
	switch val.IncompleteKind() {
	case cue.StringKind:
		return "string"
	case cue.BoolKind:
		return "bool"
	case cue.BytesKind:
		return "bytes"
	case cue.FloatKind:
		return "float64"
	case cue.IntKind:
		return "int"
	case cue.ListKind:
		return "[]" + _defaultTypeFor(val.LookupPath(cue.MakePath(cue.AnyIndex)))
	case cue.TopKind:
		return "interface{}"
	default:
		if ref, path := val.ReferencePath(); ref.Exists() {
			return strings.TrimPrefix(path.String(), "#")
		}
		return "unknown"
	}
}
