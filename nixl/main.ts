#!/usr/bin/env -S deno run --allow-all
import { parse } from "https://deno.land/std@0.181.0/flags/mod.ts";

import { readCmdline } from "~/nixl/cmdline/cmdline.ts";
import { provision } from "~/nixl/provision/mod.ts";

if (import.meta.main) await main();

async function main() {
  const args = parse(Deno.args, {
    string: ["mode"],
  });

  const { api, hostname } = await readCmdline();

  console.log(args, api, hostname);

  if (!api || !hostname) {
    console.error("missing api or hostname");
  }

  if (args.mode == "provision") {
    await provision(api[0], hostname[0]);
  } else if (args.mode == "firstboot") {
    // await firstboot(api, mac);
  }
}
