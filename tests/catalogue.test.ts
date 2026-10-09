import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { catalogueSchema } from "../registry/schema.js";
import {
  parseInformation,
  parsePayload,
  scan,
} from "../providers/react-bits.js";
import { mergeAnnotations, synchronize, diff } from "../scripts/lib/sync.js";
import { hash, json, ROOT } from "../scripts/lib/core.js";
import { search } from "../scripts/lib/search.js";
import {
  component,
  catalogue,
  provider,
  annotations,
  upstreamFixture,
} from "./fixtures.js";

test("schema rejects embedded source code and duplicate IDs", () => {
  assert.throws(() =>
    catalogueSchema.parse({ ...catalogue(), sourceCode: "evil" }),
  );
  const c = catalogue();
  c.components.push(component());
  assert.throws(() => catalogueSchema.parse(c));
});
test("schema requires evidence tied to the fingerprint for verified status", () => {
  const c = catalogue();
  c.components[0].verification.browser = "verified";
  assert.throws(() => catalogueSchema.parse(c));
});
test("AST metadata parser reads literals without executing top-level code", () => {
  const m = parseInformation(
    "throw new Error('must not run'); export const componentMetadata = {x: {name:'Test', category:'Micro',docsUrl:'https://reactbits.dev/micro/test',videoUrl:'/assets/video/test.webm'}};",
  );
  assert.equal(m.get("Test")?.category, "Micro");
});
test("metadata parser fails on unsupported structure and foreign documentation", () => {
  assert.throws(() =>
    parseInformation('export const componentMetadata = fetch("bad");'),
  );
  assert.throws(() =>
    parseInformation(
      "export const componentMetadata = {x:{name:'X',category:'Micro',docsUrl:'https://evil.invalid',videoUrl:'x'}}",
    ),
  );
});
test("payload validates relative paths and rejects duplicate destinations", () => {
  const base = {
    name: "X-TS-CSS",
    title: "X",
    description: "test",
    type: "registry:component",
    files: [{ path: "../evil.tsx", type: "registry:component", content: "" }],
  };
  assert.throws(() => parsePayload(base));
  base.files[0].path = "X.tsx";
  base.files.push({ ...base.files[0] });
  assert.throws(() => parsePayload(base));
});
test("source scan finds local helpers, CSS, browser APIs and reduced-motion references", () => {
  const result = scan([
    {
      path: "A/A.tsx",
      type: "registry:component",
      content:
        "'use client'; import './A.css'; import {x} from './missing'; window.matchMedia('(prefers-reduced-motion)');",
    },
    { path: "A/A.css", type: "registry:file", content: ".a{}" },
  ]);
  assert.equal(result.clientDirective, true);
  assert.equal(result.reducedMotion, "reference-detected");
  assert.deepEqual(result.unresolvedImports, ["A/A.tsx: ./missing"]);
  assert.ok(result.browserApis.includes("matchMedia"));
});
test("real adapter parses a controlled Git repository and hashes all source files", async (t) => {
  const f = await upstreamFixture();
  t.after(() => rm(f.cache, { recursive: true, force: true }));
  const c = await f.adapter.discover({
    checkedDate: "2026-10-10",
    offline: true,
  });
  assert.equal(c.coverage.logicalComponents, 1);
  assert.equal(
    c.components[0].variants[0].files[0].repositoryPath,
    "src/ts-default/TextAnimations/Sample/Sample.tsx",
  );
});
test("sync preserves curated annotations and is byte deterministic", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "premium-sync-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const path = join(dir, "components.json");
  const options = { checkedDate: "2026-10-10", offline: true };
  const a = { "react-bits:sample": annotations };
  await synchronize(provider(), options, path, a);
  const first = await readFile(path, "utf8");
  await synchronize(provider(), options, path, a);
  assert.equal(await readFile(path, "utf8"), first);
  assert.deepEqual(JSON.parse(first).components[0].annotations, annotations);
});
test("failed discovery or validation leaves last catalogue byte-for-byte intact", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "premium-failure-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const path = join(dir, "components.json");
  await writeFile(path, json(catalogue()));
  const before = await readFile(path, "utf8");
  const bad = provider();
  bad.discover = async () => {
    throw new Error("network unavailable");
  };
  await assert.rejects(
    synchronize(bad, { checkedDate: "2026-10-10" }, path, {}),
    /network unavailable/,
  );
  await assert.rejects(
    synchronize(provider(), { checkedDate: "2026-10-10" }, path, {
      "react-bits:sample": { bad: true },
    }),
  );
  assert.equal(await readFile(path, "utf8"), before);
});
test("changed sources invalidate prior browser evidence; unchanged sources retain it", () => {
  const old = catalogue();
  old.components[0].verification = {
    metadata: "validated",
    enrichment: "unreviewed",
    browser: "verified",
    evidence: ["fixture report"],
    fingerprint: old.components[0].sourceFingerprint,
  };
  assert.equal(
    mergeAnnotations(catalogue(), {}, old).components[0].verification.browser,
    "verified",
  );
  const next = catalogue();
  next.components[0].sourceFingerprint = hash("changed");
  assert.equal(
    mergeAnnotations(next, {}, old).components[0].verification.browser,
    "stale",
  );
});
test("diff reports additions, changes and removals", () => {
  const a = catalogue();
  const b = catalogue();
  b.components[0].description = "changed";
  assert.deepEqual(diff(a, b).changed, ["react-bits:sample"]);
  b.components[0].id = "react-bits:new";
  assert.deepEqual(diff(a, b), {
    added: ["react-bits:new"],
    changed: [],
    removed: ["react-bits:sample"],
  });
});
test("orphan overrides stop sync instead of dropping human notes", () =>
  assert.throws(
    () => mergeAnnotations(catalogue(), { "react-bits:missing": annotations }),
    /Orphan/,
  ));
test("search ranks intentional name and tag matches; unknown compatibility is excluded by filters", () => {
  const c = catalogue();
  c.components[0].annotations = annotations;
  assert.equal(
    search(c, { query: "subtle reveal" })[0].id,
    "react-bits:sample",
  );
  assert.equal(search(c, { query: "subtle", reducedMotion: true }).length, 0);
  assert.equal(search(c, { query: "subtle", dependencyFree: true }).length, 0);
  assert.throws(() => search(c, { query: "x", limit: 0 }));
});
test("CLI emits parseable JSON from another working directory with a five-item shortlist", () => {
  const output = execFileSync(
    process.execPath,
    [
      resolve(ROOT, "node_modules/tsx/dist/cli.mjs"),
      resolve(ROOT, "scripts/search.ts"),
      "--query",
      "text",
      "--json",
    ],
    { cwd: tmpdir(), encoding: "utf8" },
  );
  const result = JSON.parse(output);
  assert.equal(result.results.length, 5);
  assert.ok(result.results[0].id.startsWith("react-bits:"));
});
