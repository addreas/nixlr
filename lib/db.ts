import type { DiscoveryInfo } from "../nixl/types/discovery.ts";
import type {
  ProvisionInfo,
  ProvisionStatus,
  ProvisionEvent,
} from "../nixl/types/provision.ts";

const kv = await Deno.openKv();
export type PixiecoreParams = {
  kernel: string;
  initrd: string[];
  cmdline: string[];
};

export async function setPixiecoreParams(mac: string, params: PixiecoreParams) {
  await kv.set(["pixiecore", "params", mac], params);
}
export async function deletePixiecoreParams(mac: string) {
  await kv.delete(["pixiecore", "params", mac]);
}

export async function getPixiecoreParams(mac: string) {
  await kv.atomic().sum(["pixiecore", "request", mac], BigInt(1)).commit();

  return getKvItem<PixiecoreParams>(["pixiecore", "params", mac]);
}

export async function listPixiecoreParams() {
  const entries = await listKvEntries(["pixiecore", "params"]);
  return entries.map(
    ([key, value]) => [key[2] as string, value as PixiecoreParams] as const
  );
}

export async function listPixiecoreBootAttempts() {
  const entries = await listKvEntries(["pixiecore", "request"]);
  return entries.map(
    ([key, value]) => [key[2] as string, value as bigint] as const
  );
}

export async function setHostMac(name: string, mac: string) {
  await kv.set(["mac", name], mac);
}

export function getHostMac(name: string) {
  return getKvItem<string>(["mac", name]);
}

export async function setDiscoveryInfo(name: string, info: DiscoveryInfo) {
  await kv.set(["discovery", name], info);
}

export function getDiscoveryInfo(name: string) {
  return getKvItem<DiscoveryInfo>(["discovery", name]);
}

export function listDiscoveryInfo() {
  return listKvItems<DiscoveryInfo>(["discovery"]);
}

export async function setProvisionInfo(name: string, info: ProvisionInfo) {
  await kv.set(["provision", "info", name], info);
}

export function getProvisionInfo(name: string) {
  return getKvItem<ProvisionStatus>(["provision", "info", name]);
}

export function listProvisionInfo() {
  return listKvItems<ProvisionInfo>(["provision"]);
}

export async function setProvisionStatus(
  name: string,
  status: ProvisionStatus
) {
  await kv.set(["provision", "status", name], status);
}

export async function addProvisionStatusEvent(
  name: string,
  event: ProvisionEvent
) {
  await kv.set(["provision", "event", name, event.name], event);
}

function listProvisionStatusEvent(name: string) {
  return listKvItems<ProvisionEvent>(["provision", "event", name]);
}

export async function getProvisionStatus(name: string) {
  const status = await getKvItem<ProvisionStatus>([
    "provision",
    "status",
    name,
  ]);
  const events = await listProvisionStatusEvent(name);
  return { ...status, events };
}

export async function listProvisionStatus() {
  const entries = kv.list({ prefix: ["provision", "status"] });
  const res: ProvisionStatus[] = [];
  for await (const entry of entries) {
    const status = entry.value as ProvisionStatus;
    const events = await listProvisionStatusEvent(status.hostname);
    res.push({
      ...status,
      events,
    });
  }
  return res;
}

async function getKvItem<T>(key: string[]) {
  const entry = await kv.get(key);

  if (!entry.value) {
    throw new Error(`missing key ${key}`);
  }

  return entry.value as T;
}

async function listKvItems<T>(prefix: string[]) {
  const entries = kv.list({ prefix });
  const item: T[] = [];
  for await (const entry of entries) {
    item.push(entry.value as T);
  }
  return item;
}

async function listKvEntries<T>(prefix: string[]) {
  const entries = kv.list({ prefix });
  const item: [Deno.KvKey, T][] = [];
  for await (const entry of entries) {
    item.push([entry.key, entry.value as T]);
  }
  return item;
}
