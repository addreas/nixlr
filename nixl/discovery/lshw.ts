import { parse } from "https://deno.land/x/xml@2.1.0/mod.ts";
import { node } from "https://deno.land/x/xml@2.1.0/utils/types.ts";

import type { LshwNode } from "../../types/lshw.ts";

export function convertLshwXmlOutput(xml: string): LshwNode {
  const parsed = (parse(xml).list as node).node as lshwnode;
  return convertLshwNode(parsed);
}

function convertLshwNode(parsed: lshwnode): LshwNode {
  const res: LshwNode = {
    id: parsed["@id"],
    claimed: parsed["@claimed"],
    class: parsed["@class"],
    handle: parsed["@handle"],
  };

  if (parsed["@modalias"]) {
    res.modalias = parsed["@modalias"];
  }
  if (parsed.description) {
    res.description = parsed.description;
  }
  if (parsed.product) {
    res.product = parsed.product;
  }
  if (parsed.vendor) {
    res.vendor = parsed.vendor;
  }
  if (parsed.physid) {
    res.physid = parsed.physid;
  }
  if (parsed.businfo) {
    res.businfo = parsed.businfo;
  }
  if (parsed.logicalname) {
    res.logicalname = parsed.logicalname;
  }
  if (parsed.dev) {
    res.dev = parsed.dev;
  }
  if (parsed.version) {
    res.version = parsed.version;
  }
  if (parsed.date) {
    res.date = parsed.date;
  }
  if (parsed.serial) {
    res.serial = parsed.serial;
  }
  if (parsed.slot) {
    res.slot = parsed.slot;
  }

  if (parsed.size) {
    res.size = {
      unit: parsed.size["@units"],
      value: parsed.size["#text"],
    };
  }
  if (parsed.capacity) {
    res.capacity = {
      unit: parsed.capacity["@units"],
      value: parsed.capacity["#text"],
    };
  }
  if (parsed.width) {
    if (parsed.width["@units"] != "bits") {
      throw new Error(`unnknown unit for "width": ${parsed.width["@units"]}`);
    }
    res.widthBits = parsed.width!["#text"];
  }
  if (parsed.clock) {
    if (parsed.clock["@units"] != "Hz") {
      throw new Error(`unnknown unit for "clock": ${parsed.clock["@units"]}`);
    }
    res.clockHz = parsed.clock["#text"];
  }
  if (parsed.configuration) {
    res.configuration = kvListToObject(
      "@id",
      "@value",
      parsed.configuration.setting
    );
  }
  if (parsed.capabilities) {
    res.capabilities = ensureListy(parsed.capabilities.capability).map((i) =>
      i["#text"] != null
        ? {
            id: i["@id"],
            description: i["#text"],
          }
        : { id: i["@id"] }
    );
  }
  if (parsed.resources) {
    res.resources = kvListToObject(
      "@type",
      "@value",
      parsed.resources.resource
    );
  }
  if (parsed.hints) {
    res.hints = kvListToObject("@name", "@value", parsed.hints.hint);
  }

  if (parsed.node) {
    res.children = ensureListy(parsed.node).map(convertLshwNode);
  }

  return res;
}

function kvListToObject<
  K extends string,
  V extends string,
  Inner extends { [_ in K]: string } & { [_ in V]: string | number }
>(key: K, value: V, listOrSingle: Inner | Inner[]) {
  const entries = ensureListy(listOrSingle).map((item) => [
    item[key],
    item[value],
  ]);
  return Object.fromEntries(entries);
}

function ensureListy<T>(input: T | T[]): T[] {
  return input instanceof Array ? input : [input];
}
type lshwnode = {
  "@id": string; // hostname | "core" | "firmware" | "memory" | "cache:0" | "cache:1"
  "@claimed": boolean;
  "@class": string; // "system" | "bus" | "memory" | "bridge" | "multimedia";
  "@handle": string; // "DMI:0001"  | "DMI:002" | "PCI:0000:00:1f.3"

  "@modalias"?: string; // "pci:v00008086d0000A3F0sv00001043sd00008796bc04sc03i00"
  description?: string; // "Desktop Computer" | "Motherboard" | "BIOS"
  product?: string; // "System Product Name (SKU)" | "TUF GAMING B460M-PLUS (WI-FI)"
  vendor?: string; // "ASUS | "ASUSTeK COMPUTER INC."
  physid?: string | number;
  businfo?: string;
  logicalname?: string;
  dev?: string;
  version?: string | number; // "System Version" | "Rev 1.xx" | 708
  date?: string; // "07/23/2020"
  serial?: string | number; // "System Serial Number" | 201076052100906
  slot?: string; //  "Default string" | "L1 Cache" | "LGA1200",

  size?: { "@units": string; "#text": number }; // mWh: 32768
  capacity?: { "@units": string; "#text": number }; // mWh: 32768
  width?: { "@units": "bits"; "#text": number }; // 64
  clock?: { "@units": "Hz"; "#text": number }; // 64
  configuration?: {
    setting:
      | { "@id": string; "@value": string | number }
      | { "@id": string; "@value": string | number }[];
  };
  capabilities?: {
    capability:
      | { "@id": string; "#text": string | null }
      | { "@id": string; "#text": string | null }[];
  };
  resources?: {
    resource:
      | { "@type": string; "@value": string | number }
      | { "@type": string; "@value": string | number }[];
  };
  hints?: {
    hint:
      | { "@name": string; "@value": string }
      | { "@name": string; "@value": string }[];
  };

  node?: lshwnode | lshwnode[];
};
