# Selecting from the local catalogue

Translate even a short brief into experience roles before searching: what should draw attention, invite exploration, clarify a change, or help complete a task? Infer the interactive ambition from the product and requested mood. Do not make the user name components to obtain a distinctive result.

Use `components:search` to return roughly five candidates per useful query. Names, categories, upstream descriptions, curated tags and suitable uses contribute deterministically to ranking. No embeddings or model API calls occur. Search is lexical: translate the roles into catalogue terms such as `gallery`, `carousel`, `scroll`, `navigation`, `text`, or `stepper`. A rank expresses relevance to terms, not design quality. Search several relevant categories, including `Components` and `Animations`; do not let a text-reveal query define the whole experience.

Inspect alternatives with `components:inspect` before choosing. For a creative or marketing experience using this skill, integrate actual React Bits components that produce a perceptible, distinctive response in the main journey. A token fade on an incidental element does not satisfy an expressive brief. Match the interaction to content, assets and brand; build a coherent experience instead of accumulating showcase effects or meeting a component-count quota. Prefer an alternative when a candidate cannot meet the project's constraints. Omitting React Bits needs a concrete reason, such as an explicit static design, an existing design system that prohibits the behavior, or an identified compatibility/accessibility constraint that suitable alternatives cannot resolve.

For dashboards, forms and other task-focused interfaces, use components where they clarify navigation, progress, state changes or feedback. Keep repeated work predictable and preserve established primitives where they serve the task better. A lack of functional benefit is a sufficient reason to keep those primitives without adding React Bits. Interactive ambition does not imply ambient motion in every product.

For each selected interaction, record a short implementation intent: **placement → trigger → visible response → required assets → mobile, keyboard and reduced-motion adaptation**. State its role and likely integration cost. Decide whether media must be separate images, layers or cutouts before requesting or generating assets; a flattened composition may prevent the intended interaction. This intent guides implementation and rendered verification, not just a final list of component names.

## Evidence levels

- `description`, category, documentation, preview URL, variant names, dependencies and file lists derive from the official manifests or literal repository metadata.
- SHA-256 hashes bind payloads, files and the licence notice to an immutable Git revision. Every source mapping is checked against the Git blob identity.
- `evidence` is a static source scan. Detected APIs, renderers and reduced-motion references are clues, not runtime verification. Missing references mean `unknown`, not “unsupported.” Peer ranges, accessibility and SSR compatibility remain `unknown` unless separately assessed.
- `annotations` are our curated selection judgments. Performance risk is an estimate, never a measured benchmark. Unsuitable-use notes need interpretation in context.
- Browser evidence applies only to the recorded variant, integration, build, browser and viewport set. `stale` means source changed since the recorded evidence. Do not transfer a TS-TW result to all variants or all applications.

## Filters

`--category` accepts upstream categories: `TextAnimations`, `Animations`, `Components`, `Backgrounds`, `Micro` (case insensitive). `--variant` accepts `JS-CSS`, `JS-TW`, `TS-CSS`, `TS-TW`. Other filters: `--curated`, `--dependency-free`, `--no-webgl`, `--reduced-motion`, `--max-risk low|medium|high`.

Apply filters for actual project constraints, not as a default safety preset. Curated status and prior browser evidence help estimate investigation effort; uncurated or unknown does not mean unsuitable. Starting every search with `--curated --max-risk low --reduced-motion` can remove relevant expressive candidates before inspection.

Filters requiring source evidence exclude unknowns. `--reduced-motion` means a relevant source reference was detected, not that the behavior has passed a browser test. `--no-webgl` excludes statically detected renderer imports, not every indirect GPU dependency. `--dependency-free` means no additional dependencies in the upstream payload; React is still required. A performance filter excludes unenriched entries.

## Routes to investigate

These names exist in the local catalogue. They are alternatives to inspect, not a recipe or a claim of measured performance, accessibility or framework compatibility. Choose a direction that suits this brief rather than repeating the same combination across projects.

| Experience role                  | Possible candidates                        | Selection question                                                               |
| -------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| Explore a collection             | AccordionGallery, DepthCarousel, Masonry   | Does expanding, browsing in depth or scanning a grid help this content?          |
| Sequence a story or reveal media | ScrollStack, ScrollExpand, AnimatedContent | Does the transition articulate a chapter or spatial relationship?                |
| Make navigation expressive       | CardNav, FlowingMenu                       | Does the behavior preserve clear destinations and usable controls?               |
| Establish a typographic entrance | SplitText, TextPressure                    | Does the treatment suit the actual typeface and leave a stable semantic heading? |
| Show progress or changing data   | Stepper, Counter, AnimatedList             | Does motion explain a real state change rather than fabricate activity?          |
| Reveal an alternate visual state | PixelTransition, GlareHover                | Does the visual language belong to the brand and work without hover?             |

Background and cursor effects can support a specific art direction; they do not substitute for content composition or meaningful interactions. Inspect source and dependencies for the chosen variant, then verify the adapted result in its actual application.

## Check that selection reached the experience

Before reporting completion, trace each claimed React Bits component from its installed source to its import and mounted use on the relevant route. A manifest entry, unused import, hidden branch or offscreen demo is not integration evidence. Exercise the trigger in the rendered page and confirm the intended response is perceptible, the controls remain usable and the adaptations work. Report the components actually used and any unverified behavior; do not count native CSS imitations as React Bits integrations.
