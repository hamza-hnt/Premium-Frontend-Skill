# Verification report

Installer checks updated on **October 12, 2026 (Europe/Paris)**; catalogue and application evidence below was recorded on October 10. The catalogue uses upstream commit `d86fccbd477786f94ca7eb891fbe0ec039d3cd3b`. This report distinguishes controlled tooling tests from actual upstream retrieval and rendered application checks.

## Skill installer and npm packaging

On macOS arm64, **62 controlled tests passed** on both Node **22.14.0** and **26.8.1**. The 20 installer cases cover destination resolution, fresh installation, updates and complete backups, legacy copies, local edits during preparation, concurrent locks, archive/file integrity, unsafe paths and symlinks, failed dependency/validation steps, rollback and recovery. Custom home destinations and nested skills directories have separate coverage.

The actual packed npm executable was exercised through `npm exec` with **npm 10.9.2 and 12.0.2**, using temporary destinations and fresh npm caches. Both runs passed: help/version, `CODEX_HOME`, paths with spaces, installation under production/omitted-dev settings, exact lockfile preservation, catalogue validation/search, existing-copy refusal, update with local-edit backup, custom destination and an unchanged caller project. The checkout command `npm run skill:install -- --dest ...` also passed on Node 22.14.0.

The npm package contains six files: its manifest, README, two executable modules, the skill archive and its integrity manifest. The private root package is not published; no npm lifecycle hook installs the skill. The embedded archive preserves the skill's lockfile and excludes dependencies, Git history, caches, generated sites and upstream component implementation code. TypeScript, formatting, catalogue validation and workflow lint checks passed.

CI includes installer checks on Ubuntu, macOS and Windows, with Node 22 and an additional Ubuntu Node 26 job. **Linux and Windows runs have not been executed in this local validation.** Those initial checks did not publish to npm or exercise host automatic skill discovery. No installed personal skill copy or test website was modified.

### Published package and release workflow

After the maintainer published `premium-frontend-skill@1.2.0`, the public registry exposed the matching SHA-1 `1214e029301477fa6276ffec656bde2d008611f0`. A fresh-cache installation of that published package passed on macOS arm64 with Node 22.14.0/npm 10.9.2: CLI version, real dependency installation into a temporary destination, catalogue validation and a `BlurText` search. Temporary files were removed; personal skill directories were untouched.

The new release workflow reuses the full CI and checks tag/package/lockfile/skill version agreement before publishing. **64 controlled tests pass on Node 22.14.0 and 26.8.1**, including rejection of mismatched versions, invalid tags and an unexpectedly publishable repository root. The updated local package passes the complete packed-installer smoke check on Node 26.8.1. TypeScript, formatting, catalogue validation and actionlint pass. These local checks do not verify the OIDC exchange; that requires npm trusted publisher setup and a successful future GitHub release.

### Windows line-ending regression

The first reported Windows GitHub Actions run failed in the packed installation with `Invalid skill frontmatter`. The validator required LF line endings, while the installer correctly accepted and preserved CRLF files. A new test reproduced the failure by running the actual validation CLI against a CRLF copy of the skill on macOS.

The validator now normalizes line endings only in memory, preserving the original bytes used by archive and installation hashes. `.gitattributes` also requests LF text checkouts. The regression exercises LF and CRLF, rejects incorrect names and missing descriptions, and confirms validation does not rewrite the skill. It runs explicitly in every installer CI job. **63 controlled tests pass on Node 22.14.0 locally**; a new Windows CI run is still required to confirm the fix on that runner.

## Version 1.2: discovery and design guidance

The upstream HEAD still matched the pinned revision during this update. The official pinned registry manifest was compared with the catalogue: **860 of 860 variant names matched, with no missing or extra entries**. All **215 logical components** have validated discovery roles, search terms and behavior summaries. Source metadata and the 20 detailed curated annotations retain their existing provenance and evidence status.

On Node **22.14.0**, **42 controlled tests passed, zero failed**, along with TypeScript, formatting, catalogue/discovery validation and the skill frontmatter validator. Ten new tests exercise index coverage drift, source-filter preservation, exact-name retrieval, multiword relevance, broad-query variety, absence of curated ranking inflation, offline CLI output and synchronization failure before replacement. An independent review additionally checked each component's name, lowercase name, full ID and slug: **860 exact-query probes ranked the intended component first**.

The external-consumer check passed again using a freshly extracted archive and `npm ci`: search, inspection, source retrieval over pinned HTTPS, installation, an offline repeat no-op and a consumer TypeScript build. The archive includes the new discovery index and validation code. This checks portable tooling; host automatic skill discovery was not exercised.

A separate read-only decision evaluation applied the revised instructions to two short briefs. An architecture exhibition produced a spatial six-project exploration concept with compared gallery alternatives; a warehouse dashboard retained a stable table and considered local action feedback. The plans differed in composition, asset needs and motion intensity. **No new application was rendered for that evaluation**, so these plans do not establish aesthetic quality, accessibility or performance. The browser results below belong to the original integration fixtures and are not a visual certification of version 1.2's design guidance.

The remaining sections record the original V1 integration baseline.

## Delivered and covered

- Reusable English skill, three detailed references, setup/source/roadmap documentation, TypeScript tooling and npm lockfile.
- 215 logical React Bits components; 860 implementation variants; all entries in the supported official free registry indexed.
- 20 curated components with selection, unsuitable-use, integration, accessibility, reduced-motion and estimated performance notes.
- Category coverage: 41 Animations, 33 TextAnimations, 48 Components, 59 Backgrounds and 34 Micro.
- Six distinct real TS-TW components rendered in three Vite routes. Three of those also rendered in a separate Next.js App Router application.
- One known variant installation exclusion: StaggeredMenu JS-TW references a source outside its payload. It remains searchable with the caveat and fails safely on apply.
- A local allowlisted archive includes the full skill and lockfiles while excluding caches, upstream implementations, generated applications and screenshots.

The working V1 meets the requested checks in the configurations below. It does not claim that all 215 components, all four variants, every browser or every React application were tested.

## Exact configurations

| Layer                    | Tested configuration                                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Host                     | macOS, arm64; Git 2.55.0; npm 12.0.2                                                                                                     |
| Tooling runtime          | Node 26.8.1 and Node 22.14.0; TypeScript 5.9.3; tsx 4.23.15; Zod 4.6.5; semver 7.8.5                                                     |
| Vite fixture             | React/React DOM 19.3.0; Vite 8.3.4; React plugin 6.1.2; Tailwind / Tailwind Vite plugin 4.3.3; Motion 12.23.12; GSAP 3.13.0              |
| Next.js fixture          | Next.js 16.4.0, App Router/Turbopack production build; React/React DOM 19.3.0; Tailwind / Tailwind PostCSS plugin 4.3.3; Motion 12.23.12 |
| Fixture typing           | TypeScript 5.9.3; React types 19.2.14; React DOM types 19.2.3; Node types 22.19.15                                                       |
| Browser checks           | Playwright 1.64.0; Chromium 156.0.8078.4; axe-core/playwright 4.13.0                                                                     |
| Official fallback syntax | shadcn 4.21.4, `add --help`; attempted dry run stopped at its missing-configuration prompt                                               |

Full fixture dependency lockfiles are retained in `examples/locks/` and copied by the generator. The Node 22 binary used for tooling tests was downloaded from the official Node distribution and checked against its published SHA-256 list. Application production builds and browser servers ran on Node 26.8.1. Node 22 tooling tests/typecheck/search passed; application builds were not independently repeated on Node 22.

## Controlled tooling tests

`npm test`: **32 passed, zero failed**. The same controlled suite passed on Node 22.14.0. `npm run typecheck`, catalogue validation, formatting checks and the bundled skill-creator frontmatter validator also passed.

Coverage includes strict catalogue schema, duplicate IDs/variants, evidence requirements, literal AST parsing without evaluation, structured registry parsing, file hashes, discovery from a synthetic Git repository, deterministic synchronization, annotation preservation, failure preservation, change reporting, verification invalidation, ranking/compatibility filters, pure JSON output from another working directory, project detection, dependency planning, safe paths, symlinks, collisions, repeat installation, source upgrades/local edits, rollback, concurrent locks, corrupt downloads, foreign provenance, empty offline caches and explicit apply requirements.

These fixtures are original synthetic test data. They are not presented as proof of upstream compatibility.

## Live retrieval and external consumer

`npm run test:live` retrieved the real BlurText TS-TW payload and licence over pinned GitHub HTTPS URLs using an empty temporary cache. Both hashes matched the metadata snapshot. The source TSX SHA-256 was `c824a558bb484521abe6adac25ba8af839de81434018a4fe044fc9969fe353e3`. The exact notice was preserved with hash `f4c33af6739191537738662d223b68d77bc226f4b57ea883e16481d8cc5c73c9`.

`npm run test:consumer` created an allowlisted skill archive, extracted it outside this repository, ran a fresh `npm ci`, and invoked the installed scripts from a separate application directory. Search ranked BlurText first for `subtle text reveal`; dry-run planning, real HTTPS installation, an offline repeat no-op and a TypeScript consumer build passed. The test shared neither the repository clone nor its download cache. Temporary test directories were removed after the report was retained. This exercised script portability and packaging, not Codex's automatic skill-discovery UI.

The Vite and Next.js fixtures retrieved the real selected files through the installer, keeping original upstream bytes and licence notices. `npm ls --depth=0` completed without dependency errors in both fixtures. Production builds succeeded. Optional fsevents install scripts were blocked by the host npm policy; these builds did not need them.

## Browser matrix

**24 of 24 cases passed**: four pages × three widths (390, 768, 1440) × two motion preferences. Each used a fresh browser context. There were **zero runtime/console errors**, **zero full-document overflow failures**, and **zero axe violations** in the exercised states. The mobile project table intentionally scrolls within a focusable, named region. Axe still reported `color-contrast` as incomplete for some decorated content; manual review does not turn those into automated passes.

| Actual component | Category       | Dependency profile    | Rendered integration                        |
| ---------------- | -------------- | --------------------- | ------------------------------------------- |
| BlurText         | TextAnimations | Motion                | Vite marketing; Next.js client card         |
| CountUp          | TextAnimations | Motion                | Vite dashboard summary                      |
| FadeContent      | Animations     | GSAP                  | Vite marketing supporting paragraph         |
| SpotlightCard    | Components     | React only            | Vite marketing feature; Next.js client card |
| ShapeGrid        | Backgrounds    | React only, Canvas 2D | Bounded Vite marketing illustration         |
| SquishSwitch     | Micro          | Motion                | Vite settings; Next.js client card          |

Checks exercised navigation targets, illustration pause/resume and canvas unmounting, dashboard period changes/filtering/empty state, summary feedback, keyboard Space on switches, form saving and native email validation. Tab focus and visible outlines were inspected. Reduced motion was set **before page load**: the canvas was absent and settings used native switches. The Next.js build included a server-rendered outer page and an interactive client boundary with matching static-first markup; no hydration error appeared. Mid-session OS preference changes and assistive-technology sessions were not separately automated.

The runner retained **27 screenshots**: 24 normal/reduced cases plus three marketing baselines. Screenshots were actually opened and inspected with the image tool, including desktop marketing/dashboard, mobile marketing/settings, a tablet dashboard and the baseline comparison. Source verification flags are attached only to the six tested components with an explicit TS-TW/fixture/browser scope and their source fingerprint. The other 209 components remain browser-unverified.

## Observed problems and corrections

- TypeScript 7's compiler API differed from the AST API used by the adapter; tooling now pins 5.9.3.
- The first axe run used a Playwright convenience page instead of an explicit context. The runner was corrected before any accessibility result was counted as passing.
- Automated checks found low-contrast secondary text and a nonfocusable mobile table scroller. Text was darkened, operational typography enlarged, and the table region given a label, keyboard focus and an outline. A full rerun passed.
- Screenshot review found an overly dark grid vignette and a cramped percentage sign at tablet width. The grid was made quieter and metric spacing corrected, then rebuilt and recaptured.
- The first Vite build produced a shared chunk warning. Optional FadeContent/GSAP now loads in a separate chunk. The final build reported approximately 390.78 kB minified main JS and 113.08 kB lazy JS (123.40 and 44.49 kB gzip), plus 69.26 kB CSS. These are build outputs, not measured runtime performance improvements.
- Next.js initially inferred the parent repository as its root due to nested lockfiles. The fixture sets its own Turbopack root. Its normal TypeScript configuration normalization was reviewed.
- Running nested npm `ci --prefix` from the skill working directory failed under this npm 12 environment. The portable consumer uses `cwd` explicitly; setup instructions now run `npm ci` inside the installed folder.
- The bundled frontmatter checker did not accept the current specification's optional `compatibility` field. Requirements were moved into the body; the final frontmatter passes that checker and uses the standard name/description/metadata fields.

Qualitative baseline comparison: the final marketing page has a stronger headline hierarchy, a more deliberate serif/sans pairing, and a framed studio illustration that supports the message. The plain baseline remains functional but gives the headline and secondary feature copy less distinct roles. This is an observed design judgment, not a numerical score or a controlled experiment. Much of the visual improvement comes from composition; animation is supplementary.

## Commands actually exercised

```bash
npm ci --ignore-scripts
npm run registry:sync -- --provider react-bits --revision d86fccbd477786f94ca7eb891fbe0ec039d3cd3b --checked-date 2026-10-10 --offline
npm run components:search -- --query "subtle text reveal" --limit 5 --json
npm run validate
npm run typecheck
npm test
npm run format
npm run format:check
npm run examples:create -- --kind vite --offline
npm run examples:create -- --kind next --offline
npm --prefix .local/vite-consumer run build
npm --prefix .local/next-consumer run build
npm --prefix .local/vite-consumer ls --depth=0
npm --prefix .local/next-consumer ls --depth=0
npx playwright install chromium
npm run test:browser
npm run test:live
npm run test:consumer
npm run skill:bundle
```

The generated fixtures were initially installed with `npm install`; their resulting lockfiles are retained for `npm ci` reproduction. The external consumer additionally exercised the actual inspect/install CLI paths through absolute installed script paths. The Node 22 controlled suite, typecheck and search were run using that binary directly. The bundled skill validator was run through an isolated Python environment containing PyYAML. Browser reports and the consumer report are local artifacts; normalized evidence is included in [verification-data.json](verification-data.json).

## Limits and boundary

Chromium on macOS only; no Safari, Firefox, real touch device, screen-reader session, GPU benchmark or broad React/framework compatibility matrix. Axe incomplete contrast findings remain explicit. There is no claim of universal accessibility, SSR support or measured performance risk. Fonts are local system fonts. Settings persistence is session-local; no backend was requested. Some source asset requirements cannot be inferred statically. Source installation reports but does not automatically install dependencies. CLI fallback configuration/installation was not completed. Codex automatic discovery was documented from current official instructions but not activated globally. No global agent configuration was changed.

Aceternity and V2 are documented roadmap items only. The original V1 validation did not publish, push or deploy anything; later npm publication evidence is recorded above. The skill archive does not redistribute React Bits implementations.
