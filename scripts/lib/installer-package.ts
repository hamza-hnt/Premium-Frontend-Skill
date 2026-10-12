import { chmod, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ROOT, hash, json } from "./core.js";
import { bundle } from "./bundle.js";
import { runNpm } from "../../installer/install.mjs";

export async function buildInstaller(
  output = resolve(ROOT, "artifacts/npm-package"),
) {
  const source = JSON.parse(
    await readFile(resolve(ROOT, "package.json"), "utf8"),
  );
  await rm(output, { recursive: true, force: true });
  await mkdir(resolve(output, "payload"), { recursive: true });
  const archive = resolve(output, "payload/skill.tar.gz");
  const bundled = await bundle(archive);
  await cp(resolve(ROOT, "installer"), output, { recursive: true });
  await cp(resolve(ROOT, "README.md"), resolve(output, "README.md"));
  await chmod(resolve(output, "cli.mjs"), 0o755);
  await writeFile(
    resolve(output, "payload/manifest.json"),
    json({
      schemaVersion: 1,
      name: source.name,
      version: source.version,
      archiveSha256: hash(await readFile(archive)),
      files: bundled.files,
    }),
  );
  await writeFile(
    resolve(output, "package.json"),
    json({
      name: source.name,
      version: source.version,
      description: "Install the Premium Frontend Skill for your coding agent.",
      type: "module",
      bin: { "premium-frontend-skill": "cli.mjs" },
      engines: source.engines,
      files: ["*.mjs", "payload"],
      dependencies: { tar: source.devDependencies.tar },
      repository: {
        type: "git",
        url: "git+https://github.com/hamza-hnt/Premium-Frontend-Skill.git",
      },
      homepage: "https://github.com/hamza-hnt/Premium-Frontend-Skill#readme",
      bugs: "https://github.com/hamza-hnt/Premium-Frontend-Skill/issues",
      keywords: ["codex", "agent-skills", "react", "react-bits", "frontend"],
      publishConfig: { access: "public" },
    }),
  );
  return { directory: output, version: source.version as string };
}

export async function packInstaller(
  directory = resolve(ROOT, "artifacts/npm-package"),
  destination = resolve(ROOT, "artifacts"),
) {
  await mkdir(destination, { recursive: true });
  const { stdout } = await runNpm(
    ["pack", "--json", "--ignore-scripts", "--pack-destination", destination],
    { cwd: directory, env: process.env },
  );
  const result = JSON.parse(stdout);
  // npm 10/11 return an array; npm 12 keys the results by package name.
  const [packed] = (Array.isArray(result) ? result : Object.values(result)) as {
    filename: string;
    files: { path: string }[];
  }[];
  if (!packed?.filename || !Array.isArray(packed.files))
    throw new Error("npm pack did not report a package archive.");
  return {
    archive: resolve(destination, packed.filename),
    files: packed.files.map((file: { path: string }) => file.path) as string[],
  };
}
