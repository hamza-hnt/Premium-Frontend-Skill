# Premium frontend skill

A reusable, English-language coding-agent skill for composing polished React interfaces and selecting restrained React Bits enhancements. It includes a real metadata catalogue, deterministic search, deep inspection, and a source installer with pinned revisions, integrity checks and collision protection. The agent makes design decisions; local TypeScript scripts perform deterministic operations.

**V1 scope:** React Bits only. No backend, hosted registry, database, vector service, extra model credentials or paid APIs. Aceternity and a visual catalogue are future work. Demo pages are integration fixtures, not the main deliverable.

## Setup

```bash
npm ci
npm run validate
npm test
npm run typecheck
```

Use Node **22.12+ below 27**, npm and Git. `.nvmrc` selects 22.14.0; see [the verification report](docs/verification.md) for exact configurations exercised. Tool versions are locked. Read [installation instructions](docs/installation.md) to install the full folder into Codex through a repository-local symlink or portable local archive. No global agent configuration is modified.

## Use it

Tell your agent to use [SKILL.md](SKILL.md) to inspect your app, establish a design direction, build a functional layout, shortlist enhancements, integrate them and revise the rendered result. The entrypoint loads detailed references only when useful.

```bash
npm run components:search -- --query "subtle text reveal" --limit 5 --json
npm run components:inspect -- --id react-bits:blur-text --json
npm run components:search -- --query "settings switch" --category Micro --curated --max-risk low
```

From another project:

```bash
SKILL_ROOT="/Users/hamza/Desktop/Personal/BuildingSkills/premium-frontend-skill"
TARGET_PROJECT="$(pwd)"
npm --prefix "$SKILL_ROOT" run components:install -- --id react-bits:blur-text --project "$TARGET_PROJECT" --dry-run
npm --prefix "$SKILL_ROOT" run components:install -- --id react-bits:blur-text --project "$TARGET_PROJECT" --apply
```

Review the dry-run plan. It detects the target stack, styling, aliases, directory convention and package manager. Apply copies all files in the selected registry payload and the licence notice after hash validation. It never installs dependencies or changes config; it reports the exact dependency argv for the target package manager. Repeat installs are no-ops unless files, variant or revision changed, in which case review is required. Source is editable after installation. No automatic overwrite or upgrade exists.

Search, inspect and dry runs work offline after tooling setup. Initial sync and uncached source retrieval require network. `--offline` permits cached apply. See [integration guidance](references/integration-and-validation.md) for assets, CSS, peer checks, SSR and reduced-motion handling.

## Catalogue and provenance

The initial snapshot indexes **215 logical components / 860 implementation variants**, with **20 curated components** across five categories. All entries in the supported official free registry are covered. Metadata and design annotations are separate; annotations survive sync. Browser verification is tied to source fingerprints and invalidates on change.

`registry/components.json` is this skill's **local metadata catalogue**, not a target application's shadcn configuration or an upstream distribution registry. It contains no component implementation. Static source scans and estimated performance risk are labelled; unknown compatibility stays unknown.

```bash
npm run registry:sync -- --provider react-bits
```

Sync resolves a single immutable commit, validates before replacing the catalogue and reports additions, changes and removals. Keep curated judgments in `registry/overrides.json`. [Sources and limitations](docs/sources.md) document the official manifests, extraction, pinned revision and licence.

React Bits uses a custom **MIT + Commons Clause** text restricting redistribution of the components themselves. The installer preserves the exact pinned notice in the application. Upstream source, cache clones, generated applications and screenshots remain ignored locally. Our templates and scripts do not bundle upstream code. Nothing is published, pushed or deployed.

## Validation and examples

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
- `registry/`: schema, generated metadata snapshot, independently curated annotations.
- `scripts/`: sync, search, inspect, safe install, validation, local bundling and live checks.
- `tests/`: deterministic synthetic fixtures and behavior/safety checks.
- `examples/`: our source-free fixture templates, briefs and browser runner.
- `docs/`: setup, sources, verification and [roadmap](docs/roadmap.md).

`npm run skill:bundle` creates an allowlisted local archive containing the full skill and lockfile while excluding upstream code, caches and generated artifacts. See [troubleshooting](docs/installation.md#troubleshooting) for collisions, styling, runtime versions, offline behavior and the optional official CLI fallback.
