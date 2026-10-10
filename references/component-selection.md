# Selecting from the local catalogue

Translate even a short brief into experience roles before searching: what should draw attention, invite exploration, clarify a change, or help complete a task? Infer the interactive ambition from the product and requested mood. Do not make the user name components to obtain a distinctive result.

Use `components:search` to return a small shortlist per useful query. The separate `registry/discovery.json` index gives every catalogued component editorial roles, search terms and a behavior summary, including components without detailed curated notes. Names, upstream descriptions and discovery fields support deterministic lexical retrieval; this is not a visual quality ranking or a model recommendation. No embeddings or model API calls occur. Search both the intended role (`hero`, `editorial`, `gallery`, `navigation`, `feedback`) and its possible behavior (`depth`, `scroll`, `reveal`, `drag`, `transition`). A broad role query is a starting point; refine by content and behavior before choosing.

Inspect different composition families, not just several variants of a text reveal. Broad discovery should expose spatial galleries, media transitions, typography, backgrounds and controls where relevant. Full index coverage makes candidates findable; it does not mean every candidate belongs on every site. Keep the required amount and type of content in view: a gallery built for many images may be a poor fit for a small product range.

Inspect alternatives with `components:inspect` before choosing. For a creative or marketing experience using this skill, integrate actual React Bits components that produce a perceptible, distinctive response in the main journey. A token fade on an incidental element does not satisfy an expressive brief. Match the interaction to content, assets and brand; build a coherent experience instead of accumulating showcase effects or meeting a component-count quota. Prefer an alternative when a candidate cannot meet the project's constraints. Omitting React Bits needs a concrete reason, such as an explicit static design, an existing design system that prohibits the behavior, or an identified compatibility/accessibility constraint that suitable alternatives cannot resolve.

For dashboards, forms and other task-focused interfaces, use components where they clarify navigation, progress, state changes or feedback. Keep repeated work predictable and preserve established primitives where they serve the task better. A lack of functional benefit is a sufficient reason to keep those primitives without adding React Bits. Interactive ambition does not imply ambient motion in every product.

Distinguish a **composition or exploration behavior**, a **refinement**, and **task feedback**. A hover tilt, magnet or text reveal can be an excellent refinement without providing the central experience of an expressive site. Ask what the visitor would lose if the proposed interaction were removed: spatial exploration, a change of scene, a reveal of meaningful content, or only surface polish? Judge the answer against this brief; do not impose a component quota or require spectacle in operational tools.

Before committing the main interaction, compare plausible official previews in motion when browser access is available. Evaluate the actual geometry, trigger, pacing, content requirements and settled state; a name or static thumbnail is insufficient. Prototype the promising behavior with representative content, the chosen typography and real or correctly sized assets in the intended composition. If previews are unavailable, inspect the source and test a local prototype; label anything still unobserved. Do not let a demo's rounded frame, neon palette or default typography silently become the site's art direction.

For each selected interaction, record a short implementation intent: **placement and spatial role → trigger → visible change and visitor benefit → required assets → mobile, keyboard and reduced-motion adaptation**. State its likely integration cost. Decide whether media must be separate images, layers or cutouts before requesting or generating assets; a flattened composition may prevent the intended interaction. Conversely, an immersive background can be the right asset when nothing in it needs independent manipulation. Preserve the strength of the composition when integrating the effect.

## Evidence levels

- `description`, category, documentation, preview URL, variant names, dependencies and file lists derive from the official manifests or literal repository metadata.
- Discovery roles, terms and summaries are editorial interpretations of those descriptions. They support search across the entire catalogue and are distinct from source facts, detailed curation and runtime evidence. They do not certify artistic suitability, performance, accessibility or compatibility.
- SHA-256 hashes bind payloads, files and the licence notice to an immutable Git revision. Every source mapping is checked against the Git blob identity.
- `evidence` is a static source scan. Detected APIs, renderers and reduced-motion references are clues, not runtime verification. Missing references mean `unknown`, not “unsupported.” Peer ranges, accessibility and SSR compatibility remain `unknown` unless separately assessed.
- `annotations` are our curated selection judgments. Performance risk is an estimate, never a measured benchmark. Unsuitable-use notes need interpretation in context.
- Browser evidence applies only to the recorded variant, integration, build, browser and viewport set. `stale` means source changed since the recorded evidence. Do not transfer a TS-TW result to all variants or all applications.

## Filters

`--category` accepts upstream categories: `TextAnimations`, `Animations`, `Components`, `Backgrounds`, `Micro` (case insensitive). `--role` accepts editorial roles: `hero`, `background`, `typography`, `gallery`, `navigation`, `storytelling`, `feedback`, `input`, `decoration`. Roles describe possible uses, not guarantees of fit. `--variant` accepts `JS-CSS`, `JS-TW`, `TS-CSS`, `TS-TW`. Other filters: `--curated`, `--dependency-free`, `--no-webgl`, `--reduced-motion`, `--max-risk low|medium|high`.

Apply filters for actual project constraints, not as a default safety preset. Curated status and prior browser evidence help estimate investigation effort; uncurated or unknown does not mean unsuitable. Starting every search with `--curated --max-risk low --reduced-motion` can remove relevant expressive candidates before inspection.

Filters requiring source evidence exclude unknowns. `--reduced-motion` means a relevant source reference was detected, not that the behavior has passed a browser test. `--no-webgl` excludes statically detected renderer imports, not every indirect GPU dependency. `--dependency-free` means no additional dependencies in the upstream payload; React is still required. A performance filter excludes unenriched entries.

## Routes to investigate

These names exist in the local catalogue. They are alternatives to inspect, not a recipe or a claim of measured performance, accessibility or framework compatibility. Choose a direction that suits this brief rather than repeating the same combination across projects.

| Experience role                   | Possible candidates                          | Selection question                                                                                               |
| --------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Build a spatial collection        | DomeGallery, CircularGallery, FlyingPosters  | Does scale, depth or movement help explore enough distinct content to support this presentation?                 |
| Focus or compare media            | AccordionGallery, DepthCarousel, MorphSlider | What becomes visible or changes emphasis, and can visitors still reach an item directly?                         |
| Develop a scene through scrolling | ScrollExpand, ScrollStack                    | Does the transformation create a meaningful relationship between chapters, media and text?                       |
| Make destinations tangible        | FlowingMenu, CardNav, InfiniteMenu           | Does the spatial treatment clarify the destinations and preserve usable navigation?                              |
| Shape a typographic composition   | MaskedHeading, TextPressure, SplitText       | Does the actual type, wording and scale support the behavior and retain a readable heading?                      |
| Give imagery a material response  | GridDistortion, RippleDistortion             | Does the response belong to this subject and preserve the image's focal point?                                   |
| Establish an atmospheric field    | Silk, LightRays, LiquidEther                 | Does the effect contribute a specific material or lighting character at the right scale?                         |
| Support progress and operations   | Stepper, Counter, AnimatedList               | Does motion explain an actual state change while keeping repeated tasks efficient?                               |
| Refine local feedback             | Magnet, FlipCard, GlareHover                 | Is this a useful detail, and is its role being represented honestly rather than counted as the whole experience? |

These are contrasting families to investigate, not a recommended combination. Atmospheric, playful, technical, editorial and operational projects need different answers. Background and cursor effects can support a specific art direction; they do not substitute for content composition. Assess expensive effects in their intended context and provide suitable fallbacks instead of either rejecting them categorically or choosing them for novelty alone.

## Check that selection reached the experience

Before reporting completion, trace each claimed React Bits component from its installed source to its import and mounted use on the relevant route. A manifest entry, unused import, hidden branch or offscreen demo is not integration evidence. Exercise the trigger and confirm the intended change at the actual viewing scale; do not reduce every expressive property until the behavior disappears. Inspect the settled state too. Compare the adapted prototype to its intended contribution, not just to a successful mount. Report actual use and unverified behavior; do not count native CSS imitations as React Bits integrations.
