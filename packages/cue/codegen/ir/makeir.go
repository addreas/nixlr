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
		f := val.Source().(*ast.File)
		fmt.Println(f.Filename)

		imports := []Import{}
		types := []TypeDecl{}

		for _, decl := range f.Decls {
			switch decl := decl.(type) {
			case *ast.ImportDecl:
				for _, imp := range decl.Specs {
					imports = append(imports, Import{
						Name: imp.Name.Name,
						Path: imp.Path.Value,
					})
				}
			case *ast.Field:
				types = append(types, visitTopType(decl))
			default:
				fmt.Println(reflect.TypeOf(decl))
			}
		}

		files = append(files, File{
			Name:    f.Filename,
			Imports: imports,
			Types:   types,
		})
	}

	return files
}

func visitTopType(field *ast.Field) TypeDecl {
	fmt.Println("visitTopType", field)

	return TypeDecl{
		Name:  fmt.Sprint(field.Label),
		Doc:   fmt.Sprint(field.Comments()),
		Value: visitExpr(field.Value),
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
	default:
		fmt.Println("unknown expr", expr)
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
			fields = append(fields, StructField{
				Name:     fmt.Sprint(el.Label),
				Optional: el.Optional.IsValid(),
				Doc:      fmt.Sprint(el.Comments()),
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
		if val.IncompleteKind().IsAnyOf(cue.NullKind) {
			var vals []cue.Value
			for _, o := range operands {
				if o.Kind() != cue.NullKind {
					vals = append(vals, o)
				}
			}
			return visitUnion(val, vals), true
		}
	}
	return visitExpr(expr), false
}

func visitUnion(val cue.Value, vals []cue.Value) Type {
	if val.IncompleteKind() == cue.StringKind {
		strs := []string{}
		for _, v := range vals {
			strs = append(strs, fmt.Sprint(v))
		}
		return &StringUnion{
			Values: strs,
		}
	} else {
		return &DiscriminatedStructUnion{}
	}
}
