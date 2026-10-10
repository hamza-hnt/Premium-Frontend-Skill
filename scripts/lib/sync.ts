import { access } from "node:fs/promises";
import {
  catalogueSchema,
  overridesSchema,
  type Catalogue,
} from "../../registry/schema.js";
import type { Provider, DiscoverOptions } from "../../providers/types.js";
import { atomicJson, json, readJson } from "./core.js";
import { validateDiscovery } from "./discovery.js";

export function mergeAnnotations(
  next: Catalogue,
  overrides: unknown,
  previous?: Catalogue,
): Catalogue {
  const annotations = overridesSchema.parse(overrides);
  for (const key of Object.keys(annotations))
    if (!next.components.some((c) => c.id === key))
      throw new Error(
        `Orphan annotation: ${key}; review upstream removals before syncing`,
      );
  const merged = structuredClone(next);
  for (const c of merged.components) {
    c.annotations = annotations[c.id] ?? null;
    c.verification.enrichment = c.annotations ? "curated" : "unreviewed";
    const old = previous?.components.find((x) => x.id === c.id);
    if (old && old.sourceFingerprint === c.sourceFingerprint)
      c.verification = {
        ...old.verification,
        enrichment: c.annotations ? "curated" : "unreviewed",
      };
    else if (
      old?.verification.browser === "verified" ||
      old?.verification.browser === "stale"
    )
      c.verification = {
        ...c.verification,
        browser: "stale",
        evidence: old.verification.evidence,
        fingerprint: old.verification.fingerprint,
      };
  }
  return catalogueSchema.parse(merged);
}
export function diff(previous: Catalogue | undefined, next: Catalogue) {
  const before = new Map(previous?.components.map((c) => [c.id, c]) ?? []);
  const after = new Map(next.components.map((c) => [c.id, c]));
  const comparable = (c: Catalogue["components"][number]) => {
    const { checkedDate, revision, licence, ...rest } = c;
    return json({
      ...rest,
      licence: { name: licence.name, sha256: licence.sha256 },
    });
  };
  return {
    added: [...after.keys()].filter((k) => !before.has(k)),
    changed: [...after]
      .filter(
        ([k, c]) =>
          before.has(k) && comparable(before.get(k)!) !== comparable(c),
      )
      .map(([k]) => k),
    removed: [...before.keys()].filter((k) => !after.has(k)),
  };
}
export async function synchronize(
  provider: Provider,
  options: DiscoverOptions,
  output: string,
  overrides: unknown,
  discovery?: unknown,
) {
  let previous: Catalogue | undefined;
  try {
    await access(output);
    previous = catalogueSchema.parse(await readJson(output));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  const next = mergeAnnotations(
    await provider.discover(options),
    overrides,
    previous,
  );
  const changes = diff(previous, next);
  if (discovery !== undefined) validateDiscovery(next, discovery);
  await atomicJson(output, next);
  return {
    revision: next.revision,
    coverage: next.coverage,
    curated: next.components.filter((c) => c.annotations).length,
    ...changes,
  };
}
