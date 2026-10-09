import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { resolve, posix, dirname } from "node:path";
import { createHash } from "node:crypto";
import ts from "typescript";
import { z } from "zod";
import {
  catalogueSchema,
  safePath,
  revision as revisionSchema,
  variantName,
  type Component,
  type Variant,
} from "../registry/schema.js";
import { ROOT, hash } from "../scripts/lib/core.js";
import type { Provider, DiscoverOptions } from "./types.js";

const exec = promisify(execFile);
export const REPOSITORY = "https://github.com/DavidHDev/react-bits";
const RAW = "https://raw.githubusercontent.com/DavidHDev/react-bits";
const roots = {
  "JS-CSS": "content",
  "JS-TW": "tailwind",
  "TS-CSS": "ts-default",
  "TS-TW": "ts-tailwind",
} as const;
const upstreamFile = z
  .object({
    path: safePath,
    type: z.enum([
      "registry:component",
      "registry:file",
      "registry:ui",
      "registry:lib",
      "registry:hook",
    ]),
    content: z.string(),
    target: z.string().optional(),
  })
  .strict();
export const payloadSchema = z
  .object({
    $schema: z.string().optional(),
    name: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.literal("registry:component"),
    dependencies: z.array(z.string()).default([]),
    registryDependencies: z.array(z.string()).default([]),
    files: z.array(upstreamFile).min(1),
  })
  .strict();
const indexSchema = z.object({
  name: z.literal("@react-bits"),
  items: z.array(z.object({ name: z.string(), title: z.string() })).min(1),
});

export function parseInformation(text: string) {
  const source = ts.createSourceFile(
    "Information.js",
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const result = new Map<
    string,
    { name: string; category: string; docsUrl: string; videoUrl: string }
  >();
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        declaration.name.getText(source) !== "componentMetadata" ||
        !declaration.initializer ||
        !ts.isObjectLiteralExpression(declaration.initializer)
      )
        continue;
      for (const item of declaration.initializer.properties) {
        if (
          !ts.isPropertyAssignment(item) ||
          !ts.isObjectLiteralExpression(item.initializer)
        )
          throw new Error("Unsupported component metadata structure");
        const fields: Record<string, string> = {};
        for (const p of item.initializer.properties)
          if (
            ts.isPropertyAssignment(p) &&
            ts.isStringLiteralLike(p.initializer)
          )
            fields[p.name.getText(source).replace(/^['"]|['"]$/g, "")] =
              p.initializer.text;
        const data = z
          .object({
            name: z.string(),
            category: z.enum([
              "Animations",
              "Backgrounds",
              "Components",
              "TextAnimations",
              "Micro",
            ]),
            docsUrl: z.url(),
            videoUrl: z.string(),
          })
          .parse(fields);
        if (
          new URL(data.docsUrl).origin !== "https://reactbits.dev" ||
          result.has(data.name)
        )
          throw new Error("Invalid or duplicate upstream component metadata");
        result.set(data.name, data);
      }
    }
  }
  if (!result.size)
    throw new Error(
      "No componentMetadata object found; upstream format may have changed",
    );
  return result;
}

export function scan(files: z.infer<typeof upstreamFile>[]) {
  const text = files.map((f) => f.content).join("\n");
  const imports = new Set<string>();
  for (const f of files.filter((f) => /\.[jt]sx?$/.test(f.path))) {
    const sf = ts.createSourceFile(
      f.path,
      f.content,
      ts.ScriptTarget.Latest,
      true,
      /tsx$/.test(f.path) ? ts.ScriptKind.TSX : ts.ScriptKind.JSX,
    );
    const visit = (n: ts.Node) => {
      if (
        (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) &&
        n.moduleSpecifier &&
        ts.isStringLiteralLike(n.moduleSpecifier)
      )
        imports.add(n.moduleSpecifier.text);
      if (
        ts.isCallExpression(n) &&
        (n.expression.kind === ts.SyntaxKind.ImportKeyword ||
          n.expression.getText(sf) === "require") &&
        n.arguments[0] &&
        ts.isStringLiteralLike(n.arguments[0])
      )
        imports.add(n.arguments[0].text);
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  const local = [...imports]
    .filter(
      (x) => x.startsWith(".") || x.startsWith("@/") || x.startsWith("~/"),
    )
    .sort();
  const unresolved: string[] = [];
  for (const f of files) {
    const ownImports = [
      ...f.content.matchAll(
        /(?:from\s*|import\s*|import\s*\(|require\s*\()['"]([^'"]+)['"]/g,
      ),
    ]
      .map((x) => x[1])
      .filter(
        (x) => x.startsWith(".") || x.startsWith("@/") || x.startsWith("~/"),
      );
    for (const i of ownImports) {
      const target = posix.normalize(posix.join(posix.dirname(f.path), i));
      if (
        ![
          "",
          ".tsx",
          ".ts",
          ".jsx",
          ".js",
          ".css",
          "/index.tsx",
          "/index.ts",
          "/index.js",
        ].some((ext) => files.some((x) => x.path === target + ext))
      )
        unresolved.push(`${f.path}: ${i}`);
    }
  }
  return {
    method: "static-source-scan" as const,
    clientDirective: /['"]use client['"]/.test(text),
    browserApis: [
      "window",
      "document",
      "IntersectionObserver",
      "ResizeObserver",
      "requestAnimationFrame",
      "matchMedia",
      "WebGLRenderingContext",
      "localStorage",
      "navigator",
    ].filter((x) => new RegExp(`\\b${x}\\b`).test(text)),
    rendering: [
      /<canvas|createElement\(['"]canvas/.test(text) ? "canvas" : "",
      /from ['"](?:three|ogl|@react-three)/.test(text) ? "webgl" : "",
      /<svg/.test(text) ? "svg" : "",
      "dom",
    ].filter(Boolean),
    reducedMotion: /prefers-reduced-motion|useReducedMotion/.test(text)
      ? ("reference-detected" as const)
      : ("unknown" as const),
    localImports: local,
    unresolvedImports: [...new Set(unresolved)].sort(),
    assetReferences: [
      ...new Set(
        [
          ...text.matchAll(
            /(?:url\(|src\s*[:=]\s*|load\(\s*)['"]?((?:https?:\/\/|\/assets\/|\.\.\/|\.\/)[^'"\s)<>}]+)/g,
          ),
        ].map((x) => x[1]),
      ),
    ].sort(),
    peerRequirements: "unknown" as const,
    ssr: "unknown" as const,
    accessibility: "unknown" as const,
  };
}
export const slug = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
export function parsePayload(value: unknown) {
  const p = payloadSchema.parse(value);
  if (new Set(p.files.map((f) => f.path.toLowerCase())).size !== p.files.length)
    throw new Error("Duplicate upstream file paths");
  // Registry target directives are ignored. All files keep relative imports in our isolated destination.
  return p;
}
async function git(cwd: string, args: string[], offline = false) {
  return (
    await exec(
      "git",
      [
        "--no-replace-objects",
        ...(offline ? ["--no-lazy-fetch"] : []),
        "-C",
        cwd,
        ...args,
      ],
      { maxBuffer: 100 * 1024 * 1024 },
    )
  ).stdout;
}
async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
export class ReactBitsProvider implements Provider {
  id = "react-bits";
  constructor(readonly cache = resolve(ROOT, ".cache")) {}
  async discover(options: DiscoverOptions) {
    const repo = resolve(this.cache, "react-bits");
    await mkdir(this.cache, { recursive: true });
    if (!(await exists(resolve(repo, ".git")))) {
      if (options.offline)
        throw new Error("No upstream Git cache; sync requires network");
      await exec(
        "git",
        [
          "clone",
          "--depth",
          "1",
          "--filter=blob:none",
          "--sparse",
          `${REPOSITORY}.git`,
          repo,
        ],
        { maxBuffer: 1024 * 1024 },
      );
      await git(repo, ["sparse-checkout", "set", "public/r", "src/constants"]);
    } else if (!options.offline && !options.revision)
      await git(repo, ["fetch", "--depth", "1", "origin", "main"]);
    const ref = options.revision
      ? revisionSchema.parse(options.revision)
      : options.offline
        ? "HEAD"
        : "origin/main";
    const rev = revisionSchema.parse(
      (await git(repo, ["rev-parse", ref])).trim(),
    );
    const show = (path: string) =>
      git(repo, ["show", `${rev}:${safePath.parse(path)}`], options.offline);
    const [indexText, infoText, licenseText, tree] = await Promise.all([
      show("public/r/registry.json"),
      show("src/constants/Information.js"),
      show("LICENSE.md"),
      git(repo, ["ls-tree", "-r", rev], options.offline),
    ]);
    if (
      !licenseText.includes("MIT + Commons Clause") ||
      !licenseText.includes("redistribute")
    )
      throw new Error("Upstream licence changed; review before indexing");
    const index = indexSchema.parse(JSON.parse(indexText));
    const info = parseInformation(infoText);
    const blobs = new Map(
      tree
        .trim()
        .split("\n")
        .map((line) => {
          const [head, path] = line.split("\t");
          return [path, head.split(" ")[2]];
        }),
    );
    const groups = new Map<string, Component>();
    for (let offset = 0; offset < index.items.length; offset += 16) {
      const batch = await Promise.all(
        index.items.slice(offset, offset + 16).map(async (item) => {
          if (!/^[A-Za-z0-9]+-(JS|TS)-(CSS|TW)$/.test(item.name))
            throw new Error(`Unsupported registry item: ${item.name}`);
          const payloadPath = `public/r/${item.name}.json`;
          const raw = await show(payloadPath);
          const p = parsePayload(JSON.parse(raw));
          if (p.name !== item.name || p.title !== item.title)
            throw new Error(`Manifest mismatch: ${item.name}`);
          const meta = info.get(p.title);
          if (!meta) throw new Error(`Missing metadata: ${p.title}`);
          const variant = variantName.parse(p.name.slice(p.title.length + 1));
          const base = `src/${roots[variant]}/${meta.category}/${meta.name}/`;
          const sourceFiles = [...blobs.keys()].filter((x) =>
            x.startsWith(base),
          );
          const files = p.files.map((f) => {
            const sha1 = createHash("sha1")
              .update(`blob ${Buffer.byteLength(f.content)}\0`)
              .update(f.content)
              .digest("hex");
            const source = sourceFiles.find(
              (path) =>
                blobs.get(path) === sha1 &&
                posix.basename(path) === posix.basename(f.path),
            );
            return {
              path: f.path,
              type: f.type,
              sha256: hash(f.content),
              bytes: Buffer.byteLength(f.content),
              repositoryPath: source ?? "unknown",
            };
          });
          return {
            p,
            meta,
            variant: {
              name: variant,
              upstreamName: p.name,
              payloadPath,
              payloadSha256: hash(raw),
              files,
              dependencies: p.dependencies,
              registryDependencies: p.registryDependencies,
              evidence: scan(p.files),
            },
          };
        }),
      );
      for (const { p, meta, variant } of batch) {
        let component = groups.get(p.title);
        if (!component) {
          component = {
            id: `react-bits:${slug(p.title)}`,
            provider: this.id,
            name: p.title,
            category: meta.category,
            description: p.description,
            documentation: meta.docsUrl,
            preview: meta.videoUrl.startsWith("/assets/video/")
              ? `https://reactbits.dev${meta.videoUrl}`
              : "unknown",
            revision: rev,
            sourceFingerprint: "0".repeat(64),
            checkedDate: options.checkedDate,
            licence: {
              name: "MIT + Commons Clause (custom upstream text)",
              url: `${REPOSITORY}/blob/${rev}/LICENSE.md`,
              path: "LICENSE.md",
              sha256: hash(licenseText),
            },
            provenance: {
              repository: REPOSITORY,
              manifest: "public/r/registry.json",
              metadata: "src/constants/Information.js",
            },
            variants: [],
            annotations: null,
            verification: {
              metadata: "validated",
              enrichment: "unreviewed",
              browser: "unverified",
              evidence: [],
            },
          };
          groups.set(p.title, component);
        }
        component.variants.push(variant);
      }
    }
    for (const c of groups.values()) {
      c.variants.sort((a, b) => a.name.localeCompare(b.name, "en"));
      c.sourceFingerprint = hash(
        JSON.stringify(c.variants.map((v) => [v.name, v.payloadSha256])) +
          c.licence.sha256,
      );
    }
    return catalogueSchema.parse({
      schemaVersion: 1,
      provider: this.id,
      revision: rev,
      checkedDate: options.checkedDate,
      coverage: {
        discoveredItems: index.items.length,
        logicalComponents: groups.size,
        indexedVariants: index.items.length,
        exclusions: [
          "Pro manifest, premium previews and paid content are not indexed.",
          "Site tools, demos and non-registry source directories are outside supported discovery.",
        ],
      },
      components: [...groups.values()].sort((a, b) =>
        a.id.localeCompare(b.id, "en"),
      ),
    });
  }
  async pinned(
    path: string,
    rev: string,
    expectedHash: string,
    offline = false,
  ): Promise<Buffer> {
    safePath.parse(path);
    revisionSchema.parse(rev);
    if (
      !(
        path === "LICENSE.md" ||
        /^public\/r\/[A-Za-z0-9]+-(JS|TS)-(CSS|TW)\.json$/.test(path)
      )
    )
      throw new Error("Source location is not allowlisted");
    const cachePath = resolve(this.cache, "downloads", rev, path);
    let data: Buffer | undefined;
    if (await exists(cachePath)) data = await readFile(cachePath);
    if (!data && (await exists(resolve(this.cache, "react-bits/.git")))) {
      try {
        data = Buffer.from(
          await git(
            resolve(this.cache, "react-bits"),
            ["show", `${rev}:${path}`],
            true,
          ),
        );
      } catch {
        /* A shallow cache may not contain this pinned revision. */
      }
    }
    if (!data) {
      if (offline) throw new Error(`Uncached source: ${path}; retry online`);
      const response = await fetch(`${RAW}/${rev}/${path}`, {
        redirect: "error",
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok)
        throw new Error(`Source download failed (${response.status}): ${path}`);
      if (Number(response.headers.get("content-length")) > 8 * 1024 * 1024)
        throw new Error("Source exceeds size limit");
      const reader = response.body!.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 8 * 1024 * 1024) {
          await reader.cancel();
          throw new Error("Source exceeds size limit");
        }
        chunks.push(value);
      }
      data = Buffer.concat(chunks);
    }
    if (hash(data) !== expectedHash)
      throw new Error(
        `Source hash mismatch: ${path}. Refusing a different revision or modified cache.`,
      );
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, data);
    return data;
  }
  async retrieve(component: Component, variant: Variant, offline = false) {
    if (
      component.provider !== this.id ||
      component.provenance.repository !== REPOSITORY ||
      variant.payloadPath !== `public/r/${component.name}-${variant.name}.json`
    )
      throw new Error("Source provenance mismatch");
    const data = await this.pinned(
      variant.payloadPath,
      component.revision,
      variant.payloadSha256,
      offline,
    );
    const payload = parsePayload(JSON.parse(data.toString("utf8")));
    if (
      payload.name !== variant.upstreamName ||
      payload.files.length !== variant.files.length
    )
      throw new Error("Payload does not match catalogue");
    const files = payload.files.map((f) => {
      const recorded = variant.files.find((x) => x.path === f.path);
      if (!recorded || hash(f.content) !== recorded.sha256)
        throw new Error(`Source file hash mismatch: ${f.path}`);
      return {
        path: f.path,
        content: Buffer.from(f.content),
        sha256: recorded.sha256,
      };
    });
    const licence = await this.pinned(
      component.licence.path,
      component.revision,
      component.licence.sha256,
      offline,
    );
    return [
      ...files,
      { path: "__LICENSE.md", content: licence, sha256: hash(licence) },
    ];
  }
}
