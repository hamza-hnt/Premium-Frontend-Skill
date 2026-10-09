# Selecting from the local catalogue

Use `components:search` to return roughly five candidates. Names, categories, upstream descriptions, curated tags and suitable uses contribute deterministically to ranking. No embeddings or model API calls occur. Search is lexical: the consuming agent should translate a brief into terms such as `subtle text reveal`, `settings switch`, or `background grid`. A rank expresses relevance to terms, not design quality.

Inspect a small shortlist with `components:inspect`. Explain why each chosen component improves the composition or interaction and what cost it adds. Prefer the smallest adequate effect and the target's existing primitives. An empty shortlist is a valid outcome.

## Evidence levels

- `description`, category, documentation, preview URL, variant names, dependencies and file lists derive from the official manifests or literal repository metadata.
- SHA-256 hashes bind payloads, files and the licence notice to an immutable Git revision. Every source mapping is checked against the Git blob identity.
- `evidence` is a static source scan. Detected APIs, renderers and reduced-motion references are clues, not runtime verification. Missing references mean `unknown`, not “unsupported.” Peer ranges, accessibility and SSR compatibility remain `unknown` unless separately assessed.
- `annotations` are our curated selection judgments. Performance risk is an estimate, never a measured benchmark. Unsuitable-use notes need interpretation in context.
- Browser evidence applies only to the recorded variant, integration, build, browser and viewport set. `stale` means source changed since the recorded evidence. Do not transfer a TS-TW result to all variants or all applications.

## Filters

`--category` accepts upstream categories: `TextAnimations`, `Animations`, `Components`, `Backgrounds`, `Micro` (case insensitive). `--variant` accepts `JS-CSS`, `JS-TW`, `TS-CSS`, `TS-TW`. Other filters: `--curated`, `--dependency-free`, `--no-webgl`, `--reduced-motion`, `--max-risk low|medium|high`.

Filters requiring source evidence exclude unknowns. `--reduced-motion` means a relevant source reference was detected, not that the behavior has passed a browser test. `--no-webgl` excludes statically detected renderer imports, not every indirect GPU dependency. `--dependency-free` means no additional dependencies in the upstream payload; React is still required. A performance filter excludes unenriched entries.

## Practical choices

For headlines, inspect BlurText or SplitText and keep a stable semantic heading. For a featured surface, consider SpotlightCard while keeping native links/buttons inside. CountUp can support one summary number if the final value is always accessible. For settings, inspect SquishSwitch or SpringCheck and verify role, naming, focus, controlled state and keyboard behavior. For a background, try static styling first; if ShapeGrid or Aurora serves the brief, bound its area and provide a real static fallback.
