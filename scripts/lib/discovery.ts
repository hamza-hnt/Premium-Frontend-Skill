import { resolve } from "node:path";
import { discoverySchema, type Catalogue } from "../../registry/schema.js";
import { readJson, ROOT } from "./core.js";

export function validateDiscovery(catalogue: Catalogue, input: unknown) {
  const discovery = discoverySchema.parse(input);
  if (discovery.provider !== catalogue.provider)
    throw new Error("Discovery provider does not match catalogue");
  const ids = new Set(catalogue.components.map((c) => c.id));
  const missing = [...ids].filter(
    (id) => !Object.hasOwn(discovery.components, id),
  );
  const stale = Object.keys(discovery.components).filter((id) => !ids.has(id));
  if (missing.length || stale.length)
    throw new Error(
      `Discovery coverage mismatch. Missing IDs: ${missing.join(", ") || "none"}. Stale IDs: ${stale.join(", ") || "none"}. Review registry/discovery.json before syncing.`,
    );
  return discovery;
}

export async function readDiscovery(
  catalogue: Catalogue,
  path = resolve(ROOT, "registry/discovery.json"),
) {
  return validateDiscovery(catalogue, await readJson(path));
}
