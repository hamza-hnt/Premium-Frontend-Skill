# Premium frontend skill

A reusable, English-language coding-agent skill that turns short briefs into distinctive React interfaces with purposeful React Bits interactions. It includes a real metadata catalogue, deterministic search, deep inspection, and a source installer with pinned revisions, integrity checks and collision protection. The agent makes design decisions; local TypeScript scripts perform deterministic operations.

**Current scope:** React Bits components, local catalogue search and source installation. The tooling needs no backend, hosted registry, database or additional API keys. Your coding agent and any optional image-generation tools use their own access and account requirements.

## Install in Codex

You need **Node.js 22.12+ below 27**, npm and Git. `.nvmrc` selects Node 22.14.0. The commands below use Bash-compatible syntax for macOS, Linux or WSL; native PowerShell setup has not been tested.

Copy this repository's HTTPS clone URL from GitHub's **Code** menu and replace `REPOSITORY_URL` below. This installs the full skill directly into the user-level skills directory:

```bash
SKILLS_DIR="$HOME/.agents/skills"
SKILL_ROOT="$SKILLS_DIR/premium-frontend-skill"
mkdir -p "$SKILLS_DIR" &&
  git clone "REPOSITORY_URL" "$SKILL_ROOT" &&
  cd "$SKILL_ROOT" &&
  npm ci &&
  npm run validate
```

The [Codex skill documentation](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills) lists `~/.agents/skills` for user-level discovery. If your Codex installation already uses `~/.codex/skills`, replace the first line of the block with `SKILLS_DIR="$HOME/.codex/skills"`. Choose one location. If the destination already exists, follow the [update instructions](docs/installation.md#updates).

Keep the **whole folder**, including `scripts/`, `providers/`, `registry/` and `references/`. Run plain `npm ci` inside it: the skill uses tooling listed in `devDependencies`, so do not omit those dependencies. `node_modules` stays local and is ignored by Git.

For a separate development checkout, a copy without Git history or a project-local installation, see [installation options](docs/installation.md). Exact configurations exercised are recorded in the [verification report](docs/verification.md).

## Use it

Open your React project in Codex, then mention the skill in your prompt:

> Use $premium-frontend-skill to build a distinctive website for an independent ceramics studio, with expressive React Bits interactions and a polished mobile experience.

If the skill does not appear, restart Codex. You can also ask the agent explicitly to read `SKILL.md` at the installed location. Other coding agents can use the same entrypoint when they support local instructions and shell tools; follow their own skill-discovery conventions.

The agent infers the visual direction, searches and selects real components before fixing the layout, prepares assets for their interactions, integrates the experience and reviews it in motion. You do not need to name components or prescribe animation parameters. The entrypoint loads detailed references only when useful. To generate custom visuals, include that in your prompt and enable your agent's image-generation tool.

Version 1.2 adds explicit first-screen composition, visual comparison of component candidates, asset briefs tied to layout, and review of both motion and the settled page. It distinguishes composition-changing interactions from local refinements and task feedback, while keeping dashboards and frequent-use workflows stable. There is no fixed hero layout, visual style or component quota. Its editable defaults avoid terminal periods in short headings, ornamental italics, automatic Cormorant Garamond styling and gratuitous dots or badges. Explicit briefs and established brand rules take precedence.

For direct CLI use, run these commands from the installed skill directory:

```bash
npm run components:search -- --query "image gallery" --limit 5 --json
npm run components:search -- --query "hero" --limit 8 --json
npm run components:search -- --query "editorial scroll" --limit 8 --json
npm run components:search -- --query "depth" --role gallery --json
npm run components:inspect -- --id react-bits:blur-text --json
npm run components:search -- --query "settings switch" --category Micro --curated --max-risk low
```

From your React project's root, point `SKILL_ROOT` at the location you installed above:

```bash
SKILL_ROOT="$HOME/.agents/skills/premium-frontend-skill"
TARGET_PROJECT="$(pwd -P)"
npm --prefix "$SKILL_ROOT" run components:install -- --id react-bits:blur-text --project "$TARGET_PROJECT" --dry-run
npm --prefix "$SKILL_ROOT" run components:install -- --id react-bits:blur-text --project "$TARGET_PROJECT" --apply
```

Review the dry-run plan. It detects the target stack, styling, aliases, directory convention and package manager. Apply copies all files in the selected registry payload and the licence notice after hash validation. It never installs dependencies or changes config; it reports the exact dependency argv for the target package manager. Repeat installs are no-ops unless files, variant or revision changed, in which case review is required. Source is editable after installation. No automatic overwrite or upgrade exists.

Search, inspect and dry runs work offline after tooling setup. Initial sync and uncached source retrieval require network. `--offline` permits cached apply. See [integration guidance](references/integration-and-validation.md) for assets, CSS, peer checks, SSR and reduced-motion handling.

## Catalogue and provenance

The snapshot indexes **215 logical components / 860 implementation variants** across all five upstream categories. Every component also has an editorial discovery entry describing its roles, behavior and search vocabulary. **20 components** have additional, detailed curated notes; that subset does not limit search or imply the remaining components are unsuitable. Discovery descriptions are selection aids, not runtime verification or a guarantee of visual quality.

`registry/discovery.json` keeps complete search guidance separate from pinned upstream metadata and the detailed annotations in `registry/overrides.json`. Exact name/ID matches remain prominent; broad role searches expose different categories instead of favoring the best-annotated small effects. Validation checks that the discovery index covers the catalogue without missing or stale IDs. Browser verification remains tied to source fingerprints and invalidates on change.

`registry/components.json` is this skill's **local metadata catalogue**, not a target application's shadcn configuration or an upstream distribution registry. It contains no component implementation. Static source scans and estimated performance risk are labelled; unknown compatibility stays unknown.

```bash
npm run registry:sync -- --provider react-bits
```

Sync resolves a single immutable commit, validates before replacing the catalogue and reports additions, changes and removals. A missing or stale discovery ID stops sync before replacement so maintainers can review the index; source changes also warrant reviewing the affected behavior summaries. Keep detailed curated judgments in `registry/overrides.json`. [Sources and limitations](docs/sources.md) document the official manifests, extraction, pinned revision and licence.

React Bits uses a custom **MIT + Commons Clause** text restricting redistribution of the components themselves. The installer preserves the exact pinned notice in the application. Upstream source, cache clones, generated applications and screenshots remain ignored locally. The templates and scripts do not bundle upstream code or automatically publish or deploy applications.

## Validation and examples

Contributors can run the same local checks as CI from the repository root:

```bash
npm run format:check
npm run typecheck
npm test
npm run validate
npm run skill:bundle
```

The GitHub Actions workflow in `.github/workflows/ci.yml` runs on pushes, pull requests and manual dispatch. It uses Ubuntu 24.04 and the Node version in `.nvmrc`, installs the locked dependencies with `npm ci`, then checks formatting, TypeScript, unit tests, skill/catalogue validity and archive creation. It also verifies that the checks leave tracked files unchanged. Actions are pinned to commit SHAs, repository access is read-only, and newer runs cancel older runs for the same ref.

Default CI uses controlled fixtures and the committed catalogue; it does not sync upstream metadata, fetch React Bits components, install browsers or publish the archive. The live-download, external-consumer and browser checks below remain explicit integration checks. CI establishes technical consistency; generated-site design quality still requires rendered review.

```bash
npm run examples:create -- --kind vite
npm run examples:create -- --kind next
(cd .local/vite-consumer && npm ci)
(cd .local/next-consumer && npm ci)
npm --prefix .local/vite-consumer run build
NEXT_TELEMETRY_DISABLED=1 npm --prefix .local/next-consumer run build
npx playwright install chromium
npm run test:browser
npm run test:live
npm run test:consumer
```

The Vite fixture has a landing page (`/`), dashboard (`/dashboard`) and settings (`/settings`). A separate Next.js fixture tests an App Router server page/client boundary. Six distinct real components span every upstream category and three dependency profiles. Briefs, selection reasons and reproduction steps are in [examples/briefs.md](examples/briefs.md). A plain marketing baseline is available at `/?baseline=1`.

The browser runner checks 390, 768 and 1440 px in normal and reduced-motion modes, exercises controls and keyboard behavior, inspects runtime errors/overflow, runs axe, and captures screenshots. The separate consumer check extracts a full skill archive outside this repository, installs its tooling, runs search/dry-run/apply/repeat, retrieves actual pinned source over HTTPS and typechecks it. Controlled tests and live evidence are reported separately in [docs/verification.md](docs/verification.md).

## Structure

- `SKILL.md`, `references/`: portable agent workflow and visual review guidance.
- `providers/`: small provider contract, React Bits discovery and retrieval adapter.
- `registry/`: schema, generated metadata snapshot, complete discovery index and independently curated annotations.
- `scripts/`: sync, search, inspect, safe install, validation, local bundling and live checks.
- `tests/`: deterministic synthetic fixtures and behavior/safety checks.
- `examples/`: our source-free fixture templates, briefs and browser runner.
- `docs/`: setup, sources, verification and [roadmap](docs/roadmap.md).

`npm run skill:bundle` creates an allowlisted local archive containing the full skill and lockfile while excluding upstream code, caches and generated artifacts. See [troubleshooting](docs/installation.md#troubleshooting) for collisions, styling, runtime versions, offline behavior and the optional official CLI fallback.
