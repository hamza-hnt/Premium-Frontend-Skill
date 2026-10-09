import test from "node:test";
import assert from "node:assert/strict";
import {
  rm,
  readFile,
  writeFile,
  mkdir,
  symlink,
  readdir,
} from "node:fs/promises";
import { resolve } from "node:path";
import {
  planInstallation,
  applyInstallation,
  safeDestination,
} from "../scripts/lib/install.js";
import { component, consumer, provider, code } from "./fixtures.js";
import { hash } from "../scripts/lib/core.js";

async function setup(t: any, deps?: Record<string, string>) {
  const root = await consumer(deps);
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
test("dry-run plans TS/CSS, complete files, dependency argv and no config mutation", async (t) => {
  const root = await setup(t);
  const before = await readdir(root);
  const p = await planInstallation(component(), { project: root });
  assert.equal(p.variant.name, "TS-CSS");
  assert.equal(p.files.length, 3);
  assert.deepEqual(p.dependencyCommand, ["npm", "install", "motion@^12.0.0"]);
  assert.deepEqual(p.configurationChanges, []);
  assert.deepEqual(await readdir(root), before);
});
test("installer respects pnpm and exposes target aliases", async (t) => {
  const root = await setup(t);
  await writeFile(resolve(root, "pnpm-lock.yaml"), "lockfileVersion: 9");
  const p = await planInstallation(component(), { project: root });
  assert.equal(p.dependencyCommand[0], "pnpm");
  assert.deepEqual(p.projectInfo.aliases, { "@/*": ["./src/*"] });
});
test("mixed package managers stop installation", async (t) => {
  const root = await setup(t);
  await writeFile(resolve(root, "package-lock.json"), "{}");
  await writeFile(resolve(root, "yarn.lock"), "");
  await assert.rejects(
    planInstallation(component(), { project: root }),
    /Conflicting/,
  );
});
test("incompatible dependency ranges are reported as conflicts", async (t) => {
  const root = await setup(t, { react: "^19.0.0", motion: "^11.0.0" });
  const p = await planInstallation(component(), { project: root });
  assert.match(p.conflicts.join(" "), /Dependency conflict/);
});
test("Tailwind variant cannot silently replace the styling stack", async (t) => {
  const root = await setup(t);
  const c = component();
  c.variants[0].name = "TS-TW";
  await assert.rejects(
    planInstallation(c, { project: root, variant: "TS-TW" }),
    /Tailwind setup/,
  );
});
test("traversal, absolute paths, Windows paths and symlinks are refused", async (t) => {
  const root = await setup(t);
  for (const path of [
    "../escape",
    "/tmp/escape",
    "C:\\escape",
    "a/../../bad",
    "a\\b",
  ])
    await assert.rejects(safeDestination(root, path));
  await symlink("/tmp", resolve(root, "src/components"));
  await assert.rejects(
    planInstallation(component(), { project: root }),
    /Symlink/,
  );
});
test("manifest symlink is refused before reads or writes", async (t) => {
  const root = await setup(t);
  await mkdir(resolve(root, ".premium-frontend"));
  await symlink("/tmp", resolve(root, ".premium-frontend/manifest.json"));
  await assert.rejects(
    planInstallation(component(), { project: root }),
    /Symlink/,
  );
});
test("pre-existing file collision fails without overwriting", async (t) => {
  const root = await setup(t);
  await mkdir(resolve(root, "src/components/react-bits/Sample"), {
    recursive: true,
  });
  const path = resolve(root, "src/components/react-bits/Sample/Sample.tsx");
  await writeFile(path, "local");
  await assert.rejects(
    applyInstallation(provider(), component(), { project: root }),
    /collision/,
  );
  assert.equal(await readFile(path, "utf8"), "local");
});
test("complete source install preserves notice and repeats without duplicate changes", async (t) => {
  const root = await setup(t);
  assert.equal(
    (await applyInstallation(provider(), component(), { project: root }))
      .status,
    "installed",
  );
  const path = resolve(root, ".premium-frontend/manifest.json");
  const first = await readFile(path, "utf8");
  assert.equal(
    (await applyInstallation(provider(), component(), { project: root }))
      .status,
    "already-installed",
  );
  assert.equal(await readFile(path, "utf8"), first);
  assert.equal(
    await readFile(
      resolve(root, "src/components/react-bits/Sample/Sample.tsx"),
      "utf8",
    ),
    code,
  );
  assert.equal(
    JSON.parse(first).installations["react-bits:sample"].files.length,
    3,
  );
});
test("local edits and automatic source upgrades fail safely", async (t) => {
  const root = await setup(t);
  await applyInstallation(provider(), component(), { project: root });
  await writeFile(
    resolve(root, "src/components/react-bits/Sample/Sample.tsx"),
    "edited",
  );
  await assert.rejects(
    applyInstallation(provider(), component(), { project: root }),
    /local edit/,
  );
  const c = component();
  c.revision = "b".repeat(40);
  await assert.rejects(
    applyInstallation(provider(), c, { project: root }),
    /different revision/,
  );
});
test("unresolved imports block incomplete installs", async (t) => {
  const root = await setup(t);
  const c = component();
  c.variants[0].evidence.unresolvedImports = ["./missing"];
  await assert.rejects(
    applyInstallation(provider(), c, { project: root }),
    /Unresolved/,
  );
});
test("bad download hashes cause no source writes", async (t) => {
  const root = await setup(t);
  const p = provider();
  p.retrieve = async () => [
    {
      path: "Sample/Sample.tsx",
      content: Buffer.from("wrong"),
      sha256: hash("wrong"),
    },
  ];
  await assert.rejects(
    applyInstallation(p, component(), { project: root }),
    /invalid staged/,
  );
  assert.deepEqual(await readdir(resolve(root, "src")), []);
});
test("write failure rolls back created files and leaves dependencies untouched", async (t) => {
  const root = await setup(t);
  const before = await readFile(resolve(root, "package.json"), "utf8");
  let n = 0;
  const broken: typeof writeFile = async (...args) => {
    if (++n === 2) throw new Error("disk full");
    return writeFile(...args);
  };
  await assert.rejects(
    applyInstallation(
      provider(),
      component(),
      { project: root },
      false,
      broken,
    ),
    /rolled back/,
  );
  assert.deepEqual(
    await readdir(resolve(root, "src/components/react-bits/Sample")),
    [],
  );
  assert.equal(await readFile(resolve(root, "package.json"), "utf8"), before);
});
test("concurrent apply lock refuses writes and preserves the other lock", async (t) => {
  const root = await setup(t);
  await mkdir(resolve(root, ".premium-frontend"));
  await writeFile(resolve(root, ".premium-frontend/install.lock"), "other");
  await assert.rejects(
    applyInstallation(provider(), component(), { project: root }),
    /Another installation/,
  );
  assert.equal(
    await readFile(resolve(root, ".premium-frontend/install.lock"), "utf8"),
    "other",
  );
});
