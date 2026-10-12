import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import semver from "semver";

export async function checkRelease(root: string, tag: string) {
  const version = tag.slice(1);
  if (!/^v\d+\.\d+\.\d+$/.test(tag) || semver.valid(version) !== version)
    throw new Error("Release tags must be stable versions such as v1.2.1.");

  const [pkg, lock, skill] = await Promise.all([
    readFile(resolve(root, "package.json"), "utf8").then(JSON.parse),
    readFile(resolve(root, "package-lock.json"), "utf8").then(JSON.parse),
    readFile(resolve(root, "SKILL.md"), "utf8"),
  ]);
  const frontmatter = skill
    .replace(/\r\n/g, "\n")
    .match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1];
  const skillVersion = frontmatter?.match(
    /^metadata:\n  version: "([^"]+)"$/m,
  )?.[1];

  for (const [file, actual] of [
    ["package.json", pkg.version],
    ["package-lock.json", lock.version],
    ['package-lock.json packages[""]', lock.packages?.[""]?.version],
    ["SKILL.md metadata", skillVersion],
  ]) {
    if (actual !== version)
      throw new Error(
        `${file} version ${String(actual)} does not match ${tag}.`,
      );
  }
  if (pkg.name !== "premium-frontend-skill" || pkg.private !== true)
    throw new Error(
      "The repository root must remain the private premium-frontend-skill package.",
    );

  return {
    version,
    archive: `artifacts/premium-frontend-skill-${version}.tgz`,
  };
}
