import {
  mkdtemp,
  mkdir,
  readdir,
  lstat,
  cp,
  rm,
  readFile,
} from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { create, list } from "tar";
import { ROOT, hash } from "./core.js";
export const INCLUDED = [
  "SKILL.md",
  "README.md",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  ".nvmrc",
  ".gitignore",
  ".gitattributes",
  ".prettierignore",
  "providers",
  "registry",
  "scripts",
  "references",
  "tests",
  "examples",
  "docs",
  "installer",
];
async function rejectLinks(path: string): Promise<void> {
  const stat = await lstat(path);
  if (stat.isSymbolicLink()) throw new Error(`Cannot bundle symlink: ${path}`);
  if (!stat.isFile() && !stat.isDirectory())
    throw new Error(`Cannot bundle special file: ${path}`);
  if (stat.isDirectory())
    for (const name of await readdir(path)) await rejectLinks(join(path, name));
}
async function fileHashes(
  root: string,
  prefix = "",
): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  for (const entry of await readdir(join(root, prefix), {
    withFileTypes: true,
  })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) Object.assign(files, await fileHashes(root, name));
    else files[name] = hash(await readFile(join(root, name)));
  }
  return files;
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
    const files = await fileHashes(dest);
    // Archive only the staged allowlist, using Node so packaging also works on Windows.
    await create(
      {
        file: out,
        cwd: staging,
        gzip: true,
        portable: true,
        mtime: new Date(0),
      },
      ["premium-frontend-skill"],
    );
    const entries: string[] = [];
    await list({
      file: out,
      onReadEntry: (entry) => {
        entries.push(entry.path);
      },
    });
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
      files,
    };
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
