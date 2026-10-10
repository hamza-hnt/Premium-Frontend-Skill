# Composition and visual review

## Make a short brief specific

Infer the visitor, primary action, content priorities and emotional character from the brief and existing product. Resolve routine gaps with sensible assumptions. Consider contrasting directions internally, then commit to one coherent direction rather than presenting a questionnaire or a catalogue of styles. State a concise rationale that connects typography, composition and interaction to the subject. Preserve established brand tokens unless redesign is requested.

Vary composition with content: an image-led collection, a type-led event, a narrative service and a dense operational tool have different spatial needs. Design a sequence of sections with changes in scale and rhythm, rather than repeating interchangeable hero, three-card grid, feature grid, testimonial and CTA blocks. Use concrete copy about the actual offering; do not manufacture statistics, testimonials, awards or generic claims of excellence to fill space.

## Compose the first screen

Choose a spatial idea before selecting decorative effects. Depending on the brief, the first screen might be an immersive environment, a typographic statement, an object at unusual scale, an editorial image/text composition, a live product demonstration or an immediately usable workspace. Split layouts and full-bleed backgrounds are both valid when their proportions and content are deliberate; neither is a universal premium formula.

Identify the dominant subject, reading order, primary action and image's role: environment, object, evidence, collection or supporting illustration. Decide how typography occupies the space, how crop and depth direct attention, and how the first screen connects to the next section. If imagery surrounds text, plan readable areas through the full responsive crop and motion range. If the subject is a product interface or information, hierarchy and useful detail can provide the impact without theatrical scenery.

In a redesign, capture the existing first screen at relevant widths and identify its strengths before restructuring it. Preserve a successful subject, framing or spatial relationship unless the brief gives a reason to change it. Compare the new version against that baseline with real copy and assets; inserting a component is not itself an improvement.

## Typography and visual defaults

These are defaults for unspecified design choices; an explicit user request or established brand can override them.

- Use upright, legible display type chosen for its letterforms, weight, width and fit to the subject. Avoid Cormorant Garamond as the automatic choice for premium work and the recurring formula of extremely thin high-contrast serif headlines with a gold italic word. Do not replace that formula with a new mandatory font pairing. Compare plausible type directions and verify the chosen font with real copy and line breaks.
- Do not add terminal periods to short display headings, slogans, navigation labels or buttons. Keep punctuation needed by prose, quotations, abbreviations and meaning.
- Avoid ornamental italics used to signal luxury or emphasize a random word. Preserve semantic emphasis when the content requires it; choose its visual treatment deliberately.
- Omit dots, asterisks, sparkles, pill badges, faux availability indicators and ornamental rules that have no informational or brand purpose. A real status may use an indicator with a text label. Existing brand marks and requested motifs are valid exceptions.
- Choose palette and surfaces for the subject. Do not automatically equate premium with beige and gold, dark backgrounds, purple gradients, glass, rounded bento cards, oversized empty spacing or cinematic grain. Use those treatments only when they support the selected direction.

Establish consistent gutters, a clear type scale, deliberate line lengths and useful spacing. Align repeated information and keep the primary action identifiable. Check text against the actual image/background at its least legible state. Images should strengthen a composition that still has hierarchy, useful content and a coherent interaction path of its own.

## Design the interaction character

For an expressive marketing, portfolio or commerce brief, describe the part visitors will remember doing or seeing in concrete terms: what transforms, its scale and trigger, and the content or relationship revealed. A composition that opens into a collection changes how visitors explore; a small hover response adds polish. Both can contribute, but polish alone does not meet an ambitious experience brief. Use real React Bits candidates to develop that behavior before locking the layout, without requiring a fixed number or familiar trio of components.

For a dashboard or frequent-use workflow, interaction quality comes from clear feedback, navigation and state changes. Keep data, reading surfaces, validation and focused controls stable. Do not slow down repeated actions to stage an entrance.

Coordinate amplitude, scale, pacing, easing and triggers with the chosen character. Do not translate every request for quality into lower opacity, shorter travel and an almost invisible effect. Give defining moments enough presence to read, then allow calmer sections around them. Compare plausible demo behavior and prototype with real assets; keep expressive props when they support the concept rather than disabling them reflexively. A candidate should earn its place through a useful or perceptually significant contribution, not its popularity or spectacle alone.

An entrance, a scroll transition and direct manipulation should feel related without sharing an identical animation. Give prominent actions immediate feedback. Avoid competing focal effects, repeated full-section reveals, hover-only meaning, scroll hijacking and animations that delay access to content. Continuous or shader-driven effects are candidates when they serve the experience; assess their runtime cost rather than rejecting or selecting them by default.

Plan assets around these spatial and interaction decisions. A generation brief should describe the intended image role, subject placement, desktop/mobile framing, text-safe area and lighting relationship to the interface. Request separate crops, transparent objects, masks or depth layers only when the composition benefits from them. Individually selectable objects need individual assets; a flat composite cannot substitute for an interactive collection. Do not make the image generator supply baked-in UI or essential text.

Reduced-motion support must change behavior. Static branches should not mount canvas/WebGL render loops. Setting speed to zero or adding a CSS media query does not necessarily stop JavaScript animation. Provide a visible pause control for continuous motion where appropriate. Preserve content, useful state feedback and complete functionality in the static and touch adaptations.

## Review after rendering

Inspect narrow, medium and wide viewports with real labels, content length and data density. Review the first screen, transitions between sections, and the page after entrances settle. Trigger and watch motion, including intermediate states; screenshots only show individual states. Compare a static version if the contribution is uncertain. Treat this rubric as questions requiring observations, not a numerical visual score:

- **First screen and hierarchy:** Can a new visitor identify the purpose and primary action? Does the dominant subject have the scale and framing the brief calls for? Does typography belong to the composition rather than appearing pasted over an image? In a redesign, is the result stronger than the captured baseline?
- **Identity:** Could this layout, copy and typography be transferred unchanged to an unrelated product? If so, make the composition more specific to this brief.
- **Typography:** Are headings and body text legible, intentionally contrasted and comfortably wrapped? Are data labels too small? Have the typography, punctuation and ornament defaults been respected unless explicitly overridden?
- **Spacing and rhythm:** Do repeated groups share alignment? Do transitions and changes of scale give the page a coherent sequence? Is whitespace serving grouping or emphasis rather than hiding missing content?
- **Palette and surfaces:** Does the result fit the brand, preserve contrast and avoid excessive borders/shadows/gradients?
- **Responsiveness:** Are there clipped controls, overlong text, cramped metrics or full-page horizontal scrolling? Deliberate table scrolling should remain usable and labelled by context.
- **Interaction:** Do hover, focus, keyboard, touch, validation and saved-state feedback work? Are promised React Bits behaviors actually visible and reachable in the normal journey?
- **Expressiveness and coherence:** Can you point to the observable moment that meets the brief's ambition? Do the chosen components transform how visitors discover, understand or act on content? Are timing, amplitude and transitions coordinated, without competing for attention or reducing usability?
- **Settled quality:** After animation ends, is the composition still compelling, legible and complete? Do image crops, section endings and static/touch adaptations retain the same hierarchy and identity?

Record concrete observations and their consequence, then revise and inspect the affected states again. If the page still feels generic, reconsider composition, content and the defining behavior before adding another effect. A compile success, screenshot capture or absence of automated violations does not establish good design.
