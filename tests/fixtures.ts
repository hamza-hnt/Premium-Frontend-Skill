import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { ReactBitsProvider } from "../providers/react-bits.js";
import { hash, json } from "../scripts/lib/core.js";
import type { Annotation, Catalogue, Component } from "../registry/schema.js";
import type { Provider } from "../providers/types.js";

export const code =
  "export default function Sample(){ return <div>Sample</div>; }\n";
export const css = ".sample { color: black; }\n";
export const notice = "Test fixture notice. This is original test content.\n";
export const annotations: Annotation = {
  tags: ["subtle", "text", "reveal"],
  suitable: ["Short hero text"],
  unsuitable: ["Dense tables"],
  selection: "Select a short reveal.",
  integration: ["Keep semantic headings."],
  accessibility: ["Provide stable text."],
  reducedMotion: "Static fallback.",
  performance: { risk: "low", basis: "estimate", reason: "Small DOM effect." },
};
export function component(): Component {
  const rev = "a".repeat(40);
  return {
    id: "react-bits:sample",
    provider: "react-bits",
    name: "Sample",
    category: "TextAnimations",
    description: "A subtle text reveal.",
    documentation: "https://reactbits.dev/text-animations/sample",
    preview: "unknown",
    revision: rev,
    sourceFingerprint: hash(code),
    checkedDate: "2026-10-10",
    licence: {
      name: "Test licence",
      url: `https://github.com/DavidHDev/react-bits/blob/${rev}/LICENSE.md`,
      path: "LICENSE.md",
      sha256: hash(notice),
    },
    provenance: {
      repository: "https://github.com/DavidHDev/react-bits",
      manifest: "public/r/registry.json",
      metadata: "src/constants/Information.js",
    },
    annotations: null,
    verification: {
      metadata: "validated",
      enrichment: "unreviewed",
      browser: "unverified",
      evidence: [],
    },
    variants: [
      {
        name: "TS-CSS",
        upstreamName: "Sample-TS-CSS",
        payloadPath: "public/r/Sample-TS-CSS.json",
        payloadSha256: hash("payload"),
        files: [
          {
            path: "Sample/Sample.tsx",
            type: "registry:component",
            sha256: hash(code),
            bytes: Buffer.byteLength(code),
            repositoryPath: "src/ts-default/TextAnimations/Sample/Sample.tsx",
          },
          {
            path: "Sample/Sample.css",
            type: "registry:file",
            sha256: hash(css),
            bytes: Buffer.byteLength(css),
            repositoryPath: "src/ts-default/TextAnimations/Sample/Sample.css",
          },
        ],
        dependencies: ["motion@^12.0.0"],
        registryDependencies: [],
        evidence: {
          method: "static-source-scan",
          clientDirective: false,
          browserApis: [],
          rendering: ["dom"],
          reducedMotion: "unknown",
          localImports: [],
          unresolvedImports: [],
          assetReferences: [],
          peerRequirements: "unknown",
          ssr: "unknown",
          accessibility: "unknown",
        },
      },
    ],
  };
}
export function catalogue(c = component()): Catalogue {
  return {
    schemaVersion: 1,
    provider: "react-bits",
    revision: c.revision,
    checkedDate: c.checkedDate,
    coverage: {
      discoveredItems: 1,
      logicalComponents: 1,
      indexedVariants: 1,
      exclusions: [],
    },
    components: [c],
  };
}
export function provider(c = catalogue()): Provider {
  return {
    id: "react-bits",
    discover: async () => structuredClone(c),
    retrieve: async () => [
      {
        path: "Sample/Sample.tsx",
        content: Buffer.from(code),
        sha256: hash(code),
      },
      {
        path: "Sample/Sample.css",
        content: Buffer.from(css),
        sha256: hash(css),
      },
      {
        path: "__LICENSE.md",
        content: Buffer.from(notice),
        sha256: hash(notice),
      },
    ],
  };
}
export async function consumer(
  deps: Record<string, string> = { react: "^19.0.0" },
) {
  const dir = await mkdtemp(join(tmpdir(), "premium-skill-test-"));
  await writeFile(join(dir, "package.json"), json({ dependencies: deps }));
  await writeFile(
    join(dir, "tsconfig.json"),
    '{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
  );
  await mkdir(join(dir, "src"));
  return dir;
}
export async function upstreamFixture() {
  const cache = await mkdtemp(join(tmpdir(), "premium-upstream-test-"));
  const repo = join(cache, "react-bits");
  await mkdir(join(repo, "public/r"), { recursive: true });
  await mkdir(join(repo, "src/constants"), { recursive: true });
  await mkdir(join(repo, "src/ts-default/TextAnimations/Sample"), {
    recursive: true,
  });
  await writeFile(
    join(repo, "src/ts-default/TextAnimations/Sample/Sample.tsx"),
    code,
  );
  await writeFile(
    join(repo, "src/constants/Information.js"),
    "export const componentMetadata = {'TextAnimations/Sample': {name:'Sample',category:'TextAnimations',docsUrl:'https://reactbits.dev/text-animations/sample',videoUrl:'/assets/video/sample.webm'}};",
  );
  await writeFile(
    join(repo, "LICENSE.md"),
    "MIT + Commons Clause test fixture; do not redistribute.",
  );
  const payload = {
    name: "Sample-TS-CSS",
    title: "Sample",
    description: "A fixture.",
    type: "registry:component",
    dependencies: [],
    registryDependencies: [],
    files: [
      { path: "Sample/Sample.tsx", type: "registry:component", content: code },
    ],
  };
  await writeFile(join(repo, "public/r/Sample-TS-CSS.json"), json(payload));
  await writeFile(
    join(repo, "public/r/registry.json"),
    json({
      name: "@react-bits",
      items: [{ name: payload.name, title: payload.title }],
    }),
  );
  for (const args of [
    ["init", "-q"],
    ["add", "."],
    [
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "commit",
      "-qm",
      "Controlled fixture",
    ],
  ])
    execFileSync("git", args, { cwd: repo });
  return { cache, repo, adapter: new ReactBitsProvider(cache) };
}
