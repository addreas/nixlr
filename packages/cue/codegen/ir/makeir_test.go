package ir

import (
	"fmt"
	"os"
	"path"
	"testing"

	"cuelang.org/go/cue"
	"cuelang.org/go/cue/cuecontext"
	"cuelang.org/go/cue/load"
	. "github.com/onsi/gomega"
)

func TestImports(t *testing.T) {
	g := NewWithT(t)

	filename, value := loadCueSource(`
import metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
`)

	g.Expect(visitFile(value)).To(Equal(File{
		Name: filename,
		Imports: []Import{
			{
				Name: "metav1",
				Path: "\"k8s.io/apimachinery/pkg/apis/meta/v1\"",
			},
		},
		Types: []TypeDecl{},
	}))

	filename, value = loadCueSource(`
import (
	"strings"
	"path"
)
`)

	g.Expect(visitFile(value)).To(Equal(File{
		Name: filename,
		Imports: []Import{
			{Name: "", Path: "\"strings\""},
			{Name: "", Path: "\"path\""},
		},
		Types: []TypeDecl{},
	}))
}

func TestTopLevelFields(t *testing.T) {
	g := NewWithT(t)

	filename, value := loadCueSource(`
#Struct: {}
#StringList: [...string]
#StringUnion: "a" | "b" | "c"
`)

	g.Expect(visitFile(value)).To(Equal(File{
		Name:    filename,
		Imports: []Import{},
		Types: []TypeDecl{
			{
				Name:  "#Struct",
				Value: &StructType{Embeds: []Type{}, Fields: []StructField{}},
			},
			{
				Name:  "#StringList",
				Value: &List{ElementType: &String{}},
			},
			{
				Name:  "#StringUnion",
				Value: &StringUnion{Values: []string{"a", "b", "c"}},
			},
		},
	}))

}

func TestStructFields(t *testing.T) {
	g := NewWithT(t)

	fieldTests := [](struct {
		input  string
		output StructField
	}){
		{
			input: "int: int",
			output: StructField{
				Name:  "int",
				Value: &Int{},
			},
		},
		{
			input: "float: float",
			output: StructField{
				Name: "float", Value: &Float{},
			},
		},
		{
			input: "string: string",
			output: StructField{
				Name:  "string",
				Value: &String{},
			},
		},
		{
			input: "bool: bool",
			output: StructField{
				Name:  "bool",
				Value: &Boolean{},
			},
		},
		{
			input: "string_list: [...string]",
			output: StructField{
				Name:  "string_list",
				Value: &List{ElementType: &String{}},
			},
		},
		{
			input: "struct_list_inline: [...{}]",
			output: StructField{
				Name:  "struct_list_inline",
				Value: &List{ElementType: &StructType{Embeds: []Type{}, Fields: []StructField{}}},
			},
		},
		{
			input: "int_bool_float_tuple: [int, bool, float]",
			output: StructField{
				Name:  "int_bool_float_tuple",
				Value: &Tuple{ElementTypes: []Type{&Int{}, &Boolean{}, &Float{}}},
			},
		},
	}

	for _, testcase := range fieldTests {
		_, value := loadCueSource(fmt.Sprintf(`#TestStruct: { %s }`, testcase.input))

		g.Expect(visitFile(value).Types[0].Value).To(Equal(&StructType{
			Embeds: []Type{},
			Fields: []StructField{
				testcase.output,
			},
		}))
	}
}

func loadCueSource(content string) (string, cue.Value) {
	ctx := cuecontext.New()
	cwd, _ := os.Getwd()
	filepath := path.Join(cwd, "test.cue")
	insts := load.Instances([]string{"test.cue"}, &load.Config{
		Overlay: map[string]load.Source{
			filepath: load.FromString(content),
		},
	})
	vals, err := ctx.BuildInstances(insts)
	if err != nil {
		panic(err)
	}
	_, vals = vals[0].Expr() // split single instance into files
	return filepath, vals[0]
}
