import a from "https://raw.githubusercontent.com/dariusk/corpora/master/data/words/adjs.json" with {type: "json"}
import b from "https://raw.githubusercontent.com/dariusk/corpora/master/data/animals/common.json" with { type: "json" };

export function getName() {
    const adj = a.adjs[Math.floor(Math.random() * a.adjs.length)].toLocaleLowerCase()
    const animal = b.animals[Math.floor(Math.random() * b.animals.length)].replace(" ", "-").toLowerCase()
    return `${adj}-${animal}`
}
