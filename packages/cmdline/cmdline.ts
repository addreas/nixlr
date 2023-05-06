#!/usr/bin/env -S deno run --allow-read=/proc/cmdline
import { parse } from "https://deno.land/std@0.181.0/flags/mod.ts";
import { shlexSplit } from "./shlex.ts";

function tokensToMap(tokens: string[]) {
  return tokens.reduce((acc, token) => {
    const [key, val] = token.split("=");
    let value: string | string[] = val;
    if (key in acc) {
      const existing = acc[key];
      if (typeof existing == "string") {
        value = [existing, value];
      } else {
        value = [...existing, value];
      }
    }
    return {
      ...acc,
      [key]: value,
    };
  }, {} as Record<string, string | string[]>);
}

if (import.meta.main) {
  const cmdline = await Deno.readTextFile("/proc/cmdline");
  const tokens = shlexSplit(cmdline);
  const args = parse(Deno.args, {
    alias: { j: "json" },
    boolean: "json",
  });
  if (args.json) {
    console.log(JSON.stringify(tokensToMap(tokens)));
  } else {
    console.log(tokens.join("\n"));
  }
}
