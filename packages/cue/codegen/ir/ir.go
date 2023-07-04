package ir

import (
	"cuelang.org/go/cue/ast"
)

type File struct {
	Name    string
	Imports []Import
	Types   []TypeDecl
}

type Import struct {
	Name string
	Path string
}

type TypeDecl struct {
	Name  string
	Value Type
	Doc   []*ast.CommentGroup
}

type Type interface{ isType() }

func (e *StructType) isType()               {}
func (e *StringUnion) isType()              {}
func (e *DiscriminatedStructUnion) isType() {}
func (e *Int) isType()                      {}
func (e *Float) isType()                    {}
func (e *String) isType()                   {}
func (e *Boolean) isType()                  {}
func (e *List) isType()                     {}
func (e *Tuple) isType()                    {}

type Int struct{}
type Float struct{}
type String struct{}
type Boolean struct{}

type List struct {
	ElementType Type
}

type Tuple struct {
	ElementTypes []Type
}

type StringUnion struct {
	Values []string
}

type DiscriminatedStructUnion struct {
	Discriminator string
	Structs       []StructType
}

type StructType struct {
	Embeds []Type
	Fields []StructField
}

type StructField struct {
	Name     string
	Optional bool
	Nullable bool
	Value    Type
	Doc      []*ast.CommentGroup
}
