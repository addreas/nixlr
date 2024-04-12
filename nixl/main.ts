#!/usr/bin/env -S deno run --allow-all
import { parse } from "https://deno.land/std@0.181.0/flags/mod.ts";

import { readCmdline } from "./cmdline/cmdline.ts";
import { provision } from "./provision/mod.ts";

if (import.meta.main) await main();

async function main() {
  const args = parse(Deno.args, {
    string: ["mode"],
  });

  if (args.mode == "provision") {
    const { api, hostname } = await readCmdline();

    console.log(args, api, hostname);

    if (!api || !hostname) {
      console.error("missing api or hostname");
    }
    await provision(api[0], hostname[0]);
  } else if (args.mode == "maintain") {
    // await firstboot(api, mac);
  } else {
    console.log("unknown mode");
  }
}
