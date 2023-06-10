package main

import (
	"github.com/davecgh/go-spew/spew"

	"github.com/addreas/nixlr/packages/cue/codegen/ir"
)

func main() {
	ir := ir.GetIR()
	spew.Dump(ir)
}
