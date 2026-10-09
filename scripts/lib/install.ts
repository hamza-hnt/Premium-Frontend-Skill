import { randomUUID } from "node:crypto";
import {
  access,
  lstat,
  realpath,
  readFile,
  writeFile,
  mkdir,
  rm,
  rename,
} from "node:fs/promises";
import { resolve, join, dirname, relative, sep } from "node:path";
import { z } from "zod";
import semver from "semver";
import ts from "typescript";
import {
  safePath,
  sha256,
  revision,
  type Component,
  type Variant,
} from "../../registry/schema.js";
import type { Provider } from "../../providers/types.js";
import { hash, json } from "./core.js";

const MANIFEST = ".premium-frontend/manifest.json";
const manifestSchema = z
  .object({
    version: z.literal(1),
    installations: z.record(
      z.string(),
      z
        .object({
          id: z.string(),
          variant: z.string(),
          revision,
          sourceFingerprint: sha256,
          files: z.array(z.object({ path: safePath, sha256 })),
          licence: z.string(),
        })
        .strict(),
    ),
  })
  .strict();
type Manifest = z.infer<typeof manifestSchema>;
async function exists(path: string) {
  try {
    await lstat(path);
    return true;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw e;
  }
}
export async function safeDestination(project: string, path: string) {
  safePath.parse(path);
  const target = resolve(project, path);
  if (!target.startsWith(project + sep))
    throw new Error("Path escapes requested project");
  let current = project;
  for (const part of path.split("/")) {
    current = join(current, part);
    if (await exists(current)) {
      const s = await lstat(current);
      if (s.isSymbolicLink())
        throw new Error(`Symlink destination refused: ${path}`);
      if (current !== target && !s.isDirectory())
        throw new Error(`Non-directory parent: ${path}`);
    }
  }
  return target;
}
async function digestIfExists(path: string) {
  return (await exists(path)) ? hash(await readFile(path)) : null;
}
export async function inspectProject(input: string) {
  const project = await realpath(resolve(input));
  const pkgPath = await safeDestination(project, "package.json");
  const packageText = await readFile(pkgPath, "utf8");
  const pkg = z
    .object({
      dependencies: z.record(z.string(), z.string()).optional(),
      devDependencies: z.record(z.string(), z.string()).optional(),
      packageManager: z.string().optional(),
    })
    .passthrough()
    .parse(JSON.parse(packageText));
  const deps = { ...pkg.devDependencies, ...pkg.dependencies };
  if (!deps.react)
    throw new Error(
      "Target must declare React; create or inspect the application first",
    );
  const managers: Record<string, string> = {
    "package-lock.json": "npm",
    "pnpm-lock.yaml": "pnpm",
    "yarn.lock": "yarn",
    "bun.lock": "bun",
    "bun.lockb": "bun",
  };
  const found = new Set<string>();
  for (const [file, manager] of Object.entries(managers))
    if (await exists(resolve(project, file))) found.add(manager);
  const declared = pkg.packageManager?.split("@")[0];
  if (declared && !["npm", "pnpm", "yarn", "bun"].includes(declared))
    throw new Error(`Unsupported package manager: ${declared}`);
  if (found.size > 1 || (declared && found.size && !found.has(declared)))
    throw new Error(
      "Conflicting package manager declarations/lockfiles; resolve before installation",
    );
  let aliases: unknown = "unknown";
  let typescript = false;
  for (const name of ["tsconfig.json", "jsconfig.json"])
    if (await exists(resolve(project, name))) {
      const configPath = await safeDestination(project, name);
      const result = ts.parseConfigFileTextToJson(
        name,
        await readFile(configPath, "utf8"),
      );
      if (result.error) throw new Error(`Cannot parse ${name}`);
      aliases = result.config?.compilerOptions?.paths ?? "unknown";
      if (name === "tsconfig.json") typescript = true;
    }
  const src = await exists(resolve(project, "src"));
  const defaultDir = (await exists(
    resolve(project, src ? "src/components" : "components"),
  ))
    ? src
      ? "src/components"
      : "components"
    : src
      ? "src/components"
      : "components";
  return {
    project,
    packageHash: hash(packageText),
    packageManager: declared ?? [...found][0] ?? "npm",
    dependencies: deps,
    framework: deps.next ? "Next.js" : deps.vite ? "Vite" : "unknown",
    react: deps.react,
    frameworkVersion: deps.next ?? deps.vite ?? "unknown",
    typescript,
    tailwind: Boolean(deps.tailwindcss),
    aliases,
    defaultDir,
    styling: deps.tailwindcss
      ? `Tailwind ${deps.tailwindcss}`
      : "CSS / existing styles",
  };
}
export interface InstallOptions {
  project: string;
  variant?: string;
  dir?: string;
}
export async function planInstallation(
  component: Component,
  options: InstallOptions,
) {
  const projectInfo = await inspectProject(options.project);
  const { project } = projectInfo;
  const preferred = `${projectInfo.typescript ? "TS" : "JS"}-${projectInfo.tailwind ? "TW" : "CSS"}`;
  const variant = component.variants.find(
    (v) => v.name === (options.variant ?? preferred),
  );
  if (!variant)
    throw new Error(`Variant ${options.variant ?? preferred} is unavailable`);
  if (variant.name.endsWith("TW") && !projectInfo.tailwind)
    throw new Error(
      "Tailwind variant requires an existing Tailwind setup; select a CSS variant",
    );
  if (variant.name.startsWith("TS") && !projectInfo.typescript)
    throw new Error(
      "TypeScript variant requires an existing tsconfig.json; select a JS variant",
    );
  const dir = safePath.parse(
    options.dir ?? `${projectInfo.defaultDir}/react-bits`,
  );
  if (
    dir
      .split("/")
      .some((p) => p.startsWith(".") || ["node_modules", "public"].includes(p))
  )
    throw new Error(
      "Choose a source component directory, not a hidden, dependency, or public directory",
    );
  const prefix = `${dir}/${component.name}`;
  const files = variant.files.map((f) => ({
    sourcePath: f.path,
    path: `${prefix}/${f.path.startsWith(component.name + "/") ? f.path.slice(component.name.length + 1) : f.path}`,
    sha256: f.sha256,
    action: "create" as "create" | "unchanged",
  }));
  files.push({
    sourcePath: "__LICENSE.md",
    path: `.premium-frontend/licences/react-bits-${component.revision}.md`,
    sha256: component.licence.sha256,
    action: "create",
  });
  const manifestPath = await safeDestination(project, MANIFEST);
  const manifestHash = await digestIfExists(manifestPath);
  const manifest: Manifest = manifestHash
    ? manifestSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")))
    : { version: 1, installations: {} };
  const existing = manifest.installations[component.id];
  const conflicts: string[] = [];
  if (
    existing &&
    (existing.variant !== variant.name ||
      existing.revision !== component.revision ||
      existing.sourceFingerprint !== component.sourceFingerprint)
  )
    conflicts.push(
      "A different revision or variant is already installed. Reconcile it manually; automatic upgrades are disabled.",
    );
  if (
    existing &&
    json(existing.files.map((f) => f.path).sort()) !==
      json(files.map((f) => f.path).sort())
  )
    conflicts.push(
      "The recorded installation uses a different destination. Keep the original --dir or reconcile manually.",
    );
  for (const f of files) {
    const dest = await safeDestination(project, f.path);
    if (await exists(dest)) {
      const owned =
        existing?.files.some(
          (old) => old.path === f.path && old.sha256 === f.sha256,
        ) ||
        (f.sourcePath === "__LICENSE.md" &&
          Object.values(manifest.installations).some((i) =>
            i.files.some(
              (old) => old.path === f.path && old.sha256 === f.sha256,
            ),
          ));
      if (
        owned &&
        (await lstat(dest)).isFile() &&
        hash(await readFile(dest)) === f.sha256
      )
        f.action = "unchanged";
      else conflicts.push(`File collision or local edit: ${f.path}`);
    }
  }
  if (variant.registryDependencies.length)
    conflicts.push(
      "Upstream registry dependencies require manual resolution; no partial source install allowed.",
    );
  if (variant.evidence.unresolvedImports.length)
    conflicts.push(
      `Unresolved source imports: ${variant.evidence.unresolvedImports.join(", ")}`,
    );
  const missing: string[] = [];
  const dependencies = variant.dependencies.map((spec) => {
    const match = /^(@[a-z0-9._-]+\/[a-z0-9._-]+|[a-z0-9._-]+)@(.+)$/i.exec(
      spec,
    );
    if (!match || !semver.validRange(match[2]))
      throw new Error(`Unsupported dependency spec: ${spec}`);
    const [, name, range] = match;
    const current = projectInfo.dependencies[name];
    if (!current) missing.push(spec);
    else if (!semver.validRange(current) || !semver.intersects(current, range))
      conflicts.push(
        `Dependency conflict: ${name} declares ${current}, upstream requests ${range}`,
      );
    return {
      name,
      required: range,
      declared: current ?? "missing",
      compatibility: current
        ? "range check only; installed peer tree must be checked"
        : "not installed",
    };
  });
  const manager = projectInfo.packageManager;
  const dependencyCommand = missing.length
    ? [manager, manager === "npm" ? "install" : "add", ...missing]
    : [];
  return {
    component,
    variant,
    manifest,
    manifestHash,
    projectInfo,
    files,
    conflicts,
    dependencies,
    dependencyCommand,
    configurationChanges: [] as string[],
    status:
      existing &&
      files.every((f) => f.action === "unchanged") &&
      !conflicts.length
        ? "already-installed"
        : "planned",
    caveats: [
      "Dependencies are reported, never installed by this command. Run the shown argv with the target package manager, then validate peers/build.",
      "Tailwind detection checks the dependency declaration, not whether the CSS pipeline is configured.",
      "Aliases are inspected but not rewritten. Upstream target directives are ignored.",
      "Remote and dynamic asset references require review; static source scanning is not a complete dependency analysis.",
      "Application-specific SSR, keyboard, contrast and reduced-motion behavior require rendered checks.",
    ],
    assets: variant.evidence.assetReferences,
    provenance: {
      provider: component.provider,
      revision: component.revision,
      payloadSha256: variant.payloadSha256,
      licence: component.licence.url,
    },
    dependencyChangesMade: false,
  };
}
export function publicPlan(plan: Awaited<ReturnType<typeof planInstallation>>) {
  const { component, variant, manifest, manifestHash, ...rest } = plan;
  return { id: component.id, variant: variant.name, ...rest };
}
export async function applyInstallation(
  provider: Provider,
  component: Component,
  options: InstallOptions,
  offline = false,
  write = writeFile,
) {
  const plan = await planInstallation(component, options);
  if (plan.conflicts.length)
    throw new Error(`No files written: ${plan.conflicts.join("; ")}`);
  if (plan.status === "already-installed") return publicPlan(plan);
  // Download and verify all bytes before creating any target files.
  const retrieved = await provider.retrieve(component, plan.variant, offline);
  const staged = new Map(retrieved.map((f) => [f.path, f.content]));
  for (const f of plan.files)
    if (
      !staged.has(f.sourcePath) ||
      hash(staged.get(f.sourcePath)!) !== f.sha256
    )
      throw new Error(`Incomplete or invalid staged source: ${f.sourcePath}`);
  const root = plan.projectInfo.project;
  await safeDestination(root, ".premium-frontend/install.lock");
  await mkdir(resolve(root, ".premium-frontend"), { recursive: true });
  const lock = await safeDestination(root, ".premium-frontend/install.lock");
  await writeFile(lock, String(process.pid), { flag: "wx" }).catch(() => {
    throw new Error(
      "Another installation may be running (.premium-frontend/install.lock). No source files written.",
    );
  });
  const created: string[] = [];
  const tmp = resolve(root, `.premium-frontend/manifest-${randomUUID()}.tmp`);
  let tmpCreated = false;
  try {
    await safeDestination(root, relative(root, tmp).split(sep).join("/"));
    if (
      (await digestIfExists(await safeDestination(root, MANIFEST))) !==
        plan.manifestHash ||
      hash(await readFile(await safeDestination(root, "package.json"))) !==
        plan.projectInfo.packageHash
    )
      throw new Error("Project changed after planning; retry the dry run");
    for (const f of plan.files) {
      const path = await safeDestination(root, f.path);
      if (f.action === "unchanged") {
        if (hash(await readFile(path)) !== f.sha256)
          throw new Error(`File changed after planning: ${f.path}`);
        continue;
      }
      await mkdir(dirname(path), { recursive: true });
      await safeDestination(root, f.path);
      // Exclusive creation cannot clobber files created since the plan.
      const handle = await import("node:fs/promises").then((fs) =>
        fs.open(path, "wx"),
      );
      created.push(path);
      try {
        await write(handle, staged.get(f.sourcePath)!);
      } finally {
        await handle.close();
      }
    }
    plan.manifest.installations[component.id] = {
      id: component.id,
      variant: plan.variant.name,
      revision: component.revision,
      sourceFingerprint: component.sourceFingerprint,
      files: plan.files.map(({ path, sha256 }) => ({ path, sha256 })),
      licence: component.licence.url,
    };
    await writeFile(tmp, json(manifestSchema.parse(plan.manifest)), {
      flag: "wx",
    });
    tmpCreated = true;
    if (
      (await digestIfExists(await safeDestination(root, MANIFEST))) !==
      plan.manifestHash
    )
      throw new Error("Manifest changed during installation");
    await rename(tmp, await safeDestination(root, MANIFEST));
    return { ...publicPlan(plan), status: "installed" };
  } catch (e) {
    const failures: string[] = [];
    for (const path of created.reverse()) {
      try {
        await rm(path);
      } catch {
        failures.push(relative(root, path));
      }
    }
    throw new Error(
      `Installation failed: ${(e as Error).message}. ${failures.length ? `Partial rollback; inspect these files: ${failures.join(", ")}` : "Created source files rolled back."} No dependency changes were made.`,
    );
  } finally {
    if (tmpCreated) await rm(tmp, { force: true });
    await rm(lock, { force: true });
  }
}
