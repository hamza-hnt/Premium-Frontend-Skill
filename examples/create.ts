import { mkdir, cp, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import {
  args,
  cli,
  componentById,
  json,
  readCatalogue,
  ROOT,
} from "../scripts/lib/core.js";
import { applyInstallation } from "../scripts/lib/install.js";
import { ReactBitsProvider } from "../providers/react-bits.js";

await cli(async () => {
  const a = args(["kind", "project"], ["offline"]);
  const kind = a.kind ?? "vite";
  if (kind !== "vite" && kind !== "next")
    throw new Error("--kind must be vite or next");
  const project = resolve(
    (a.project as string) ?? resolve(ROOT, ".local", `${kind}-consumer`),
  );
  let exists = false;
  try {
    await access(project);
    exists = true;
  } catch {}
  if (exists)
    throw new Error(`Refusing to replace existing project: ${project}`);
  await mkdir(project, { recursive: true });
  await cp(resolve(ROOT, "examples/templates", kind), project, {
    recursive: true,
  });
  const dependencies: Record<string, string> = {
    react: "19.3.0",
    "react-dom": "19.3.0",
    tailwindcss: "4.3.3",
    motion: "12.23.12",
  };
  const devDependencies: Record<string, string> = {
    typescript: "5.9.3",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "@types/node": "22.19.15",
  };
  if (kind === "vite") {
    Object.assign(dependencies, { gsap: "3.13.0" });
    Object.assign(devDependencies, {
      vite: "8.3.4",
      "@vitejs/plugin-react": "6.1.2",
      "@tailwindcss/vite": "4.3.3",
    });
  } else {
    dependencies.next = "16.4.0";
    devDependencies["@tailwindcss/postcss"] = "4.3.3";
  }
  const scripts =
    kind === "vite"
      ? {
          dev: "vite",
          build: "tsc --noEmit && vite build",
          preview: "vite preview --host 127.0.0.1",
        }
      : {
          dev: "next dev --hostname 127.0.0.1",
          build: "next build",
          start: "next start --hostname 127.0.0.1",
        };
  await writeFile(
    resolve(project, "package.json"),
    json({
      name: `premium-skill-${kind}-consumer`,
      version: "1.0.0",
      private: true,
      type: "module",
      scripts,
      dependencies,
      devDependencies,
    }),
  );
  await cp(
    resolve(ROOT, "examples/locks", `${kind}-package-lock.json`),
    resolve(project, "package-lock.json"),
  );
  await writeFile(
    resolve(project, "tsconfig.json"),
    json({
      compilerOptions: {
        target: "ES2022",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "react-jsx",
        ...(kind === "next"
          ? { incremental: true, plugins: [{ name: "next" }] }
          : {}),
      },
      include:
        kind === "vite"
          ? ["src", "vite.config.ts"]
          : ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    }),
  );
  await writeFile(
    resolve(project, ".gitignore"),
    "node_modules/\ndist/\n.next/\n.premium-frontend/\nsrc/components/react-bits/\ncomponents/react-bits/\n*.tsbuildinfo\n",
  );
  const ids =
    kind === "vite"
      ? [
          "blur-text",
          "count-up",
          "fade-content",
          "spotlight-card",
          "shape-grid",
          "squish-switch",
        ]
      : ["blur-text", "spotlight-card", "squish-switch"];
  const catalogue = await readCatalogue();
  const provider = new ReactBitsProvider();
  for (const id of ids)
    await applyInstallation(
      provider,
      componentById(catalogue, `react-bits:${id}`),
      { project, variant: "TS-TW" },
      Boolean(a.offline),
    );
  await writeFile(
    resolve(project, "BRIEF.md"),
    await import("node:fs/promises").then((fs) =>
      fs.readFile(resolve(ROOT, "examples/briefs.md"), "utf8"),
    ),
  );
  console.log(
    json({
      project,
      components: ids,
      revision: catalogue.revision,
      nextSteps: [
        `cd "${project}" && npm ci`,
        `npm --prefix "${project}" run build`,
        `npm --prefix "${project}" run dev`,
      ],
      upstreamSource:
        "Local and ignored; no publication or deployment performed.",
    }),
  );
});
