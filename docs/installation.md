# Setup and local skill installation

Supported tooling runtime: **Node.js 22.12+ below 27**, with npm and Git (tested with 2.55.0; offline Git reads require `--no-lazy-fetch`). `.nvmrc` selects Node 22.14.0. Runtime support claims and exact versions tested are detailed in the verification report. The lockfile pins the skill's dependencies. TypeScript 5.9.3 is intentionally pinned for its stable AST API.

```bash
cd premium-frontend-skill
npm ci
npm run validate
npm test
```

No API keys, paid access, shadcn initialization or global agent configuration is required. The consuming agent supplies design judgment.

## Codex local discovery

The [current official instructions](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills) list repository `.agents/skills` and user `~/.agents/skills` locations and support symlinked skill folders. These commands use repository-local discovery. They are instructions to run when installing, not modifications performed automatically by the build.

Set both paths to actual locations on your machine:

```bash
SKILL_ROOT="/Users/hamza/Desktop/Personal/BuildingSkills/premium-frontend-skill"
TARGET_PROJECT="/absolute/path/to/your/react-app"
(cd "$SKILL_ROOT" && npm ci)
mkdir -p "$TARGET_PROJECT/.agents/skills"
ln -s "$SKILL_ROOT" "$TARGET_PROJECT/.agents/skills/premium-frontend-skill"
```

Do not overwrite an existing skill of the same name. The symlink includes the **entire installed skill**: scripts, providers, schema, catalogue, annotations, references, package manifest, lockfile and local tooling. Copying only `SKILL.md` cannot work. For a portable copy without caches, use the tested local bundler:

```bash
npm --prefix "$SKILL_ROOT" run skill:bundle -- --output "$SKILL_ROOT/artifacts/premium-frontend-skill.tar.gz"
```

Extract into a chosen `.agents/skills` directory; the archive contains one `premium-frontend-skill` directory. Run `npm ci` from inside that extracted directory. `node_modules`, caches, generated applications, screenshots and upstream code are excluded. This creates a local archive, never publishes it. Codex discovers local changes; restart if it does not appear. Invoke `$premium-frontend-skill` in Codex CLI/IDE, or explicitly ask the agent to use the skill at its absolute path. Host discovery itself was documented from official instructions; see the report for the extent of local host testing.

## Ordinary use from another project

```bash
SKILL_ROOT="/Users/hamza/Desktop/Personal/BuildingSkills/premium-frontend-skill"
TARGET_PROJECT="$(pwd)"
npm --prefix "$SKILL_ROOT" run components:search -- --query "subtle text reveal" --limit 5 --json
npm --prefix "$SKILL_ROOT" run components:search -- --query "settings switch" --category Micro --curated --max-risk low --json
npm --prefix "$SKILL_ROOT" run components:inspect -- --id react-bits:blur-text --json
npm --prefix "$SKILL_ROOT" run components:install -- --id react-bits:blur-text --project "$TARGET_PROJECT" --dry-run
npm --prefix "$SKILL_ROOT" run components:install -- --id react-bits:blur-text --project "$TARGET_PROJECT" --apply
```

`--variant TS-TW` chooses an explicit variant. The default follows detected TypeScript and Tailwind declarations. `--dir src/ui/react-bits` selects a project-relative component destination. `--offline` permits only cached source on apply. The install command prints JSON for both readable inspection and machine use; search and inspect support text or `--json`. For pure JSON stdout use npm's `--silent` option if your npm version prints script banners to stdout. Errors are JSON on stderr with a nonzero exit. Dry-run conflicts exit with code 2; invalid commands and apply failures exit with code 1.

The plan includes a dependency command represented as an argv array. Execute it in the target project using its package manager after review. The installer does not modify dependencies or config. This avoids half-rolled-back package manager operations and respects npm, pnpm, Yarn and Bun independently of this skill's npm setup. Target manager detection is tested with controlled fixtures; only npm live integration is claimed.

Examples using the generated fixture:

```bash
npm --prefix "$SKILL_ROOT" run components:install -- --id react-bits:shape-grid --project "$SKILL_ROOT/.local/vite-consumer" --variant TS-TW --dry-run
```

## Sync

```bash
npm run registry:sync -- --provider react-bits
# Reproduce the initial source snapshot from the existing cache:
npm run registry:sync -- --provider react-bits --revision d86fccbd477786f94ca7eb891fbe0ec039d3cd3b --checked-date 2026-10-10 --offline
```

Review sync changes before adopting the new snapshot. It updates only the skill metadata; installed source stays on its recorded revision. Curated judgments live in `registry/overrides.json`. If source changed, browser evidence becomes stale. The `--checked-date` is an explicit input for reproducible metadata; ordinary sync uses the current UTC date. Installed repositories do not need a manually maintained fork.

## Official CLI fallback

When an unsupported registry dependency or source structure is handled better by the upstream CLI, an agent can review an official dry run in a target **already configured for shadcn**:

```bash
npx shadcn@4.21.4 add https://reactbits.dev/r/BlurText-TS-TW.json --cwd "$TARGET_PROJECT" --dry-run
```

`add --help` and the configuration prerequisite were tested. A complete fallback installation was not tested. The live URL is mutable; compare its code/revision before use and preserve licence notices. Do not silently replace pinned source with a live payload. No CLI is invoked by our source installer, and users do not have to initialize shadcn to use this skill. Upstream also documents `jsrepo`, but this project does not claim a tested jsrepo integration.

## Local examples and browser checks

```bash
npm run examples:create -- --kind vite
npm run examples:create -- --kind next
(cd .local/vite-consumer && npm ci)
(cd .local/next-consumer && npm ci)
npm --prefix .local/vite-consumer run build
NEXT_TELEMETRY_DISABLED=1 npm --prefix .local/next-consumer run build
npx playwright install chromium
npm run test:browser
```

`examples:create` refuses to replace existing projects. Choose a new `--project` path for another consumer. The browser runner starts the built fixtures on loopback ports 4173 and 4174, fails if those ports are already occupied, and stops its own servers afterward. It writes ignored screenshots and `artifacts/browser/report.json`. Use `--vite-project`, `--next-project` and `--output` for other locations. There is no deployment.

Live checks are separate from controlled tests:

```bash
npm run test:live
npm run test:consumer
npm run typecheck
npm run format:check
```

## Troubleshooting

- **Missing module/tooling:** run `npm ci` at the installed skill root. Do not copy only its entrypoint.
- **TypeScript parser API missing:** use the lockfile; do not replace TypeScript 5.9.3 with a newer major without migrating the adapter.
- **Blocked optional npm install scripts:** inspect the package manager message. This environment built with optional fsevents scripts blocked; no broad script permission change was needed.
- **Tailwind styles absent:** inspect the target CSS pipeline and include the downloaded component directory in source scanning. A dependency declaration alone is insufficient.
- **Collision or local edit:** inspect the manifest and diff the pinned source. Automatic overwrite is intentionally unavailable.
- **Stale install lock:** confirm no installation is running, then remove only that abandoned `.premium-frontend/install.lock`. Do not remove another running process's lock.
- **Source hash mismatch:** keep the existing files. Remove only the affected corrupt download cache after inspection or resync deliberately; never bypass integrity checks.
- **Unresolved source import:** inspect the variant; try a complete alternative, or review the official CLI fallback. Do not accept a partial install.
- **Network unavailable:** search, inspect and dry-run still work. Apply requires a previously cached pinned payload and licence. Git partial clones need their blobs cached before offline sync; a Git version supporting `--no-lazy-fetch` is required for that mode.
