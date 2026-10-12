import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { buildInstaller } from "./lib/installer-package.js";
import { cli } from "./lib/core.js";

await cli(async () => {
  const { directory } = await buildInstaller();
  const child = spawn(
    process.execPath,
    [resolve(directory, "cli.mjs"), ...process.argv.slice(2)],
    { stdio: "inherit", shell: false },
  );
  process.exitCode = await new Promise<number>((accept, reject) => {
    child.on("error", reject);
    child.on("exit", (code) => accept(code ?? 1));
  });
});
