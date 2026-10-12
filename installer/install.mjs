import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  readlink,
  realpath,
  rename as move,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  delimiter,
  dirname,
  isAbsolute,
  join,
  parse,
  relative,
  resolve,
  sep,
} from "node:path";
import { homedir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
import { list, extract } from "tar";

export const SKILL_NAME = "premium-frontend-skill";
const RECEIPT = ".premium-frontend-install.json";
const HASH = /^[a-f0-9]{64}$/;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export function assertSupportedNode(version = process.versions.node) {
  const [major, minor] = version.split(".").map(Number);
  if (
    !Number.isInteger(major) ||
    major < 22 ||
    major >= 27 ||
    (major === 22 && minor < 12)
  ) {
    throw new Error(`Node.js >=22.12.0 and <27 is required; found ${version}.`);
  }
}

export function resolveDestination({
  destination,
  env = process.env,
  home = homedir(),
} = {}) {
  const expand = (path) =>
    path === "~"
      ? home
      : /^~[/\\]/.test(path)
        ? join(home, path.slice(2))
        : path;
  if (destination !== undefined) {
    if (typeof destination !== "string" || !destination.trim())
      throw new Error("--dest needs a non-empty directory path.");
    return resolve(expand(destination));
  }
  const codexHome = env.CODEX_HOME?.trim()
    ? expand(env.CODEX_HOME)
    : join(home, ".codex");
  return resolve(codexHome, "skills", SKILL_NAME);
}

async function maybeStat(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function fileHash(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

function isWithin(path, parent) {
  const rel = relative(parent, path);
  return (
    rel === "" ||
    (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel))
  );
}

// Resolve existing ancestors before checking overlap and taking the destination lock.
async function canonicalPath(path) {
  if (await maybeStat(path)) return realpath(path);
  const parent = dirname(path);
  if (parent === path) return path;
  return join(await canonicalPath(parent), basename(path));
}

export async function resolveNpmCommand(env = process.env) {
  const candidates = [];
  if (
    env.npm_execpath &&
    /^(npm-cli|npm)\.js$/.test(basename(env.npm_execpath))
  )
    candidates.push(env.npm_execpath);
  candidates.push(
    join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"),
  );
  for (const directory of (env.PATH || env.Path || "")
    .split(delimiter)
    .filter(Boolean)) {
    candidates.push(
      join(directory, "node_modules", "npm", "bin", "npm-cli.js"),
    );
    const npmPath = join(
      directory,
      process.platform === "win32" ? "npm.cmd" : "npm",
    );
    if (await maybeStat(npmPath)) {
      const target = await realpath(npmPath);
      if (basename(target) === "npm-cli.js") candidates.push(target);
      else if (process.platform !== "win32") candidates.push(npmPath);
    }
  }
  for (const candidate of candidates) {
    if ((await maybeStat(candidate))?.isFile()) {
      return candidate.endsWith(".js")
        ? { command: process.execPath, prefix: [candidate] }
        : { command: candidate, prefix: [] };
    }
  }
  throw new Error(
    "npm could not be found. Install Node.js with npm and retry.",
  );
}

export async function runNpm(args, { cwd, env = process.env }) {
  const { command, prefix } = await resolveNpmCommand(env);
  try {
    return await exec(command, [...prefix, ...args], {
      cwd,
      env,
      maxBuffer: 8 * 1024 * 1024,
      shell: false,
    });
  } catch (error) {
    throw new Error(
      `npm ${args[0]} failed: ${error.stderr || error.stdout || error.message}`,
      { cause: error },
    );
  }
}

function validRelativePath(path) {
  return (
    typeof path === "string" &&
    path.length > 0 &&
    !path.includes("\\") &&
    !path.includes("\0") &&
    !path.includes(":") &&
    !isAbsolute(path) &&
    path.split("/").every((part) => part && part !== "." && part !== "..")
  );
}

async function readPayload(packageRoot) {
  const manifest = JSON.parse(
    await readFile(join(packageRoot, "payload", "manifest.json"), "utf8"),
  );
  if (
    manifest.schemaVersion !== 1 ||
    manifest.name !== SKILL_NAME ||
    typeof manifest.version !== "string" ||
    !HASH.test(manifest.archiveSha256) ||
    !manifest.files ||
    Array.isArray(manifest.files) ||
    typeof manifest.files !== "object"
  ) {
    throw new Error("Invalid installer payload manifest.");
  }
  for (const [path, hash] of Object.entries(manifest.files)) {
    if (!validRelativePath(path) || !HASH.test(hash) || path === RECEIPT)
      throw new Error(`Invalid payload file entry: ${path}`);
  }
  for (const required of ["SKILL.md", "package.json", "package-lock.json"]) {
    if (!Object.hasOwn(manifest.files, required))
      throw new Error(`Payload is missing ${required}.`);
  }
  const archive = join(packageRoot, "payload", "skill.tar.gz");
  if ((await fileHash(archive)) !== manifest.archiveSha256)
    throw new Error("Installer archive checksum mismatch.");
  const seen = new Set();
  let archiveError;
  await list({
    file: archive,
    strict: true,
    onReadEntry(entry) {
      const directory = entry.type === "Directory";
      const name = directory ? entry.path.replace(/\/$/, "") : entry.path;
      if (
        (!directory && entry.type !== "File" && entry.type !== "OldFile") ||
        !validRelativePath(name) ||
        (name !== SKILL_NAME && !name.startsWith(`${SKILL_NAME}/`)) ||
        (!directory && name === SKILL_NAME)
      ) {
        archiveError ||= new Error(
          `Unsafe archive entry: ${entry.path} (${entry.type}).`,
        );
        return;
      }
      if (seen.has(name))
        archiveError ||= new Error(`Duplicate archive entry: ${entry.path}`);
      seen.add(name);
      if (
        !directory &&
        !Object.hasOwn(manifest.files, name.slice(SKILL_NAME.length + 1))
      )
        archiveError ||= new Error(`Unlisted archive file: ${entry.path}`);
    },
  });
  if (archiveError) throw archiveError;
  return { archive, manifest };
}

async function inspectSkill(directory) {
  const info = await maybeStat(directory);
  if (!info?.isDirectory() || info.isSymbolicLink())
    throw new Error(
      `Destination must be a regular skill directory: ${directory}`,
    );
  for (const path of ["SKILL.md", "package.json"]) {
    if (!(await maybeStat(join(directory, path)))?.isFile())
      throw new Error(
        `Destination is not an existing ${SKILL_NAME} installation.`,
      );
  }
  const pkg = JSON.parse(
    await readFile(join(directory, "package.json"), "utf8"),
  );
  const skill = await readFile(join(directory, "SKILL.md"), "utf8");
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(skill)?.[1];
  if (
    pkg.name !== SKILL_NAME ||
    !frontmatter ||
    !new RegExp(`^name:\\s*["']?${SKILL_NAME}["']?\\s*$`, "m").test(frontmatter)
  ) {
    throw new Error(
      `Destination is not an existing ${SKILL_NAME} installation.`,
    );
  }
  return pkg;
}

// Hash the complete old tree, including local extras, to notice changes during preparation.
// Symlinks inside an installation are recorded, never traversed.
async function snapshot(directory) {
  const entries = Object.create(null);
  async function walk(path, prefix) {
    for (const name of (await readdir(path)).sort()) {
      const full = join(path, name);
      const key = prefix ? `${prefix}/${name}` : name;
      const info = await lstat(full);
      if (info.isSymbolicLink()) entries[key] = `link:${await readlink(full)}`;
      else if (info.isDirectory()) {
        entries[key] = `dir:${info.mode}`;
        await walk(full, key);
      } else if (info.isFile())
        entries[key] = `file:${info.mode}:${await fileHash(full)}`;
      else
        throw new Error(
          `Unsupported file type in existing installation: ${key}`,
        );
    }
  }
  await walk(directory, "");
  return entries;
}

async function reportLocalChanges(destination, log) {
  let previous;
  try {
    previous = JSON.parse(await readFile(join(destination, RECEIPT), "utf8"));
    if (
      previous.schemaVersion !== 1 ||
      !previous.files ||
      typeof previous.files !== "object"
    )
      previous = null;
  } catch (error) {
    if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) throw error;
  }
  if (!previous) {
    log(
      "Existing installation has no installer receipt; all previous files will be preserved in the backup.",
    );
    return;
  }
  const changed = [];
  for (const [path, hash] of Object.entries(previous.files)) {
    if (!validRelativePath(path) || !HASH.test(hash))
      throw new Error("Invalid installation receipt; update refused.");
    const info = await maybeStat(join(destination, path));
    if (!info?.isFile() || (await fileHash(join(destination, path))) !== hash)
      changed.push(path);
  }
  if (changed.length)
    log(
      `Local modifications/deletions will be kept in the backup: ${changed.slice(0, 12).join(", ")}${changed.length > 12 ? ` (+${changed.length - 12} more)` : ""}.`,
    );
  log(
    "The complete previous installation, including additional files, will be backed up; local edits are not merged into the new version.",
  );
}

export async function installSkill({
  packageRoot,
  destination,
  update = false,
  env = process.env,
  home = homedir(),
  runner = runNpm,
  rename = move,
  log = console.log,
} = {}) {
  assertSupportedNode();
  if (!packageRoot) throw new Error("Missing installer package directory.");
  const source = await realpath(packageRoot);
  const requested = resolveDestination({ destination, env, home });
  const directInfo = await maybeStat(requested);
  if (directInfo?.isSymbolicLink())
    throw new Error(
      "Refusing to replace a symbolic-link destination; choose a real directory with --dest.",
    );
  const dest = await canonicalPath(requested);
  if (
    dest === parse(dest).root ||
    isWithin(source, dest) ||
    isWithin(dest, source)
  )
    throw new Error(
      "Destination must not be a filesystem root or overlap the installer package.",
    );
  for (let ancestor = dest; ; ancestor = dirname(ancestor)) {
    if (basename(ancestor).toLowerCase() === ".premium-frontend-installer") {
      throw new Error("Destination overlaps the installer working directory.");
    }
    if (dirname(ancestor) === ancestor) break;
  }
  const parent = dirname(dest);
  // Keep staging/backups outside a discovered skills tree, including nested
  // custom destinations. Other destinations only require their own parent to
  // be writable (for example ~/premium-frontend-skill).
  let workspaceParent = parent;
  for (let ancestor = parent; ; ancestor = dirname(ancestor)) {
    if (basename(ancestor).toLowerCase() === "skills") {
      workspaceParent = dirname(ancestor);
      break;
    }
    if (dirname(ancestor) === ancestor) break;
  }
  const workspace = join(workspaceParent, ".premium-frontend-installer");
  if (isWithin(workspace, dest) || isWithin(dest, workspace))
    throw new Error("Destination overlaps the installer working directory.");
  const { archive, manifest } = await readPayload(source);
  if (runner === runNpm) await resolveNpmCommand(env);
  await mkdir(workspace, { recursive: true });
  if ((await lstat(workspace)).isSymbolicLink())
    throw new Error("Installer working directory must not be a symbolic link.");
  const lockPath = join(workspace, `${sha256(dest)}.lock`);
  let lock;
  try {
    lock = await open(lockPath, "wx", 0o600);
  } catch (error) {
    if (error.code === "EEXIST")
      throw new Error(
        `Another installation holds the destination lock: ${lockPath}. If its process has stopped, remove that lock and retry.`,
      );
    throw error;
  }
  let staging;
  try {
    await lock.writeFile(
      JSON.stringify({
        pid: process.pid,
        destination: dest,
        startedAt: new Date().toISOString(),
      }),
    );
    const existing = await maybeStat(dest);
    if (existing?.isSymbolicLink())
      throw new Error("Refusing to replace a symbolic-link destination.");
    if (existing && !update)
      throw new Error(
        `Already installed at ${dest}. Run again with --update to replace it and keep a backup.`,
      );
    if (existing) await inspectSkill(dest);
    if (existing) await reportLocalChanges(dest, log);
    const before = existing ? JSON.stringify(await snapshot(dest)) : null;
    await mkdir(parent, { recursive: true });
    if ((await stat(parent)).dev !== (await stat(workspace)).dev)
      throw new Error(
        "Installer staging and destination must be on the same filesystem; choose another --dest.",
      );
    staging = await mkdtemp(join(workspace, "prepare-"));
    await extract({
      file: archive,
      cwd: staging,
      strict: true,
      preserveOwner: false,
      noChmod: true,
    });
    const prepared = join(staging, SKILL_NAME);
    const payloadFiles = await snapshot(prepared);
    const actual = Object.keys(payloadFiles).filter(
      (key) => !payloadFiles[key].startsWith("dir:"),
    );
    if (actual.length !== Object.keys(manifest.files).length)
      throw new Error("Extracted payload does not match the manifest.");
    for (const [path, hash] of Object.entries(manifest.files)) {
      if (
        !(await maybeStat(join(prepared, path)))?.isFile() ||
        (await fileHash(join(prepared, path))) !== hash
      )
        throw new Error(`Payload checksum mismatch: ${path}`);
    }
    const pkg = await inspectSkill(prepared);
    if (pkg.version !== manifest.version)
      throw new Error("Payload package version does not match the manifest.");
    const runEnv = { ...env, NODE_ENV: "development" };
    log(`Preparing ${SKILL_NAME} ${manifest.version} for ${dest}`);
    log("Installing locked dependencies…");
    await runner(
      ["ci", "--include=dev", "--include=optional", "--ignore-scripts=false"],
      { cwd: prepared, env: runEnv },
    );
    log("Validating the skill catalogue…");
    await runner(["run", "validate"], { cwd: prepared, env: runEnv });
    await writeFile(
      join(prepared, RECEIPT),
      `${JSON.stringify({ schemaVersion: 1, name: SKILL_NAME, version: manifest.version, installedAt: new Date().toISOString(), files: manifest.files }, null, 2)}\n`,
    );
    const now = await maybeStat(dest);
    if (
      existing
        ? !now?.isDirectory() ||
          now.isSymbolicLink() ||
          JSON.stringify(await snapshot(dest)) !== before
        : now !== null
    ) {
      throw new Error(
        "Destination changed during preparation; installation was cancelled. Retry after local changes are finished.",
      );
    }
    let backup;
    if (existing) {
      backup = join(
        workspace,
        `backup-${Date.now()}-${randomUUID()}`,
        SKILL_NAME,
      );
      await mkdir(dirname(backup));
      await rename(dest, backup);
    }
    try {
      await rename(prepared, dest);
    } catch (error) {
      if (backup) {
        try {
          await rename(backup, dest);
          await rm(dirname(backup), { recursive: true, force: true });
        } catch (rollbackError) {
          throw new Error(
            `Installation failed and automatic restore failed. Previous installation is preserved at ${backup}. Restore it to ${dest}. ${rollbackError.message}`,
            { cause: error },
          );
        }
      }
      throw error;
    }
    log(`Ready: ${dest}`);
    if (backup) log(`Previous installation saved at ${backup}`);
    log(
      "Use $premium-frontend-skill in Codex. Restart Codex if the skill does not appear.",
    );
    return {
      destination: dest,
      version: manifest.version,
      backup: backup || null,
    };
  } finally {
    try {
      if (staging) await rm(staging, { recursive: true, force: true });
    } finally {
      await lock.close();
      await rm(lockPath, { force: true });
    }
  }
}
