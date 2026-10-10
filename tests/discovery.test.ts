import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  discoverySchema,
  type Catalogue,
  type Discovery,
} from "../registry/schema.js";
import { json, readCatalogue, ROOT } from "../scripts/lib/core.js";
import { readDiscovery, validateDiscovery } from "../scripts/lib/discovery.js";
import { search } from "../scripts/lib/search.js";
import { synchronize } from "../scripts/lib/sync.js";
import { annotations, catalogue, component, provider } from "./fixtures.js";

function index(c: Catalogue = catalogue()): Discovery {
  return {
    schemaVersion: 1,
    provider: c.provider,
    components: Object.fromEntries(
      c.components.map((item) => [
        item.id,
        {
          roles: ["typography"],
          terms: ["subtle", "reveal"],
          summary: "Reveal a short heading.",
        },
      ]),
    ),
  };
}

test("discovery covers every shipped component without upgrading verification", async () => {
  const c = await readCatalogue();
  const before = structuredClone(c);
  const d = await readDiscovery(c);
  assert.deepEqual(
    Object.keys(d.components).sort(),
    c.components.map((item) => item.id).sort(),
  );
  assert.equal(Object.keys(d.components).length, c.coverage.logicalComponents);
  assert.deepEqual(c, before);
});

test("discovery rejects stale IDs, missing IDs, foreign providers, and unsupported roles", () => {
  const c = catalogue();
  const d = index(c);
  assert.throws(
    () => validateDiscovery(c, { ...d, components: {} }),
    /Missing IDs: react-bits:sample/,
  );
  assert.throws(
    () =>
      validateDiscovery(c, {
        ...d,
        components: {
          ...d.components,
          "react-bits:stale": d.components["react-bits:sample"],
        },
      }),
    /Stale IDs: react-bits:stale/,
  );
  assert.throws(
    () => validateDiscovery(c, { ...d, provider: "other" }),
    /provider/,
  );
  assert.throws(() =>
    discoverySchema.parse({
      ...d,
      components: {
        "react-bits:sample": {
          ...d.components["react-bits:sample"],
          roles: ["wow"],
        },
      },
    }),
  );
});

test("broad use searches surface different compositions beyond the curated reveal shortlist", async () => {
  const c = await readCatalogue();
  const d = await readDiscovery(c);
  const hero = search(c, { query: "hero", limit: 10 }, d);
  assert.ok(new Set(hero.map((item) => item.category)).size >= 3);
  assert.ok(hero.some((item) => item.discovery?.roles.includes("background")));
  for (const query of ["hero", "editorial"]) {
    const results = search(c, { query, limit: 10 }, d);
    assert.ok(
      results.some(
        (item) =>
          item.verification.enrichment === "unreviewed" &&
          (item.discovery?.roles.includes("gallery") ||
            item.discovery?.roles.includes("storytelling")),
      ),
      `${query} must expose uncurated gallery or storytelling options`,
    );
    assert.ok(results.every((item) => item.score > 0));
    assert.deepEqual(results, search(c, { query, limit: 10 }, d));
  }
});

test("exact names and IDs rank first, including compact CamelCase input", async () => {
  const c = await readCatalogue();
  const d = await readDiscovery(c);
  for (const query of [
    "DomeGallery",
    "domegallery",
    "dome gallery",
    "dome-gallery",
    "react-bits:dome-gallery",
  ])
    assert.equal(search(c, { query }, d)[0]?.id, "react-bits:dome-gallery");
  assert.equal(
    search(c, { query: "ScrollExpand" }, d)[0]?.id,
    "react-bits:scroll-expand",
  );
});

test("broad-use variety does not promote weak matches ahead of relevant neighbors", () => {
  const c = catalogue();
  const first = c.components[0];
  first.id = "react-bits:first";
  first.category = "Backgrounds";
  const second = structuredClone(first);
  second.id = "react-bits:second";
  const weak = component();
  weak.id = "react-bits:weak";
  weak.description = "A caption positioned below a hero.";
  c.components = [first, second, weak];
  const d = index(c);
  d.components[first.id].roles = ["hero", "background"];
  d.components[second.id].roles = ["hero", "background"];
  assert.deepEqual(
    search(c, { query: "hero", limit: 2 }, d).map((item) => item.id),
    [first.id, second.id],
  );
});

test("multiword searches rank complete term coverage above a partial name match and keep filtered fallbacks", () => {
  const c = catalogue();
  const partial = c.components[0];
  partial.id = "react-bits:depth-text";
  partial.name = "DepthText";
  const complete = component();
  complete.id = "react-bits:stage";
  complete.name = "Stage";
  complete.category = "Components";
  complete.variants[0].evidence.rendering = ["webgl"];
  c.components.push(complete);
  const d = index(c);
  d.components[complete.id].roles = ["gallery"];
  d.components[complete.id].terms = ["depth"];

  assert.deepEqual(
    search(c, { query: "depth gallery" }, d).map((item) => item.id),
    [complete.id, partial.id],
  );
  assert.deepEqual(
    search(c, { query: "depth gallery", noWebgl: true }, d).map(
      (item) => item.id,
    ),
    [partial.id],
  );
  assert.deepEqual(
    search(c, { query: "depth gallery", variant: "JS-CSS" }, d),
    [],
  );
  assert.deepEqual(search(c, { query: "unmatched tokens" }, d), []);
});

test("curated status and repeated matches across notes do not inflate lexical relevance", () => {
  const c = catalogue();
  c.components[0].id = "react-bits:a-unreviewed";
  const reviewed = component();
  reviewed.id = "react-bits:b-curated";
  reviewed.annotations = {
    ...annotations,
    tags: ["subtle", "reveal"],
    suitable: ["subtle reveal"],
  };
  c.components.push(reviewed);
  const results = search(c, { query: "subtle reveal" }, index(c));
  assert.equal(results[0].id, "react-bits:a-unreviewed");
  assert.equal(results[0].score, results[1].score);
});

test("discovery roles never bypass variant constraints or turn inference into source evidence", () => {
  const c = catalogue();
  const d = index(c);
  const v = c.components[0].variants[0];
  v.evidence.rendering = ["webgl"];
  assert.equal(
    search(c, { query: "Sample", role: "typography", noWebgl: true }, d).length,
    0,
  );
  assert.equal(
    search(c, { query: "Sample", role: "typography", reducedMotion: true }, d)
      .length,
    0,
  );
  assert.equal(
    search(c, { query: "Sample", role: "typography", dependencyFree: true }, d)
      .length,
    0,
  );
  assert.equal(
    search(c, { query: "Sample", role: "typography", maxRisk: "low" }, d)
      .length,
    0,
  );
  assert.equal(search(c, { query: "Sample", role: "gallery" }, d).length, 0);
  assert.equal(search(c, { query: "Sample", curated: true }, d).length, 0);
  assert.equal(
    search(c, { query: "Sample", category: "Backgrounds" }, d).length,
    0,
  );
  assert.equal(search(c, { query: "Sample", variant: "JS-CSS" }, d).length, 0);
  assert.throws(() => search(c, { query: "Sample", role: "wow" }, d));
  const result = search(c, { query: "Sample", role: "typography" }, d)[0];
  assert.equal(result.discovery?.basis, "editorial-inference");
  assert.equal(result.verification.enrichment, "unreviewed");
  assert.equal(result.verification.browser, "unverified");
});

test("sync refuses discovery drift before replacing the last catalogue", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "premium-discovery-sync-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const path = join(dir, "components.json");
  const c = catalogue();
  await writeFile(path, json(c));
  const next = catalogue();
  next.components[0].id = "react-bits:new-component";
  await assert.rejects(
    synchronize(
      provider(next),
      { checkedDate: c.checkedDate, offline: true },
      path,
      {},
      index(c),
    ),
    /Discovery coverage mismatch/,
  );
  assert.equal(await readFile(path, "utf8"), json(c));
});

test("search and inspect CLIs expose local discovery separately from source verification", () => {
  const run = (script: string, args: string[]) =>
    JSON.parse(
      execFileSync(
        process.execPath,
        [
          resolve(ROOT, "node_modules/tsx/dist/cli.mjs"),
          resolve(ROOT, `scripts/${script}.ts`),
          ...args,
          "--json",
        ],
        { cwd: tmpdir(), encoding: "utf8" },
      ),
    );
  const result = run("search", [
    "--query",
    "editorial",
    "--role",
    "gallery",
    "--variant",
    "TS-CSS",
  ]);
  assert.ok(result.results.length > 0);
  assert.ok(
    result.results.every(
      (item: { discovery: { roles: string[] }; variants: string[] }) =>
        item.discovery.roles.includes("gallery") &&
        item.variants.join() === "TS-CSS",
    ),
  );
  const inspected = run("inspect", ["--id", result.results[0].id]);
  assert.equal(inspected.discovery.basis, "editorial-inference");
  assert.ok(inspected.discovery.summary.length > 0);
  assert.equal(inspected.variants[0].evidence.method, "static-source-scan");
});
