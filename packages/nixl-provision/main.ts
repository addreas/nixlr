import {parse} from "https://deno.land/std/flags/mod.ts"
import { discovery } from "./discovery/mod.ts"
import { firstboot } from "./firstboot.ts"
import { provision } from "./provision.ts"

if (import.meta.main) await main()

async function main() {
  const args = parse(Deno.args, {
    string: ["api", "mac", "mode"]
  })

  if (!args.api || !args.mac) {
    console.error("missing args --api and --mac")
    Deno.exit(1)
  }

  console.log(args)

  if(args.mode == "ephemeral") {
    console.log("discovering")
    await discovery(args.api, args.mac)
    await provision(args.api, args.mac)
  } else if (args.mode == "firstboot") {
    await firstboot(args.api, args.mac)
  }
}

