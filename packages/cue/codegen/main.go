package main

import (
	"fmt"

	"cuelang.org/go/cue/ast"
	"cuelang.org/go/cue/cuecontext"
	"cuelang.org/go/cue/load"

	"github.com/addreas/nixlr/packages/cue/codegen/gocode"
)

func main() {
	ctx := cuecontext.New()
	// insts := load.Instances([]string{"."}, &load.Config{Dir: "..", Package: "apis"})
	// insts := load.Instances([]string{"."}, &load.Config{Dir: ".", Package: "v1beta1"})
	insts := load.Instances([]string{"."}, &load.Config{Dir: "../types"})
	vals, err := ctx.BuildInstances(insts)
	if err != nil {
		panic(err)
	}

	_, vals = vals[0].Expr() // split single instance into files

	for _, val := range vals {
		f := val.Source().(*ast.File)
		fmt.Println(f.Filename)

		gocode, err := gocode.Generate(val)
		if err != nil {
			panic(err)
		}
		fmt.Printf("%s", gocode)
	}
	// fmt.Printf("cue  val: %#v\n", val)
}
