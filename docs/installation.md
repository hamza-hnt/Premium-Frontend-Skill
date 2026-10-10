# Setup and local skill installation

Supported tooling runtime: **Node.js 22.12+ below 27**, with npm and Git (tested with 2.55.0; offline Git reads require `--no-lazy-fetch`). `.nvmrc` selects Node 22.14.0. Runtime support claims and exact versions tested are detailed in the [verification report](verification.md). The lockfile pins the skill's dependencies. TypeScript 5.9.3 is intentionally pinned for its stable AST API.

Commands use Bash-compatible syntax for macOS, Linux or WSL. Native PowerShell setup has not been tested. The [README quickstart](../README.md#install-in-codex) installs directly into the user-level skills directory. Use the options below if you want to keep a separate development checkout or install for just one project.

## Separate development checkout

In a directory of your choice, replace `REPOSITORY_URL` with this repository's HTTPS clone URL from GitHub's **Code** menu:

```bash
git clone "REPOSITORY_URL" premium-frontend-skill &&
  cd premium-frontend-skill &&
  npm ci &&
  npm run validate &&
  npm test
```

Use plain `npm ci`, including development dependencies: `tsx` and TypeScript are required by the skill's commands. Keep `node_modules` on each machine where you run the skill; Git and the portable bundle exclude it.

The local tooling needs no API keys or shadcn initialization. The consuming agent supplies design judgment and uses its own account access. Optional image generation requires an image-generation tool available to that agent.

## Install a portable copy

The [Codex documentation](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills) lists repository `.agents/skills` and user `~/.agents/skills` locations and supports symlinked skill folders. Install in one discovery location. If your Codex installation uses `~/.codex/skills`, substitute that directory below.

Run this from the development checkout to package the full skill without Git history, dependencies, caches or generated examples. Set `SKILLS_DIR` to your chosen destination; the commands stop if a skill of the same name already exists:

```bash
(
  set -eu
  SKILL_ROOT="$(pwd -P)"
  SKILLS_DIR="$HOME/.agents/skills"
  DESTINATION="$SKILLS_DIR/premium-frontend-skill"
  if [ -e "$DESTINATION" ] || [ -L "$DESTINATION" ]; then
    echo "Destination already exists: $DESTINATION" >&2
    exit 1
  fi
  npm run skill:bundle -- --output "$SKILL_ROOT/artifacts/premium-frontend-skill.tar.gz"
  mkdir -p "$SKILLS_DIR"
  tar -xzf "$SKILL_ROOT/artifacts/premium-frontend-skill.tar.gz" -C "$SKILLS_DIR"
  cd "$DESTINATION"
  npm ci
  npm run validate
)
```

The **entire skill folder** is required: scripts, providers, schema, catalogue, annotations, references, package manifest and lockfile. Copying only `SKILL.md` cannot work. You can also copy the whole checkout with `cp -R` to a destination that does not exist, then run `npm ci` there; that also copies any local Git history and generated files present in the checkout.

## Optional project-local symlink

From the development checkout, replace the target path with your React project's absolute path. This shares the checkout and its installed dependencies with one project. The commands stop if the destination already exists:

```bash
(
  set -eu
  SKILL_ROOT="$(pwd -P)"
  TARGET_PROJECT="/absolute/path/to/your/react-app"
  test -d "$TARGET_PROJECT"
  DESTINATION="$TARGET_PROJECT/.agents/skills/premium-frontend-skill"
  if [ -e "$DESTINATION" ] || [ -L "$DESTINATION" ]; then
    echo "Destination already exists: $DESTINATION" >&2
    exit 1
  fi
  mkdir -p "$TARGET_PROJECT/.agents/skills"
  ln -s "$SKILL_ROOT" "$DESTINATION"
)
```

## Invoke the skill

Open the React project in Codex and invoke `$premium-frontend-skill` with your brief, or explicitly ask the agent to read `SKILL.md` at its installed path. Restart Codex if the skill does not appear. See the [README example](../README.md#use-it) for a short prompt. Host discovery is documented from official instructions; see the verification report for the extent of local host testing.

## Updates

For a Git clone, run the following inside the installed skill directory (or inside the source checkout for a symlink):

```bash
git pull --ff-only
npm ci
npm run validate
```

If Git reports local changes or diverging commits, reconcile those changes before updating. For an archive or copied installation, prepare and validate the new version in a separate directory, then replace the old installation after preserving any local edits. Do not extract a new archive over an existing installation.

## Ordinary use from another project

Run these from the React project's root. Adjust `SKILL_ROOT` if you chose a different installation location:

```bash
SKILL_ROOT="$HOME/.agents/skills/premium-frontend-skill"
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

The plan includes a dependency command represented as an argv array. Execute it in the target project using its package manager after review. The installer does not modify dependencies or config. This avoids half-rolled-back package manager operations and respects npm, pnpm, Yarn and Bun independently of this skill's npm setup. Target manager detection is tested with controlled fixtures; only npm live integration is claimed.

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

- **Missing module/tooling:** run `npm ci` at the installed skill root. Do not copy only its entrypoint.
- **TypeScript parser API missing:** use the lockfile; do not replace TypeScript 5.9.3 with a newer major without migrating the adapter.
- **Blocked npm install scripts:** identify the affected package in the package manager output and check whether it is required for your platform. Address any missing executable before running the skill.
- **Tailwind styles absent:** inspect the target CSS pipeline and include the downloaded component directory in source scanning. A dependency declaration alone is insufficient.
- **Collision or local edit:** inspect the manifest and diff the pinned source. Automatic overwrite is intentionally unavailable.
- **Stale install lock:** confirm no installation is running, then remove only that abandoned `.premium-frontend/install.lock`. Do not remove another running process's lock.
- **Source hash mismatch:** keep the existing files. Remove only the affected corrupt download cache after inspection or resync deliberately; never bypass integrity checks.
- **Unresolved source import:** inspect the variant; try a complete alternative, or review the official CLI fallback. Do not accept a partial install.
- **Network unavailable:** search, inspect and dry-run still work. Apply requires a previously cached pinned payload and licence. Git partial clones need their blobs cached before offline sync; a Git version supporting `--no-lazy-fetch` is required for that mode.
