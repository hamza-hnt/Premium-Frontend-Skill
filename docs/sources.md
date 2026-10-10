# Verified upstream sources and extraction

Checked on **2026-10-10**. This document describes the source snapshot, not a claim that the live website will remain unchanged.

| Source                                                                                                                                               | Purpose                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [React Bits](https://reactbits.dev)                                                                                                                  | Official documentation and previews                                                                                   |
| [Official repository](https://github.com/DavidHDev/react-bits)                                                                                       | Immutable source and licence authority                                                                                |
| [Pinned revision](https://github.com/DavidHDev/react-bits/tree/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b)                                             | Initial V1 snapshot; commit date 2026-10-09                                                                           |
| [Registry index](https://github.com/DavidHDev/react-bits/blob/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/public/r/registry.json)                       | Structured discovery of all supported items                                                                           |
| [Component metadata](https://github.com/DavidHDev/react-bits/blob/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/constants/Information.js)             | Category, documentation URL and preview reference                                                                     |
| [Registry builder](https://github.com/DavidHDev/react-bits/blob/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/jsrepo.config.ts)                           | Verified source roots and variant construction                                                                        |
| [Installation documentation source](https://github.com/DavidHDev/react-bits/blob/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/docs/Installation.jsx) | Official shadcn/jsrepo command syntax and manual copy workflow                                                        |
| [Agent Skills specification](https://agentskills.io/specification)                                                                                   | Frontmatter, naming, resource layout and progressive disclosure                                                       |
| [Codex local skill instructions](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills)                                         | Repository/user skill locations and symlink support; reached through the official Codex skills documentation redirect |

## Discovery and grouping

`public/r/registry.json` contains **860 items**. Each item names one of four variants. They group into **215 logical components** across `Animations`, `TextAnimations`, `Components`, `Backgrounds` and `Micro`. All 860 items in this manifest are indexed; none are silently discarded. **All 215 components** have separately maintained editorial discovery roles, terms and behavior summaries in `registry/discovery.json`. **20 logical components** additionally have detailed curated notes in `registry/overrides.json`. Discovery metadata interprets upstream descriptions for selection; it does not confer curated status or runtime evidence.

The adapter reads the structured index, each `public/r/Name-VARIANT.json` payload, literal fields from `src/constants/Information.js`, the repository tree and `LICENSE.md`. It uses the TypeScript 5.9.3 parser to inspect object literals and imports. It never imports/evaluates upstream JavaScript or executes upstream build scripts. The TypeScript version is pinned because TypeScript 7 changed the public compiler API surface used here.

Verified variant roots:

| Variant | Repository root                     |
| ------- | ----------------------------------- |
| JS-CSS  | `src/content/{category}/{name}`     |
| JS-TW   | `src/tailwind/{category}/{name}`    |
| TS-CSS  | `src/ts-default/{category}/{name}`  |
| TS-TW   | `src/ts-tailwind/{category}/{name}` |

The adapter matches payload file bytes to repository Git blob hashes within the correct variant folder. All initial file mappings resolved. Catalogue files store paths, sizes and SHA-256 hashes, never source text. A variant payload may contain multiple files, including styles. Registry file `target` hints are not trusted as destination paths; the installer keeps local imports together in one component directory. The current registry has no registry-to-registry dependencies. Future unsupported dependencies fail safely rather than generating a partial installation.

## Editorial discovery checks

The discovery index preserves the raw upstream descriptions in the catalogue while providing separately labelled behavior summaries. Some manifest descriptions were imprecise. Targeted inspection of pinned TS-CSS source informed these corrections; this is source reading, not rendered verification:

- [FlowingMenu](https://github.com/DavidHDev/react-bits/blob/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Components/FlowingMenu/FlowingMenu.tsx): reveals a repeating image/text marquee on hover.
- [GradualBlur](https://github.com/DavidHDev/react-bits/blob/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Animations/GradualBlur/GradualBlur.tsx): overlays progressively blurred edges, with optional visibility/hover animation.
- [FadeContent](https://github.com/DavidHDev/react-bits/blob/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Animations/FadeContent/FadeContent.tsx): animates opacity and optional blur, rather than directional sliding.
- [FallingText](https://github.com/DavidHDev/react-bits/blob/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/TextAnimations/FallingText/FallingText.tsx): applies physics to whole words.
- [CircularGallery](https://github.com/DavidHDev/react-bits/blob/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Components/CircularGallery/CircularGallery.tsx): presents a looping track with curvature.
- [AnimatedList](https://github.com/DavidHDev/react-bits/blob/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/src/ts-default/Components/AnimatedList/AnimatedList.tsx): supports item selection and scale/opacity entrances.

Roles and usage terms remain editorial suggestions. Check the selected variant and its adapted behavior before relying on a summary or claiming compatibility.

## Provenance and licence

The actual [licence at the pinned revision](https://github.com/DavidHDev/react-bits/blob/d86fccbd477786f94ca7eb891fbe0ec039d3cd3b/LICENSE.md) is labelled **MIT + Commons Clause License Condition v1.0**, with copyright attributed to David Haz, 2026. It permits inclusion in applications, websites or products subject to its conditions and restricts selling, sublicensing or redistributing the components themselves. This is not represented here as unmodified MIT. Read the linked text for the complete terms.

The full exact notice is downloaded with source, hash-verified, and preserved under the consuming application's `.premium-frontend/licences/`. The initial notice SHA-256 is `f4c33af6739191537738662d223b68d77bc226f4b57ea883e16481d8cc5c73c9`. Copied code may contain additional notices; the installer preserves bytes rather than stripping comments. Runtime dependencies have their own terms.

This skill distributes discovery metadata, our annotations, our scripts, and our original fixture templates. It does not bundle React Bits implementations, media or a fork. The upstream clone, downloaded payloads, generated applications and screenshots are local ignored files. Pro manifests, premium preview areas (`rbp`, Pro assets), paid components and site tools are outside discovery. No publication, push or deployment is performed.

## Determinism and network behavior

A sync resolves one immutable commit before reading any metadata. New clones use a shallow sparse cache; existing cache checkouts are not used as mutable source authority. Git object reads use the resolved revision. The initial inspection clone is ignored and is not a manually maintained fork.

For the same revision, annotations, previous evidence and checked date, sync produces identical catalogue bytes. It validates before atomic replacement, reports added/changed/removed logical IDs and preserves the previous catalogue on failure. Orphan annotations and missing or stale discovery IDs block sync for review. Discovery entries remain separate from source metadata; review their behavior summaries after relevant upstream changes. Source fingerprints include all variant payload hashes and the licence hash. Changed source invalidates prior browser evidence. Advancing to a new commit without a source change does not by itself claim a component changed.

Search and inspection read the committed metadata snapshot offline after npm tooling setup. Dry-run installation also works offline. Sync needs Git and normally network; `--offline` uses cached Git objects. Applying uncached source needs HTTPS access to `raw.githubusercontent.com` or the pinned object in the local clone. Downloads reject redirects, unexpected source locations, oversized responses and hash mismatches. Cached bytes are revalidated. Offline object reads use Git’s `--no-lazy-fetch` option, so missing blobs fail instead of silently fetching. A fully cached snapshot is required for offline sync. [Git documents this option](https://git-scm.com/docs/git#Documentation/git.txt---no-lazy-fetch).

## Limits discovered

- StaggeredMenu **JS-TW** imports a TS-CSS implementation outside its payload. That variant is indexed but automatic installation is blocked for the unresolved import. Its other variants do not have this detected issue.
- Dependencies are upstream registry requirements, not proof of peer compatibility with every React/framework version. Upstream excludes React from the payload dependency list; peer support remains unknown.
- Static scans miss computed imports, dynamic asset paths, indirect browser APIs and runtime behavior. A reduced-motion reference is only source evidence. Accessibility and SSR remain unknown until integration checks.
- Documentation and video URLs are live references extracted from upstream metadata. Their content is not pinned or bundled. Installation code and notices are pinned.
- The free registry is the supported coverage boundary. Files outside it are not counted as missing catalogue entries.
- shadcn **4.21.4** help confirms `add`, `--cwd` and `--dry-run`. An attempted dry run without shadcn configuration stopped at its configuration prompt; no fallback install is claimed. Direct retrieval avoids that requirement.
