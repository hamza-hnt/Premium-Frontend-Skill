# Installation and tooling

The installer prepares the full skill and its dependencies in one operation. Supported runtime: **Node.js 22.12 or newer, below 27**, with npm. `.nvmrc` selects Node 22.14.0. Git is needed to clone this repository and to refresh upstream metadata; using the installed catalogue and retrieving pinned component source do not require Git.

Commands below use Bash-compatible syntax. Exact platform and runtime checks are recorded in the [verification report](verification.md); a CI configuration alone is not proof that a platform has passed.

## Install from GitHub

```bash
git clone https://github.com/hamza-hnt/Premium-Frontend-Skill.git premium-frontend-skill
cd premium-frontend-skill
npm ci --include=dev
npm run skill:install
```

This keeps the development checkout separate from the installed copy. The installer:

1. Checks Node/npm and the destination.
2. Extracts the complete skill into a temporary staging directory.
3. Runs `npm ci --include=dev --include=optional` and `npm run validate` there.
4. Moves the prepared skill into place only after those checks pass.

The default destination is `$CODEX_HOME/skills/premium-frontend-skill` when `CODEX_HOME` is set, or `~/.codex/skills/premium-frontend-skill` otherwise. The installer prints the resolved path. It refuses existing destinations unless `--update` is supplied; symlinks and unrelated directories are not update targets.

No transpilation or website build is required during skill setup. Its commands use `tsx` and TypeScript, so development dependencies must be installed. `node_modules` stays local and is excluded from Git and distributable packages. Setup needs network access for dependencies, but no extra API keys, backend or shadcn configuration.

## Choose a location

`--dest` is the **complete final skill folder**, not its parent:

```bash
npm run skill:install -- --dest "$HOME/.agents/skills/premium-frontend-skill"
```

For a skill available only to one project:

```bash
npm run skill:install -- --dest "/absolute/path/to/your/react-app/.agents/skills/premium-frontend-skill"
```

Use the discovery directory configured for your agent. The [Codex documentation](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills) also describes user-level `~/.agents/skills` and repository `.agents/skills`. Avoid duplicate copies in multiple discovery directories.

The entire skill folder is required: instructions, references, scripts, providers, catalogue, package manifest and lockfile. Copying only `SKILL.md` is insufficient. The installer uses a JavaScript archive library; it does not need a system `tar` executable at runtime.

## Invoke the skill

Open your React project in Codex and mention `$premium-frontend-skill` in your brief. See the [README example](../README.md#use-it). Restart Codex if the skill does not appear, or ask the agent to read `SKILL.md` at its installed path.

The agent supplies design judgment and uses its own account access. Optional image generation requires a tool available to that agent. Installing this skill does not generate a site or publish an application.

## Updates

From the original development checkout:

```bash
git pull --ff-only
npm ci --include=dev
npm run skill:install -- --update
```

If you chose a custom destination, repeat it:

```bash
npm run skill:install -- --update --dest "$HOME/.agents/skills/premium-frontend-skill"
```

The new copy is prepared and validated before the old installation is replaced. The installer retains the complete previous folder and prints its backup path. For a destination inside a `skills` directory, staging and backups live beside that directory in `.premium-frontend-installer`, outside skill discovery. For other custom layouts, this state directory lives in the destination's parent. It reports changes to managed files so you can recover your customizations from the backup; it does not merge edits into the new copy.

Staging and the destination must share a filesystem, and the state directory must be writable. If a process is interrupted, the next run identifies its destination lock; remove only that lock after checking that the previous process has stopped. Backups are retained until you remove them yourself.

An existing manual installation with the matching skill/package identity can be updated and backed up too. A symlink or unrelated folder is rejected. If Git reports local changes or diverging commits in your checkout, reconcile them before pulling a new version.

## Installer commands

From a development checkout, `npm run skill:install -- <options>` builds and launches the installer. Its packaged command supports:

```text
premium-frontend-skill [install] [--dest <complete-skill-folder>] [--update]
premium-frontend-skill --help
premium-frontend-skill --version
```

The package is **not published on npm yet**. Once published under this name, users can install it without cloning the repository:

```bash
npx premium-frontend-skill@latest install
npx premium-frontend-skill@latest install --update
```

## Package and test the installer

The repository's root package remains private. A packaging command creates a separate distributable npm package containing the executable installer and a full versioned skill archive, including its lockfile. The skill archive excludes dependencies, Git history, caches, generated applications and upstream component implementation code.

Run these checks from the checkout:

```bash
npm run format:check
npm run typecheck
npm test
npm run validate
npm run test:installer
npm run installer:pack
npm run test:installer:package
```

`test:installer` exercises controlled installation and update cases. `test:installer:package` checks the actual packed package using temporary destinations, including installation of the skill's locked dependencies. These checks do not publish a package or install into your real skills directory. Network access is required for uncached npm dependencies.

`installer:pack` stages the distributable under `artifacts/npm-package` and prints the resulting package path. For version 1.2.0, it produces `artifacts/premium-frontend-skill-1.2.0.tgz`.

To try that local package yourself, choose a new temporary destination:

```bash
INSTALLER_TEST_DIR="$(mktemp -d)"
npm exec --yes --package ./artifacts/premium-frontend-skill-1.2.0.tgz -- premium-frontend-skill install --dest "$INSTALLER_TEST_DIR/skills/premium-frontend-skill"
```

### Publish to npm

Publication is a separate, manual step for maintainers. Confirm ownership or availability of the package name, authenticate with your npm account, review the packed contents, and use the filename printed by `installer:pack`:

```bash
npm publish ./artifacts/premium-frontend-skill-1.2.0.tgz --access public
```

Do not run `npm publish` against the private repository root. Update the package version for subsequent releases, rerun the checks, and publish the newly generated archive. No test, install command or CI job publishes automatically. See npm's [publishing guide](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/) for account requirements.

## Ordinary use from another project

Run these from the React project's root. Adjust `SKILL_ROOT` if you chose a different installation location:

```bash
SKILL_ROOT="${CODEX_HOME:-$HOME/.codex}/skills/premium-frontend-skill"
TARGET_PROJECT="$(pwd -P)"
npm --prefix "$SKILL_ROOT" run components:search -- --query "subtle text reveal" --limit 5 --json
npm --prefix "$SKILL_ROOT" run components:search -- --query "hero" --limit 8 --json
npm --prefix "$SKILL_ROOT" run components:search -- --query "depth" --role gallery --json
npm --prefix "$SKILL_ROOT" run components:search -- --query "settings switch" --category Micro --curated --max-risk low --json
npm --prefix "$SKILL_ROOT" run components:inspect -- --id react-bits:blur-text --json
npm --prefix "$SKILL_ROOT" run components:install -- --id react-bits:blur-text --project "$TARGET_PROJECT" --dry-run
npm --prefix "$SKILL_ROOT" run components:install -- --id react-bits:blur-text --project "$TARGET_PROJECT" --apply
```

`--variant TS-TW` chooses an explicit variant. The default follows detected TypeScript and Tailwind declarations. `--dir src/ui/react-bits` selects a project-relative component destination. `--offline` permits only cached source on apply. The install command prints JSON for both readable inspection and machine use; search and inspect support text or `--json`. For pure JSON stdout use npm's `--silent` option if your npm version prints script banners to stdout. Errors are JSON on stderr with a nonzero exit. Dry-run conflicts exit with code 2; invalid commands and apply failures exit with code 1.

Search and inspect include editorial discovery guidance for every component, separately labelled from upstream descriptions and runtime evidence. `--role` filters possible uses: `hero`, `background`, `typography`, `gallery`, `navigation`, `storytelling`, `feedback`, `input` or `decoration`. `--category` still filters the upstream taxonomy. Broad role queries diversify similarly relevant results across categories; exact component names and IDs stay prominent. Refine by behavior after exploring a broad role. Search ranking is not a visual quality score.

The plan includes a dependency command represented as an argv array. Execute it in the target project using its package manager after review. The component source installer does not modify application dependencies or config. The skill installer separately prepares the skill's own dependencies. This avoids half-rolled-back package manager operations and respects npm, pnpm, Yarn and Bun independently of this skill's npm setup. Target manager detection is tested with controlled fixtures; only npm live integration is claimed.

Examples using the generated fixture:

```bash
npm --prefix "$SKILL_ROOT" run components:install -- --id react-bits:shape-grid --project "$SKILL_ROOT/.local/vite-consumer" --variant TS-TW --dry-run
```

## Sync

Run from the installed skill directory:

```bash
npm run registry:sync -- --provider react-bits
# Reproduce the initial source snapshot from the existing cache:
npm run registry:sync -- --provider react-bits --revision d86fccbd477786f94ca7eb891fbe0ec039d3cd3b --checked-date 2026-10-10 --offline
```

Review sync changes before adopting the new snapshot. It updates only the skill metadata; installed source stays on its recorded revision. Curated judgments live in `registry/overrides.json`. If source changed, browser evidence becomes stale. The `--checked-date` is an explicit input for reproducible metadata; ordinary sync uses the current UTC date. Installed repositories do not need a manually maintained fork.

Sync also validates the independently maintained `registry/discovery.json` index against the incoming catalogue before replacement. If upstream adds or removes components, the error lists missing or stale IDs. Inspect their official metadata, add or remove the corresponding discovery entries, then rerun sync and `npm run validate`. Review affected summaries when behavior changes; never copy performance or compatibility assumptions into discovery labels. Search and inspect require complete coverage of the committed snapshot.

## Official CLI fallback

When an unsupported registry dependency or source structure is handled better by the upstream CLI, an agent can review an official dry run in a target **already configured for shadcn**:

```bash
npx shadcn@4.21.4 add https://reactbits.dev/r/BlurText-TS-TW.json --cwd "$TARGET_PROJECT" --dry-run
```

`add --help` and the configuration prerequisite were tested. A complete fallback installation was not tested. The live URL is mutable; compare its code/revision before use and preserve licence notices. Do not silently replace pinned source with a live payload. No CLI is invoked by our source installer, and users do not have to initialize shadcn to use this skill. Upstream also documents `jsrepo`, but this project does not claim a tested jsrepo integration.

## Local examples and browser checks

Run from the skill repository root:

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

- **Missing module/tooling:** run `npm ci --include=dev --include=optional` at the installed skill root. Do not copy only its entrypoint.
- **TypeScript parser API missing:** use the lockfile; do not replace TypeScript 5.9.3 with a newer major without migrating the adapter.
- **Blocked npm install scripts:** identify the affected package in the package manager output and check whether it is required for your platform. Address any missing executable before running the skill.
- **Tailwind styles absent:** inspect the target CSS pipeline and include the downloaded component directory in source scanning. A dependency declaration alone is insufficient.
- **Component collision or local edit:** inspect the manifest and diff the pinned source. Automatic overwrite is intentionally unavailable.
- **Stale install lock:** confirm no installation is running, then remove only that abandoned `.premium-frontend/install.lock`. Do not remove another running process's lock.
- **Source hash mismatch:** keep the existing files. Remove only the affected corrupt download cache after inspection or resync deliberately; never bypass integrity checks.
- **Unresolved source import:** inspect the variant; try a complete alternative, or review the official CLI fallback. Do not accept a partial install.
- **Network unavailable:** search, inspect and dry-run still work. Apply requires a previously cached pinned payload and licence. Git partial clones need their blobs cached before offline sync; a Git version supporting `--no-lazy-fetch` is required for that mode.
