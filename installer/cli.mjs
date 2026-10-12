#!/usr/bin/env node
import { dirname, join } from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { installSkill } from "./install.mjs";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const HELP = `Premium Frontend Skill installer

Usage:
  premium-frontend-skill [install] [--dest <directory>] [--update]
  premium-frontend-skill --help
  premium-frontend-skill --version

Options:
  --dest <directory>  Full destination folder (supports ~/)
  --update            Replace an existing copy after validation; keep a backup
  --help              Show this help
  --version           Show the packaged skill version

Default: $CODEX_HOME/skills/premium-frontend-skill
         or ~/.codex/skills/premium-frontend-skill

Requires Node.js >=22.12.0 and <27, npm, and internet for dependencies.
`;

try {
  const args = process.argv.slice(2);
  if (args.length === 1 && ["--help", "-h"].includes(args[0]))
    console.log(HELP);
  else if (args.length === 1 && ["--version", "-v"].includes(args[0])) {
    console.log(
      JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"))
        .version,
    );
  } else {
    if (args[0] === "install") args.shift();
    let destination;
    let update = false;
    while (args.length) {
      const arg = args.shift();
      if (arg === "--update" && !update) update = true;
      else if (arg === "--dest" && destination === undefined) {
        destination = args.shift();
        if (!destination || destination.startsWith("--"))
          throw new Error("--dest needs a directory path.");
      } else
        throw new Error(
          `Unknown or repeated argument: ${arg}. Use --help for usage.`,
        );
    }
    await installSkill({ packageRoot, destination, update });
  }
} catch (error) {
  console.error(`Installation failed: ${error.message}`);
  process.exitCode = 1;
}
