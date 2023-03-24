import $ from "https://deno.land/x/dax/mod.ts";

// run a command
await $`echo 5`; // outputs: 5

// more complex example outputting 1 to stdout and 2 to stderr
await $`echo 1 && deno eval 'console.error(2);'`;

// parallel
await Promise.all([
  $`sleep 1 ; echo 1`,
  $`sleep 2 ; echo 2`,
  $`sleep 3 ; echo 3`,
]);

export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
}
