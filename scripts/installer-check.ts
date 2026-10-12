import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { cli, hash, json, ROOT } from "./lib/core.js";
import { buildInstaller, packInstaller } from "./lib/installer-package.js";
import { runNpm } from "../installer/install.mjs";

await cli(async () => {
  const scratch = await mkdtemp(join(tmpdir(), "premium-installer-consumer-"));
  try {
    const built = await buildInstaller(join(scratch, "npm-package"));
    const packed = await packInstaller(built.directory, scratch);
    assert.deepEqual(
      packed.files.sort(),
      [
        "README.md",
        "cli.mjs",
        "install.mjs",
        "package.json",
        "payload/manifest.json",
        "payload/skill.tar.gz",
      ].sort(),
    );
    const packagedManifest = JSON.parse(
      await readFile(join(built.directory, "package.json"), "utf8"),
    );
    assert.equal(
      packagedManifest.scripts,
      undefined,
      "npm installation must not trigger lifecycle setup",
    );

    const project = join(scratch, "consumer project with spaces");
    await mkdir(project);
    const projectPackage = json({ name: "untouched-consumer", private: true });
    await writeFile(join(project, "package.json"), projectPackage);
    const home = join(scratch, "fake codex home");
    const env = {
      ...process.env,
      CODEX_HOME: home,
      npm_config_cache: join(scratch, "npm cache"),
      // The installer must explicitly include its tooling even in production shells.
      NODE_ENV: "production",
      npm_config_omit: "dev",
      npm_config_ignore_scripts: "true",
    };
    const invoke = (args: string[]) =>
      runNpm(
        [
          "exec",
          "--yes",
          "--package",
          packed.archive,
          "--",
          "premium-frontend-skill",
          ...args,
        ],
        { cwd: project, env },
      );

    console.log("Checking the packed npm executable and fresh installation...");
    assert.match((await invoke(["--help"])).stdout, /--dest/);
    assert.match(
      (await invoke(["--version"])).stdout,
      new RegExp(built.version.replaceAll(".", "\\.")),
    );
    await invoke(["install"]);
    const destination = join(home, "skills/premium-frontend-skill");
    assert.equal(
      hash(await readFile(join(destination, "package-lock.json"))),
      hash(await readFile(resolve(ROOT, "package-lock.json"))),
      "The original lockfile must survive npm packaging and npm ci",
    );
    const validate = JSON.parse(
      (await runNpm(["--silent", "run", "validate"], { cwd: destination, env }))
        .stdout,
    );
    assert.equal(validate.valid, true);
    const search = JSON.parse(
      (
        await runNpm(
          [
            "--silent",
            "run",
            "components:search",
            "--",
            "--query",
            "BlurText",
            "--json",
          ],
          { cwd: destination, env },
        )
      ).stdout,
    );
    assert.equal(search.results[0].id, "react-bits:blur-text");
    await assert.rejects(invoke(["install"]), /Already installed/);

    console.log(
      "Checking update, local-edit backup, and a custom destination...",
    );
    const entrypoint = await readFile(join(destination, "SKILL.md"), "utf8");
    await writeFile(
      join(destination, "SKILL.md"),
      `${entrypoint}\nLocal customization for the package test.\n`,
    );
    await writeFile(
      join(destination, "personal-notes.txt"),
      "Keep this local file.",
    );
    const updated = await invoke(["install", "--update"]);
    assert.match(updated.stdout, /Local modifications/);
    assert.equal(
      await readFile(join(destination, "SKILL.md"), "utf8"),
      entrypoint,
    );
    const state = join(home, ".premium-frontend-installer");
    const backups = (await readdir(state)).filter((name) =>
      name.startsWith("backup-"),
    );
    assert.equal(backups.length, 1);
    const backup = join(state, backups[0], "premium-frontend-skill");
    assert.equal(
      await readFile(join(backup, "personal-notes.txt"), "utf8"),
      "Keep this local file.",
    );
    assert.match(
      await readFile(join(backup, "SKILL.md"), "utf8"),
      /Local customization/,
    );
    assert.deepEqual(await readdir(join(home, "skills")), [
      "premium-frontend-skill",
    ]);

    const custom = join(scratch, "custom skills", "my frontend skill");
    await invoke(["install", "--dest", custom]);
    await readFile(join(custom, "node_modules/tsx/dist/cli.mjs"));
    assert.equal(
      await readFile(join(project, "package.json"), "utf8"),
      projectPackage,
    );
    assert.deepEqual(await readdir(project), ["package.json"]);
    console.log(
      json({
        passed: true,
        platform: process.platform,
        node: process.version,
        package: "actual npm tarball via npm exec",
        cases: [
          "help/version",
          "CODEX_HOME",
          "paths with spaces",
          "fresh install",
          "production environment",
          "lockfile preservation",
          "catalogue search",
          "existing destination refusal",
          "update",
          "local-edit backup",
          "custom destination",
          "caller project unchanged",
        ],
      }),
    );
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
});
