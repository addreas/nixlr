#!/usr/bin/env -S deno run --allow-read=/proc/cmdline
import { parse } from "https://deno.land/std@0.181.0/flags/mod.ts";
import { shlexSplit } from "./shlex.ts";

function tokensToMap(tokens: string[]) {
  return tokens.reduce((acc, token) => {
    const [key, val] = token.split("=");
    const existing = acc[key] ?? [];
    return { ...acc, [key]: [...existing, val] };
  }, {} as Record<string, string[]>);
}

export async function readCmdline() {
  const cmdline = await Deno.readTextFile("/proc/cmdline");
  const tokens = shlexSplit(cmdline);
  return tokensToMap(tokens);
}

if (import.meta.main) {
  const args = parse(Deno.args, {
    alias: { j: "json" },
    boolean: "json",
  });

  const cmdline = await readCmdline();
  if (args.json) {
    console.log(JSON.stringify(cmdline));
  } else {
    console.log(
      Object.entries(cmdline)
        .flatMap(([key, values]) => values.map((value) => `${key}=${value}`))
        .join("\n")
    );
  }
}
