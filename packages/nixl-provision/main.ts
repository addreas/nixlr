import {parse} from "https://deno.land/std/flags/mod.ts"
import { discovery } from "./discover.ts"
import { firstboot } from "./firstboot.ts"
import { provision } from "./provision.ts"

if (import.meta.main) await main()

async function main() {
  const args = parse(Deno.args, {
    boolean: ["discover", "provision", "firstboot"],
    string: ["api", "mac"]
  })

  if (!args.api || !args.mac) {
    console.error("missing args --api and --mac")
    Deno.exit(1)
  }

  console.log(args)

  if(args.discover) {
    console.log("discovering")
    await discovery(args.api, args.mac)
  } else if (args.provision) {
    await provision(args.api, args.mac)
  } else if (args.firstboot) {
    await firstboot(args.api, args.mac)
  }
}

