package v1beta1

import metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

#ExampleSpec: {
    selector?: null | metav1.#LabelSelector @go(Selector,*metav1.LabelSelector)

    // name
    name: string
    // names
    names: [...string]

    // maybe name
    maybeName?: string

    // other things
    otherThings: [...#Thing]
}

#Thing: {
    #ExampleStatus

    bar: #Things
}

#Things: "foo" | "bar" | "baz"

#ExampleStatus: {}

#Example: {
    metav1.#TypeMeta
    metadata?: metav1.#ObjectMeta   @go(Metadata,*metav1.ObjectMeta)
    spec?:     #ExampleSpec   @go(Spec,ExampleSpec)
    status?:   #ExampleStatus @go(Status,ExampleStatus)
}

#ExampleList: {
    metav1.#TypeMeta
    metadata?: metav1.#ListMeta @go(Metadata,*metav1.ListMeta)
    items: [...#Example] @go(Items,[]Example)
}
