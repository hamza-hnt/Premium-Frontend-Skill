import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  lstat,
  readdir,
  rename,
  symlink,
  realpath,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { create } from "tar";
import {
  assertSupportedNode,
  installSkill,
  resolveDestination,
  SKILL_NAME,
} from "../installer/install.mjs";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const quiet = () => {};

async function fixture(t) {
  const root = await realpath(
    await mkdtemp(join(tmpdir(), "premium-installer-test-")),
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  const packageRoot = join(root, "npm package");
  const source = join(root, "source");
  const skill = join(source, SKILL_NAME);
  const payload = join(packageRoot, "payload");
  await mkdir(skill, { recursive: true });
  await mkdir(payload, { recursive: true });
  const files = {
    "SKILL.md": `---\nname: ${SKILL_NAME}\n---\nDesign skill\n`,
    "package.json": JSON.stringify({ name: SKILL_NAME, version: "1.2.0" }),
    "package-lock.json": JSON.stringify({
      name: SKILL_NAME,
      lockfileVersion: 3,
    }),
    "notes.txt": "original\n",
  };
  for (const [path, value] of Object.entries(files))
    await writeFile(join(skill, path), value);
  const archive = join(payload, "skill.tar.gz");
  const manifestPath = join(payload, "manifest.json");
  let manifest;
  async function pack(options = {}) {
    await create(
      { file: archive, gzip: true, cwd: source, portable: true, ...options },
      [SKILL_NAME],
    );
    manifest = {
      schemaVersion: 1,
      name: SKILL_NAME,
      version: "1.2.0",
      archiveSha256: hash(await readFile(archive)),
      files: Object.fromEntries(
        Object.entries(files).map(([path, value]) => [path, hash(value)]),
      ),
    };
    await writeFile(manifestPath, JSON.stringify(manifest));
  }
  await pack();
  const destination = join(root, "user profile", "skills", SKILL_NAME);
  const calls = [];
  const runner = async (args, options) => {
    calls.push({ args, ...options });
    if (args[0] === "ci") {
      await mkdir(join(options.cwd, "node_modules"), { recursive: true });
      await writeFile(
        join(options.cwd, "node_modules", "installed.txt"),
        "dependencies",
      );
    }
  };
  const options = { packageRoot, destination, runner, log: quiet };
  return {
    root,
    packageRoot,
    source,
    skill,
    archive,
    manifestPath,
    destination,
    files,
    calls,
    runner,
    options,
    pack,
    get manifest() {
      return manifest;
    },
  };
}

async function exists(path) {
  return lstat(path).then(
    () => true,
    (error) => {
      if (error.code === "ENOENT") return false;
      throw error;
    },
  );
}

async function noTransientDirectories(f) {
  const entries = await readdir(
    join(f.root, "user profile", ".premium-frontend-installer"),
  );
  assert.equal(
    entries.some(
      (name) => name.endsWith(".lock") || name.startsWith("prepare-"),
    ),
    false,
  );
}

test("destination respects CODEX_HOME and expands a full --dest, including spaces", () => {
  const home = join(tmpdir(), "example-home");
  const custom = join(tmpdir(), "custom codex");
  assert.equal(
    resolveDestination({ env: {}, home }),
    join(home, ".codex", "skills", SKILL_NAME),
  );
  assert.equal(
    resolveDestination({ env: { CODEX_HOME: custom }, home }),
    join(custom, "skills", SKILL_NAME),
  );
  assert.equal(
    resolveDestination({ env: { CODEX_HOME: "~/codex" }, home }),
    join(home, "codex", "skills", SKILL_NAME),
  );
  assert.equal(
    resolveDestination({ destination: "~/custom skill", env: {}, home }),
    join(home, "custom skill"),
  );
  assert.throws(() => resolveDestination({ destination: " " }), /non-empty/);
});

test("runtime version requirements reject unsupported versions", () => {
  for (const version of ["20.19.0", "22.11.0", "27.0.0", "invalid"])
    assert.throws(() => assertSupportedNode(version), /required/);
  for (const version of ["22.12.0", "24.0.0", "26.8.1"])
    assert.doesNotThrow(() => assertSupportedNode(version));
});

test("fresh install prepares dependencies and validates before becoming visible", async (t) => {
  const f = await fixture(t);
  const result = await installSkill({
    ...f.options,
    env: { NODE_ENV: "production" },
    runner: async (args, options) => {
      assert.equal(await exists(f.destination), false);
      await f.runner(args, options);
    },
  });
  assert.equal(result.destination, f.destination);
  assert.equal(result.backup, null);
  assert.equal(
    await readFile(join(f.destination, "notes.txt"), "utf8"),
    f.files["notes.txt"],
  );
  assert.deepEqual(
    f.calls.map((call) => call.args),
    [
      ["ci", "--include=dev", "--include=optional", "--ignore-scripts=false"],
      ["run", "validate"],
    ],
  );
  assert.equal(f.calls[0].env.NODE_ENV, "development");
  const receipt = JSON.parse(
    await readFile(
      join(f.destination, ".premium-frontend-install.json"),
      "utf8",
    ),
  );
  assert.deepEqual(receipt.files, f.manifest.files);
  assert.equal(
    await exists(join(f.destination, "node_modules", "installed.txt")),
    true,
  );
  await noTransientDirectories(f);
});

test("existing installation refuses replacement without --update", async (t) => {
  const f = await fixture(t);
  await installSkill(f.options);
  await assert.rejects(installSkill(f.options), /--update/);
  assert.equal(f.calls.length, 2);
  await noTransientDirectories(f);
});

test("update preserves complete old copy and reports local modifications/deletions", async (t) => {
  const f = await fixture(t);
  await installSkill(f.options);
  await writeFile(join(f.destination, "notes.txt"), "local customization");
  await rm(join(f.destination, "package-lock.json"));
  await mkdir(join(f.destination, ".git"));
  await writeFile(join(f.destination, ".git", "config"), "local git");
  const logs = [];
  const result = await installSkill({
    ...f.options,
    update: true,
    log: (value) => logs.push(value),
  });
  assert.equal(
    await readFile(join(result.backup, "notes.txt"), "utf8"),
    "local customization",
  );
  assert.equal(
    await readFile(join(result.backup, ".git", "config"), "utf8"),
    "local git",
  );
  assert.equal(
    await exists(join(result.backup, "node_modules", "installed.txt")),
    true,
  );
  assert.equal(await exists(join(result.backup, "package-lock.json")), false);
  assert.equal(
    await readFile(join(f.destination, "notes.txt"), "utf8"),
    "original\n",
  );
  assert.equal(
    result.backup.includes(`${join("user profile", "skills")}`),
    false,
  );
  assert.ok(
    logs.some(
      (value) =>
        value.includes("notes.txt") && value.includes("package-lock.json"),
    ),
  );
  await noTransientDirectories(f);
});

for (const failingCommand of ["ci", "run"]) {
  test(`npm ${failingCommand} failure preserves previous installation and cleans staging`, async (t) => {
    const f = await fixture(t);
    await installSkill(f.options);
    await writeFile(join(f.destination, "notes.txt"), "keep me");
    await assert.rejects(
      installSkill({
        ...f.options,
        update: true,
        runner: async (args) => {
          if (args[0] === failingCommand)
            throw new Error("controlled npm failure");
        },
      }),
      /controlled npm failure/,
    );
    assert.equal(
      await readFile(join(f.destination, "notes.txt"), "utf8"),
      "keep me",
    );
    await noTransientDirectories(f);
  });
}

test("failure during a fresh installation leaves no visible skill", async (t) => {
  const f = await fixture(t);
  await assert.rejects(
    installSkill({
      ...f.options,
      runner: async () => {
        throw new Error("network unavailable");
      },
    }),
    /network unavailable/,
  );
  assert.equal(await exists(f.destination), false);
  await noTransientDirectories(f);
});

test("unrelated directories and symlink destinations are never replaced", async (t) => {
  const f = await fixture(t);
  await mkdir(f.destination, { recursive: true });
  await writeFile(join(f.destination, "keep.txt"), "unrelated");
  await assert.rejects(
    installSkill({ ...f.options, update: true }),
    /not an existing/,
  );
  assert.equal(
    await readFile(join(f.destination, "keep.txt"), "utf8"),
    "unrelated",
  );
  await rm(f.destination, { recursive: true });
  await symlink(f.skill, f.destination, "junction");
  await assert.rejects(
    installSkill({ ...f.options, update: true }),
    /symbolic-link/,
  );
  assert.equal((await lstat(f.destination)).isSymbolicLink(), true);
  assert.equal(f.calls.length, 0);
});

test("archive checksum and file checksum failures are rejected before npm", async (t) => {
  const f = await fixture(t);
  await writeFile(
    f.manifestPath,
    JSON.stringify({ ...f.manifest, archiveSha256: "a".repeat(64) }),
  );
  await assert.rejects(installSkill(f.options), /archive checksum mismatch/);
  await writeFile(
    f.manifestPath,
    JSON.stringify({
      ...f.manifest,
      files: { ...f.manifest.files, "notes.txt": "a".repeat(64) },
    }),
  );
  await assert.rejects(installSkill(f.options), /Payload checksum mismatch/);
  assert.equal(f.calls.length, 0);
  assert.equal(await exists(f.destination), false);
});

test("archive traversal and symlink entries are rejected without extraction", async (t) => {
  const f = await fixture(t);
  await f.pack({ prefix: "../escape" });
  await assert.rejects(installSkill(f.options), /Unsafe archive entry/);
  await symlink(f.source, join(f.skill, "linked-directory"), "junction");
  await f.pack();
  await assert.rejects(installSkill(f.options), /Unsafe archive entry/);
  assert.equal(f.calls.length, 0);
  assert.equal(await exists(f.destination), false);
});

test("destination lock prevents concurrent installation", async (t) => {
  const f = await fixture(t);
  let started;
  let release;
  const ready = new Promise((resolve) => {
    started = resolve;
  });
  const wait = new Promise((resolve) => {
    release = resolve;
  });
  const first = installSkill({
    ...f.options,
    runner: async () => {
      started();
      await wait;
    },
  });
  await ready;
  try {
    await assert.rejects(installSkill(f.options), /destination lock/);
  } finally {
    release();
  }
  await first;
  await noTransientDirectories(f);
});

test("updates refuse to commit if user files change while dependencies prepare", async (t) => {
  const f = await fixture(t);
  await installSkill(f.options);
  await assert.rejects(
    installSkill({
      ...f.options,
      update: true,
      runner: async () => {
        await writeFile(join(f.destination, "notes.txt"), "new user change");
      },
    }),
    /changed during preparation/,
  );
  assert.equal(
    await readFile(join(f.destination, "notes.txt"), "utf8"),
    "new user change",
  );
  await noTransientDirectories(f);
});

test("final rename failure restores previous installation", async (t) => {
  const f = await fixture(t);
  await installSkill(f.options);
  await writeFile(join(f.destination, "notes.txt"), "restore me");
  let renames = 0;
  await assert.rejects(
    installSkill({
      ...f.options,
      update: true,
      rename: async (from, to) => {
        renames += 1;
        if (renames === 2) throw new Error("controlled final rename failure");
        await rename(from, to);
      },
    }),
    /controlled final rename failure/,
  );
  assert.equal(renames, 3);
  assert.equal(
    await readFile(join(f.destination, "notes.txt"), "utf8"),
    "restore me",
  );
  await noTransientDirectories(f);
});

test("source package overlap is rejected before writes", async (t) => {
  const f = await fixture(t);
  await assert.rejects(
    installSkill({ ...f.options, destination: join(f.packageRoot, "skill") }),
    /overlap/,
  );
  assert.equal(await exists(join(f.packageRoot, "skill")), false);
});

test("failed rollback preserves the backup and reports its recovery path", async (t) => {
  const f = await fixture(t);
  await installSkill(f.options);
  await writeFile(join(f.destination, "notes.txt"), "recover me");
  let backup;
  let renames = 0;
  await assert.rejects(
    installSkill({
      ...f.options,
      update: true,
      rename: async (from, to) => {
        renames += 1;
        if (renames === 1) {
          backup = to;
          await rename(from, to);
        } else throw new Error("controlled filesystem failure");
      },
    }),
    (error) => {
      assert.match(error.message, /automatic restore failed/);
      assert.ok(error.message.includes(backup));
      return true;
    },
  );
  assert.equal(await readFile(join(backup, "notes.txt"), "utf8"), "recover me");
  assert.equal(await exists(f.destination), false);
  await noTransientDirectories(f);
});

test("modified legacy copies can update with a complete backup", async (t) => {
  const f = await fixture(t);
  await mkdir(f.destination, { recursive: true });
  for (const [path, value] of Object.entries(f.files)) {
    await writeFile(join(f.destination, path), value);
  }
  await writeFile(join(f.destination, "custom.txt"), "legacy addition");
  const messages = [];
  const result = await installSkill({
    ...f.options,
    update: true,
    log: (message) => messages.push(message),
  });
  assert.equal(
    await readFile(join(result.backup, "custom.txt"), "utf8"),
    "legacy addition",
  );
  assert.ok(
    messages.some((message) => message.includes("no installer receipt")),
  );
  assert.equal(await exists(join(f.destination, "custom.txt")), false);
});

test("a direct home destination keeps staging inside the writable home", async (t) => {
  const f = await fixture(t);
  const home = join(f.root, "fake users", "example");
  const options = {
    ...f.options,
    destination: "~/custom frontend skill",
    home,
  };
  const result = await installSkill(options);
  assert.equal(result.destination, join(home, "custom frontend skill"));
  const workspace = join(home, ".premium-frontend-installer");
  assert.equal(await exists(workspace), true);
  assert.equal(
    await exists(join(f.root, "fake users", ".premium-frontend-installer")),
    false,
  );
  for (const call of f.calls) {
    assert.equal(call.cwd.startsWith(join(workspace, "prepare-")), true);
  }
  const updated = await installSkill({ ...options, update: true });
  assert.equal(updated.backup.startsWith(join(workspace, "backup-")), true);
});

test("nested skill destinations keep preparation and backups outside the skills tree", async (t) => {
  const f = await fixture(t);
  const skillsRoot = join(f.root, "user profile", "skills");
  const destination = join(skillsRoot, "team", "my-frontend-skill");
  const options = { ...f.options, destination };
  await installSkill(options);
  const result = await installSkill({ ...options, update: true });
  const workspace = join(f.root, "user profile", ".premium-frontend-installer");
  assert.equal(result.backup.startsWith(join(workspace, "backup-")), true);
  for (const call of f.calls) {
    assert.equal(call.cwd.startsWith(join(workspace, "prepare-")), true);
  }
  assert.deepEqual(await readdir(skillsRoot), ["team"]);
  assert.deepEqual(await readdir(join(skillsRoot, "team")), [
    "my-frontend-skill",
  ]);
});

test("destinations cannot overlap the installer state directory or its children", async (t) => {
  const f = await fixture(t);
  const state = join(f.root, "custom profile", ".premium-frontend-installer");
  for (const destination of [state, join(state, "child")]) {
    await assert.rejects(
      installSkill({ ...f.options, destination }),
      /overlaps the installer working directory/,
    );
    assert.equal(await exists(destination), false);
  }
});
