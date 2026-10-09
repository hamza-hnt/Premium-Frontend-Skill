import { mkdtemp, mkdir, readdir, lstat, cp, rm } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ROOT } from "./core.js";
const exec = promisify(execFile);
export const INCLUDED = [
  "SKILL.md",
  "README.md",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  ".nvmrc",
  ".gitignore",
  ".prettierignore",
  "providers",
  "registry",
  "scripts",
  "references",
  "tests",
  "examples",
  "docs",
];
async function rejectLinks(path: string): Promise<void> {
  const stat = await lstat(path);
  if (stat.isSymbolicLink()) throw new Error(`Cannot bundle symlink: ${path}`);
  if (stat.isDirectory())
    for (const name of await readdir(path)) await rejectLinks(join(path, name));
}
export async function bundle(output: string) {
  const out = resolve(output);
  const staging = await mkdtemp(join(tmpdir(), "premium-skill-bundle-"));
  const dest = join(staging, "premium-frontend-skill");
  try {
    await mkdir(dest);
    for (const name of INCLUDED) {
      await rejectLinks(resolve(ROOT, name));
      await cp(resolve(ROOT, name), resolve(dest, name), { recursive: true });
    }
    await mkdir(dirname(out), { recursive: true });
    // tar only receives our staged allowlist. Caches and generated applications cannot enter the archive.
    await exec("tar", ["-czf", out, "-C", staging, "premium-frontend-skill"]);
    const entries = (await exec("tar", ["-tzf", out])).stdout
      .trim()
      .split("\n");
    if (
      entries.some((p) =>
        /\/(?:node_modules|\.cache|\.local|artifacts|\.git)\//.test(p),
      )
    )
      throw new Error("Bundle contains an excluded directory");
    return {
      output: out,
      entries: entries.length,
      containsUpstreamSource: false,
    };
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
