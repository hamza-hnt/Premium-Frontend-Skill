import { createHash } from "node:crypto";
import { readFile, writeFile, rename, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { catalogueSchema, type Catalogue } from "../../registry/schema.js";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const hash = (data: string | Buffer) =>
  createHash("sha256").update(data).digest("hex");
export const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
export async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8"));
}
export async function readCatalogue(
  path = resolve(ROOT, "registry/components.json"),
): Promise<Catalogue> {
  return catalogueSchema.parse(await readJson(path));
}
export async function atomicJson(path: string, value: unknown) {
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  try {
    await writeFile(tmp, json(value), { flag: "wx" });
    await rename(tmp, path);
  } finally {
    await rm(tmp, { force: true });
  }
}
export function args(strings: string[], booleans: string[] = []) {
  return parseArgs({
    options: Object.fromEntries([
      ...strings.map((s) => [s, { type: "string" }]),
      ...booleans.map((s) => [s, { type: "boolean" }]),
    ]),
    strict: true,
  }).values as Record<string, string | boolean | undefined>;
}
export function required(
  v: string | boolean | undefined,
  name: string,
): string {
  if (typeof v !== "string" || !v.trim()) throw new Error(`Missing --${name}`);
  return v;
}
export async function cli(run: () => Promise<void>) {
  try {
    await run();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(JSON.stringify({ error: message }));
    process.exitCode = 1;
  }
}
export function componentById(c: Catalogue, id: string) {
  const found = c.components.find((c) => c.id === id);
  if (!found)
    throw new Error(`Unknown component: ${id}. Use components:search first.`);
  return found;
}
