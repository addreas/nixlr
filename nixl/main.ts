#!/usr/bin/env -S deno run --allow-all
import { parse } from "https://deno.land/std@0.181.0/flags/mod.ts";
import $ from "https://deno.land/x/dax@0.30.1/mod.ts";

import { discovery } from "./discovery/mod.ts";
import { provision } from "./provision/mod.ts";
import { ProvisionInfo } from "../types/provision.ts";

if (import.meta.main) await main();

async function main() {
  const args = parse(Deno.args, {
    string: ["api", "mac", "mode"],
  });

  if (!args.api || !args.mac) {
    console.error("missing args --api and --mac");
    Deno.exit(1);
  }

  console.log(args);

  if (args.mode == "ephemeral") {
    await ephemeral(args.api, args.mac);
  } else if (args.mode == "firstboot") {
    // await firstboot(args.api, args.mac);
  }
}

async function ephemeral(api: string, mac: string) {
  const discoveryInfo = await discovery();
  console.log("discovery", { discoveryInfo });

  await $.request(`${api}/discovery/${mac}`)
    .method("PUT")
    .header("Content-Type", "application/json")
    .body(JSON.stringify(discoveryInfo));

  const info: ProvisionInfo = await $.request(`${api}/provision/${mac}`).json();

  console.log("provisioning", { info });
  await provision(info);
}
