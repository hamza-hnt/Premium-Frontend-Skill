import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { bundle } from "./lib/bundle.js";
import { cli, json, ROOT } from "./lib/core.js";
const exec = promisify(execFile);
await cli(async () => {
  const scratch = await mkdtemp(join(tmpdir(), "premium-external-consumer-"));
  try {
    const archive = resolve(scratch, "skill.tar.gz");
    await bundle(archive);
    const install = resolve(scratch, "installed");
    await mkdir(install);
    await exec("tar", ["-xzf", archive, "-C", install]);
    const skill = resolve(install, "premium-frontend-skill");
    await exec("npm", ["ci"], { cwd: skill, maxBuffer: 2 * 1024 * 1024 });
    const target = resolve(scratch, "consumer");
    await mkdir(target);
    const execute = (script: string, params: string[]) =>
      exec(
        process.execPath,
        [
          resolve(skill, "node_modules/tsx/dist/cli.mjs"),
          resolve(skill, "scripts", script),
          ...params,
        ],
        { cwd: target, maxBuffer: 2 * 1024 * 1024 },
      );
    const search = JSON.parse(
      (await execute("search.ts", ["--query", "subtle text reveal", "--json"]))
        .stdout,
    );
    if (search.results[0].id !== "react-bits:blur-text")
      throw new Error("External search failed");
    const inspected = JSON.parse(
      (await execute("inspect.ts", ["--id", "react-bits:blur-text", "--json"]))
        .stdout,
    );
    if (inspected.id !== "react-bits:blur-text")
      throw new Error("External inspection failed");
    await writeFile(
      resolve(target, "package.json"),
      json({
        name: "separate-consumer",
        private: true,
        type: "module",
        dependencies: {
          react: "19.3.0",
          "react-dom": "19.3.0",
          motion: "12.23.12",
          tailwindcss: "4.3.3",
        },
        devDependencies: {
          typescript: "5.9.3",
          "@types/react": "19.2.14",
          "@types/react-dom": "19.2.3",
        },
      }),
    );
    await writeFile(
      resolve(target, "tsconfig.json"),
      json({
        compilerOptions: {
          jsx: "react-jsx",
          strict: true,
          noEmit: true,
          target: "ES2022",
          lib: ["ES2022", "DOM"],
          module: "ESNext",
          moduleResolution: "bundler",
          skipLibCheck: true,
          esModuleInterop: true,
        },
        include: ["components/**/*.tsx", "app.tsx"],
      }),
    );
    const params = [
      "--id",
      "react-bits:blur-text",
      "--project",
      target,
      "--variant",
      "TS-TW",
    ];
    const plan = JSON.parse(
      (await execute("install.ts", [...params, "--dry-run"])).stdout,
    );
    if (plan.conflicts.length) throw new Error("Unexpected external collision");
    const applied = JSON.parse(
      (await execute("install.ts", [...params, "--apply"])).stdout,
    );
    const repeated = JSON.parse(
      (await execute("install.ts", [...params, "--apply", "--offline"])).stdout,
    );
    if (
      applied.status !== "installed" ||
      repeated.status !== "already-installed"
    )
      throw new Error("External install/repeat failed");
    await writeFile(
      resolve(target, "app.tsx"),
      `import BlurText from './components/react-bits/BlurText/BlurText';\nexport default function App(){return <main><h1>Separate consumer</h1><BlurText text="An actual pinned source integration"/></main>;}\n`,
    );
    await exec("npm", ["install"], { cwd: target, maxBuffer: 2 * 1024 * 1024 });
    await exec(
      process.execPath,
      [resolve(target, "node_modules/typescript/bin/tsc"), "--noEmit"],
      { cwd: target },
    );
    const manifest = JSON.parse(
      await readFile(
        resolve(target, ".premium-frontend/manifest.json"),
        "utf8",
      ),
    );
    const report = {
      checkedAt: new Date().toISOString(),
      node: process.version,
      passed: true,
      externalWorkingDirectory: true,
      installedFrom: "allowlisted local archive, fresh npm ci",
      searchFirst: search.results[0].id,
      inspect: "passed",
      sourceTransport:
        "fresh pinned HTTPS retrieval (no shared Git/download cache)",
      apply: applied.status,
      repeat: repeated.status,
      typecheck: "passed",
      files: manifest.installations["react-bits:blur-text"].files,
      hostAutoDiscovery: "not exercised; explicit absolute script invocation",
    };
    await mkdir(resolve(ROOT, "artifacts"), { recursive: true });
    await writeFile(
      resolve(ROOT, "artifacts/consumer-report.json"),
      json(report),
    );
    console.log(json(report));
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
});
