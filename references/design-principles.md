# Composition and visual review

## Make a short brief specific

Infer the visitor, primary action, content priorities and emotional character from the brief and existing product. Resolve routine gaps with sensible assumptions. Consider contrasting directions internally, then commit to one coherent direction rather than presenting a questionnaire or a catalogue of styles. State a concise rationale that connects typography, composition and interaction to the subject. Preserve established brand tokens unless redesign is requested.

Vary composition with content: an image-led collection, a type-led event, a narrative service and a dense operational tool have different spatial needs. Design a sequence of sections with changes in scale and rhythm, rather than repeating interchangeable hero, three-card grid, feature grid, testimonial and CTA blocks. Use concrete copy about the actual offering; do not manufacture statistics, testimonials, awards or generic claims of excellence to fill space.

## Typography and visual defaults

These are defaults for unspecified design choices; an explicit user request or established brand can override them.

- Use upright, legible display type chosen for its letterforms, weight, width and fit to the subject. Avoid Cormorant Garamond as the automatic choice for premium work and the recurring formula of extremely thin high-contrast serif headlines with a gold italic word. Do not replace that formula with a new mandatory font pairing. Compare plausible type directions and verify the chosen font with real copy and line breaks.
- Do not add terminal periods to short display headings, slogans, navigation labels or buttons. Keep punctuation needed by prose, quotations, abbreviations and meaning.
- Avoid ornamental italics used to signal luxury or emphasize a random word. Preserve semantic emphasis when the content requires it; choose its visual treatment deliberately.
- Omit dots, asterisks, sparkles, pill badges, faux availability indicators and ornamental rules that have no informational or brand purpose. A real status may use an indicator with a text label. Existing brand marks and requested motifs are valid exceptions.
- Choose palette and surfaces for the subject. Do not automatically equate premium with beige and gold, dark backgrounds, purple gradients, glass, rounded bento cards, oversized empty spacing or cinematic grain. Use those treatments only when they support the selected direction.

Establish consistent gutters, a clear type scale, deliberate line lengths and useful spacing. Align repeated information and keep the primary action identifiable. Check text against the actual image/background at its least legible state. Images should strengthen a composition that still has hierarchy, useful content and a coherent interaction path of its own.

## Design the interaction character

For an expressive marketing, portfolio or commerce brief, define the part visitors will remember doing or seeing in the main journey: exploring a collection, revealing a narrative, manipulating an object or moving between scenes. Use real React Bits candidates to develop that behavior before locking the layout. An isolated opacity fade or hidden decorative effect does not satisfy this ambition.

For a dashboard or frequent-use workflow, interaction quality comes from clear feedback, navigation and state changes. Keep data, reading surfaces, validation and focused controls stable. Do not slow down repeated actions to stage an entrance.

Coordinate amplitude, pacing, easing and triggers with the chosen character. An entrance, a scroll transition and direct manipulation should feel related without sharing an identical animation. Give prominent actions immediate feedback. Avoid multiple simultaneous focal effects, repeated full-section reveals, hover-only meaning, scroll hijacking and animations that delay access to content. Continuous or shader-driven effects are candidates when they serve the experience; assess their runtime cost rather than rejecting or selecting them by default.

Plan asset separation and crops around the interactions. Individually selectable objects need individual assets; a flat composite cannot substitute for an interactive collection. Do not make the image generator supply baked-in UI or essential text.

Reduced-motion support must change behavior. Static branches should not mount canvas/WebGL render loops. Setting speed to zero or adding a CSS media query does not necessarily stop JavaScript animation. Provide a visible pause control for continuous motion where appropriate. Preserve content, useful state feedback and complete functionality in the static and touch adaptations.

## Review after rendering

Inspect narrow, medium and wide viewports. Use real labels, content length and data density. Trigger and watch the motion, including its intermediate states; screenshots only show individual states. Compare a static version if the contribution is uncertain. Treat this rubric as questions requiring observations, not a numerical visual score:

- **Hierarchy:** Can a new visitor identify the purpose and primary action? Does the first screen prioritize meaningful content?
- **Identity:** Could this layout, copy and typography be transferred unchanged to an unrelated product? If so, make the composition more specific to this brief.
- **Typography:** Are headings and body text legible, intentionally contrasted and comfortably wrapped? Are data labels too small? Have the typography, punctuation and ornament defaults been respected unless explicitly overridden?
- **Spacing and alignment:** Do repeated groups share alignment and a coherent rhythm? Is whitespace serving grouping rather than hiding missing content?
- **Palette and surfaces:** Does the result fit the brand, preserve contrast and avoid excessive borders/shadows/gradients?
- **Responsiveness:** Are there clipped controls, overlong text, cramped metrics or full-page horizontal scrolling? Deliberate table scrolling should remain usable and labelled by context.
- **Interaction:** Do hover, focus, keyboard, touch, validation and saved-state feedback work? Are promised React Bits behaviors actually visible and reachable in the normal journey?
- **Expressiveness and coherence:** Does the experience meet the brief's interactive ambition? Do the chosen components transform how visitors discover, understand or act on the content? Are timing, amplitude and transitions coordinated, without competing for attention or reducing usability?

Record observations, revise the rendered result, and inspect again. A compile success, screenshot capture or absence of automated violations does not establish good design.
