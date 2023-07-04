package ir

import (
	"fmt"
	"reflect"

	"cuelang.org/go/cue"
	"cuelang.org/go/cue/ast"
	"cuelang.org/go/cue/cuecontext"
	"cuelang.org/go/cue/load"
)

func GetIR() []File {
	ctx := cuecontext.New()
	// insts := load.Instances([]string{"."}, &load.Config{Dir: "..", Package: "apis"})
	// insts := load.Instances([]string{"."}, &load.Config{Dir: ".", Package: "v1beta1"})
	insts := load.Instances([]string{"."}, &load.Config{Dir: "../types"})
	vals, err := ctx.BuildInstances(insts)
	if err != nil {
		panic(err)
	}
	_, vals = vals[0].Expr() // split single instance into files

	files := []File{}
	for _, val := range vals {
		files = append(files, visitFile(val))
	}

	return files
}

func visitFile(file cue.Value) File {
	f := file.Source().(*ast.File)
	fmt.Println(f.Filename)

	imports := []Import{}
	types := []TypeDecl{}

	for _, decl := range f.Decls {
		switch decl := decl.(type) {
		case *ast.ImportDecl:
			for _, imp := range decl.Specs {
				name := ""
				if imp.Name != nil {
					name = imp.Name.Name
				}
				imports = append(imports, Import{
					Name: name,
					Path: imp.Path.Value,
				})
			}
		case *ast.Field:
			types = append(types, visitTopType(decl))
		default:
			fmt.Println(reflect.TypeOf(decl))
		}
	}

	return File{
		Name:    f.Filename,
		Imports: imports,
		Types:   types,
	}
}

func visitTopType(field *ast.Field) TypeDecl {
	fmt.Println("visitTopType", field)

	t, _ := visitMaybeNullableType(field.Value)
	doc := field.Comments()
	if len(doc) == 0 {
		doc = nil
	}
	return TypeDecl{
		Name:  fmt.Sprint(field.Label),
		Doc:   doc,
		Value: t,
	}
}

func visitExpr(expr ast.Expr) Type {
	switch expr := expr.(type) {
	case *ast.StructLit:
		embeds, fields := visitStruct(expr)
		return &StructType{
			Embeds: embeds,
			Fields: fields,
		}
	case *ast.Ident:
		switch expr.String() {
		case "int":
			return &Int{}
		case "float":
			return &Float{}
		case "bool":
			return &Boolean{}
		case "string":
			return &String{}
		default:
			fmt.Printf("unknown ident: %#v\n", expr)
			return nil
		}
	case *ast.ListLit:
		tupleItems := []Type{}
		for _, thing := range expr.Elts {
			if ellipsis, ok := thing.(*ast.Ellipsis); ok {
				return &List{
					ElementType: visitExpr(ellipsis.Type),
				}
			} else {
				tupleItems = append(tupleItems, visitExpr(thing))
			}
		}
		return &Tuple{ElementTypes: tupleItems}
	default:
		fmt.Printf("unknown expr: %#v\n", expr)
		return nil
	}
}

func visitStruct(expr *ast.StructLit) ([]Type, []StructField) {
	embeds := []Type{}
	fields := []StructField{}

	for _, el := range expr.Elts {
		switch el := el.(type) {
		case *ast.EmbedDecl:
			embeds = append(embeds, visitExpr(el.Expr))
		case *ast.Field:
			val, nullable := visitMaybeNullableType(el.Value)
			doc := el.Comments()
			if len(doc) == 0 {
				doc = nil
			}
			fields = append(fields, StructField{
				Name:     fmt.Sprint(el.Label),
				Optional: el.Optional.IsValid(),
				Doc:      doc,
				Nullable: nullable,
				Value:    val,
			})
		}
	}

	return embeds, fields
}

func visitMaybeNullableType(expr ast.Expr) (Type, bool) {
	val := cuecontext.New().BuildExpr(expr)
	if op, operands := val.Expr(); op == cue.OrOp {
		var vals []cue.Value
		if val.IncompleteKind().IsAnyOf(cue.NullKind) {
			for _, o := range operands {
				if o.Kind() != cue.NullKind {
					vals = append(vals, o)
				}
			}
		} else {
			vals = operands
		}
		return visitUnion(val, vals), true
	}
	return visitExpr(expr), false
}

func visitUnion(val cue.Value, vals []cue.Value) Type {
	if val.IncompleteKind() == cue.StringKind {
		strs := []string{}
		for _, v := range vals {
			str, _ := v.String()
			strs = append(strs, str)
		}
		return &StringUnion{
			Values: strs,
		}
	} else {
		return &DiscriminatedStructUnion{}
	}
}
