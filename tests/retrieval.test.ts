import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { ReactBitsProvider } from "../providers/react-bits.js";
import { component } from "./fixtures.js";
import { ROOT } from "../scripts/lib/core.js";
test("retrieval rejects foreign provenance before any download", async () => {
  const c = component();
  c.provenance.repository = "https://example.invalid/repo";
  await assert.rejects(
    new ReactBitsProvider().retrieve(c, c.variants[0]),
    /provenance/,
  );
});
test("offline retrieval fails on an empty cache without fetching", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "premium-empty-cache-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const c = component();
  await assert.rejects(
    new ReactBitsProvider(root).retrieve(c, c.variants[0], true),
    /Uncached source/,
  );
});
test("corrupt pinned download cache is rejected rather than silently replaced", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "premium-corrupt-cache-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const c = component();
  const dir = resolve(root, "downloads", c.revision, "public/r");
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, "Sample-TS-CSS.json"), "corrupt");
  await assert.rejects(
    new ReactBitsProvider(root).retrieve(c, c.variants[0], true),
    /hash mismatch/,
  );
});
test("installation CLI requires an explicit action", () => {
  assert.throws(
    () =>
      execFileSync(
        process.execPath,
        [
          resolve(ROOT, "node_modules/tsx/dist/cli.mjs"),
          resolve(ROOT, "scripts/install.ts"),
          "--id",
          "react-bits:blur-text",
          "--project",
          tmpdir(),
        ],
        { encoding: "utf8", stdio: "pipe" },
      ),
    (e) => String(e).includes("Choose exactly one explicit action"),
  );
});
