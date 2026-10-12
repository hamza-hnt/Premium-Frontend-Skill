import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkRelease } from "../scripts/lib/release.js";

test("release guard requires matching stable versions before publishing", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "premium-release-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const pkg = {
    name: "premium-frontend-skill",
    version: "1.2.1",
    private: true,
  };
  const lock = { version: "1.2.1", packages: { "": { version: "1.2.1" } } };
  const skill =
    '---\nname: premium-frontend-skill\nmetadata:\n  version: "1.2.1"\n---\n';
  const write = async (
    packageValue = pkg,
    lockValue = lock,
    skillValue = skill,
  ) => {
    await Promise.all([
      writeFile(join(root, "package.json"), JSON.stringify(packageValue)),
      writeFile(join(root, "package-lock.json"), JSON.stringify(lockValue)),
      writeFile(join(root, "SKILL.md"), skillValue),
    ]);
  };

  await write();
  assert.deepEqual(await checkRelease(root, "v1.2.1"), {
    version: "1.2.1",
    archive: "artifacts/premium-frontend-skill-1.2.1.tgz",
  });
  await write(pkg, lock, skill.replace(/\n/g, "\r\n"));
  assert.equal((await checkRelease(root, "v1.2.1")).version, "1.2.1");

  for (const tag of [
    "1.2.1",
    "v01.2.1",
    "v1.2.1-beta.1",
    "v1.2.1+build",
    "v1.2.1\narchive=wrong",
  ])
    await assert.rejects(checkRelease(root, tag), /stable versions/);

  await write({ ...pkg, version: "1.2.0" });
  await assert.rejects(checkRelease(root, "v1.2.1"), /package.json version/);
  await write(pkg, { ...lock, version: "1.2.0" });
  await assert.rejects(
    checkRelease(root, "v1.2.1"),
    /package-lock.json version/,
  );
  await write(pkg, { ...lock, packages: { "": { version: "1.2.0" } } });
  await assert.rejects(checkRelease(root, "v1.2.1"), /packages\[""\] version/);
  await write(pkg, lock, skill.replace("1.2.1", "1.2.0"));
  await assert.rejects(
    checkRelease(root, "v1.2.1"),
    /SKILL.md metadata version/,
  );
  await write(pkg, lock, skill.replace("metadata:", "other:"));
  await assert.rejects(
    checkRelease(root, "v1.2.1"),
    /SKILL.md metadata version/,
  );
  await write({ ...pkg, private: false });
  await assert.rejects(checkRelease(root, "v1.2.1"), /remain the private/);
  await write({ ...pkg, name: "unexpected-package" });
  await assert.rejects(checkRelease(root, "v1.2.1"), /remain the private/);
});
