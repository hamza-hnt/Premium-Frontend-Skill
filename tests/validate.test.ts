import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  cp,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { ROOT } from "../scripts/lib/core.js";

const exec = promisify(execFile);

test("real validator accepts LF and CRLF skills without rewriting their bytes", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "premium-validate-eol-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const entry of [
    "scripts",
    "registry",
    "providers",
    "references",
    "package.json",
  ])
    await cp(resolve(ROOT, entry), join(root, entry), { recursive: true });
  await symlink(
    resolve(ROOT, "node_modules"),
    join(root, "node_modules"),
    "junction",
  );
  const source = (await readFile(resolve(ROOT, "SKILL.md"), "utf8")).replace(
    /\r\n/g,
    "\n",
  );
  const skill = join(root, "SKILL.md");
  const validate = () =>
    exec(
      process.execPath,
      [
        resolve(ROOT, "node_modules/tsx/dist/cli.mjs"),
        join(root, "scripts/validate.ts"),
      ],
      { cwd: root },
    );

  for (const newline of ["\n", "\r\n"]) {
    const content = Buffer.from(source.replace(/\n/g, newline));
    await writeFile(skill, content);
    assert.equal(JSON.parse((await validate()).stdout).valid, true);
    assert.deepEqual(
      await readFile(skill),
      content,
      "Validation must preserve archive/receipt hashes",
    );

    for (const invalid of [
      source.replace("name: premium-frontend-skill", "name: another-skill"),
      source.replace(/^description: .+\n/m, ""),
    ]) {
      await writeFile(skill, invalid.replace(/\n/g, newline));
      await assert.rejects(validate(), (error: Error & { stderr?: string }) => {
        assert.equal(
          JSON.parse(error.stderr ?? "{}").error,
          "Invalid skill frontmatter",
        );
        return true;
      });
    }
  }
});
