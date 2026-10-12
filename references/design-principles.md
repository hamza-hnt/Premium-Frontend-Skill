# Composition and visual review

## Make a short brief specific

Understand the brief, audience, primary task and brand before choosing a style. Infer content priorities and emotional character from that context, resolving routine gaps with sensible assumptions. Consider contrasting directions internally, then commit to one coherent direction. State a concise rationale that connects typography, composition and interaction to the subject. Preserve established brand tokens unless redesign is requested.

Set three independent dials before choosing effects or page structure. Use descriptive choices with a short reason, not numerical scores or a questionnaire:

| Dial                | Range                                                   | Decide from                                                                     |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Layout originality  | Familiar task structure to unconventional composition   | Visitor expectations, content relationships and the brief's expressive ambition |
| Motion intensity    | Quiet state feedback to prominent signature transitions | What motion reveals, frequency of use, input methods and accessibility          |
| Information density | Focused editorial pacing to compact operational detail  | Reading needs, comparison tasks, content volume and screen size                 |

A dense dashboard can have a distinctive layout with restrained motion. An expressive campaign can have sparse content and a strong signature transition. Premium does not mean maximizing all three dials or always choosing minimalism.

Vary composition with content: an image-led collection, a type-led event, a narrative service and a dense operational tool have different spatial needs. Change scale, alignment and rhythm through a page while keeping a coherent palette, type hierarchy, spacing and shape language. Repeated structures are useful for comparable items; variation should follow meaning rather than make every section arbitrarily different.

## Compose the first screen

Choose a spatial idea before selecting decorative effects. Depending on the brief, the first screen might be an immersive environment, a typographic statement, an object at unusual scale, an editorial image/text composition, a live product demonstration or an immediately usable workspace. Split layouts and full-bleed backgrounds are both valid when their proportions and content are deliberate; neither is a universal premium formula.

Identify the dominant subject, reading order, primary action and image's role: environment, object, evidence, collection or supporting illustration. Decide how typography occupies the space, how crop and depth direct attention, and how the first screen connects to the next section. If imagery surrounds text, plan readable areas through the full responsive crop and motion range. If the subject is a product interface or information, hierarchy and useful detail can provide the impact without theatrical scenery.

In a redesign, capture the existing first screen at relevant widths and identify its strengths before restructuring it. Preserve a successful subject, framing or spatial relationship unless the brief gives a reason to change it. Compare the new version against that baseline with real copy and assets; inserting a component is not itself an improvement.

## Avoid automatic visual recipes

The following are contextual defaults, not a forbidden style catalogue. A specific brief, brand or functional need can justify a treatment. Be able to explain its role in this project; do not treat its mere presence or absence as a quality score.

- Avoid a default centered oversized headline followed by three identical feature cards, or a sequence of interchangeable hero/grid/testimonial/CTA blocks. Derive section structure from actual content and user actions. A centered heading or three comparable items can be appropriate when the information supports it.
- Choose palette and surfaces for the subject. Purple gradients, neon, glassmorphism on every surface, beige and gold, dark backgrounds, rounded bento cards and cinematic grain do not establish identity by themselves. Use effects and materials where they reinforce the chosen direction; do not apply them to every region.
- Choose type for its letterforms, weight, width, reading conditions and fit to the subject. Do not default to Inter out of habit or select a serif simply to signal "premium." Avoid the recurring Cormorant Garamond/thin high-contrast serif/gold italic formula. Inter and serif typefaces remain valid when justified by the brand and content. Do not replace familiar defaults with a new mandatory pairing or novelty font.
- Prefer upright display type. Avoid ornamental italics that emphasize an arbitrary word to signal luxury. Preserve meaningful emphasis and explicit brand typography; verify real copy, line breaks and reading sizes.
- Do not add terminal periods to short display headings, slogans, navigation labels or buttons. Keep punctuation needed by prose, quotations, abbreviations and meaning.
- Omit decorative badges, numbered sections, colored dots, stars, sparkles, ornamental rules and "Scroll" prompts that convey nothing. Numbering may explain a real sequence; a badge may identify a verified attribute; a dot may communicate a labelled state; a scroll cue may help reveal a non-obvious interaction. Do not fabricate urgency or availability to justify decoration.
- Adapt components to the project instead of shipping their demo identity. Customize content, typography, palette, geometry, dimensions, behavior and responsive states where appropriate. Keep useful behavior and familiar control semantics; customization does not require rewriting everything.
- Do not animate every section, label and control merely because an effect is available. Give motion a content, feedback or expressive role. Preserve strong defining moments when the brief calls for them, with quieter passages between them.

Establish consistent gutters, a clear type scale, deliberate line lengths and useful spacing. Align repeated information and keep the primary action identifiable. Check text against the actual image/background at its least legible state. Images should strengthen a composition that still has hierarchy, useful content and a coherent interaction path of its own.

## Use specific, truthful content

Write about the actual offering, visitor's task and concrete benefit. Replace filler such as "seamless," "unleash" and "next-gen" with what the product does. Preserve terminology required by the brief or brand without multiplying empty claims.

Do not ship placeholder identities such as "Acme" or "John Doe" unless the brief explicitly calls for them or they belong to labelled demo content. Do not invent customers, testimonials, awards, performance claims or suspiciously perfect metrics to make a layout look convincing. Verified round numbers are fine; making up irregular numbers does not make a claim authentic. If evidence is missing, omit the claim or use a clearly identified placeholder in a prototype.

Use relevant supplied/licensed photographs, illustrations and real product captures, or original generated assets when an appropriate tool is available. An invented product screenshot must not masquerade as evidence of a real product. A functional prototype or clearly labelled concept illustration is valid when that is the task. Keep generated atmosphere separate from factual product proof.

Do not use em dashes in newly authored interface or marketing copy. Rewrite with a period, comma or colon. This rule does not call for changing source code operators, official names or supplied text that must remain verbatim.

## Design the interaction character

For an expressive marketing, portfolio or commerce brief, describe the part visitors will remember doing or seeing in concrete terms: what transforms, its scale and trigger, and the content or relationship revealed. A composition that opens into a collection changes how visitors explore; a small hover response adds polish. Both can contribute, but polish alone does not meet an ambitious experience brief. Use real React Bits candidates to develop that behavior before locking the layout, without requiring a fixed number or familiar trio of components.

For a dashboard or frequent-use workflow, interaction quality comes from clear feedback, navigation and state changes. Keep data, reading surfaces, validation and focused controls stable. Do not slow down repeated actions to stage an entrance.

Coordinate amplitude, scale, pacing, easing and triggers with the chosen character. Do not translate every request for quality into lower opacity, shorter travel and an almost invisible effect. Give defining moments enough presence to read, then allow calmer sections around them. Compare plausible demo behavior and prototype with real assets; keep expressive props when they support the concept rather than disabling them reflexively. A candidate should earn its place through a useful or perceptually significant contribution, not its popularity or spectacle alone.

An entrance, a scroll transition and direct manipulation should feel related without sharing an identical animation. Give prominent actions immediate feedback. Avoid competing focal effects, repeated full-section reveals, hover-only meaning, scroll hijacking and animations that delay access to content. Continuous or shader-driven effects are candidates when they serve the experience; assess their runtime cost rather than rejecting or selecting them by default.

Design the states relevant to each real interaction: loading with stable layout, empty results with a useful next action, actionable errors and accurate success feedback. Retain entered values after recoverable errors and prevent accidental duplicate submissions. Do not add fake loading delays or report successful persistence when no save occurred. A prototype may simulate a service if that limitation is explicit.

Plan assets around these spatial and interaction decisions. A generation brief should describe the intended image role, subject placement, desktop/mobile framing, text-safe area and lighting relationship to the interface. Request separate crops, transparent objects, masks or depth layers only when the composition benefits from them. Individually selectable objects need individual assets; a flat composite cannot substitute for an interactive collection. Do not make the image generator supply baked-in UI or essential text.

Reduced-motion support must change behavior. Static branches should not mount canvas/WebGL render loops. Setting speed to zero or adding a CSS media query does not necessarily stop JavaScript animation. Provide a visible pause control for continuous motion where appropriate. Preserve content, useful state feedback and complete functionality in the static and touch adaptations.

## Review after rendering

Inspect narrow, medium and wide viewports with real labels, content length and data density. Review the first screen, transitions between sections, and the page after entrances settle. Trigger and watch motion, including intermediate states; screenshots only show individual states. Compare a static version if the contribution is uncertain. Treat this rubric as questions requiring observations, not a numerical visual score:

- **First screen and hierarchy:** Can a new visitor identify the purpose and primary action? Does the dominant subject have the scale and framing the brief calls for? Does typography belong to the composition rather than appearing pasted over an image? In a redesign, is the result stronger than the captured baseline?
- **Identity:** Could this layout, copy and typography be transferred unchanged to an unrelated product? If so, make the composition more specific to this brief.
- **Content and restraint:** Are claims supported, demo content identified and visuals honest about what exists? Remove generic filler, unadapted demo styling, purposeless decoration and em dashes in authored copy. Are contextual exceptions justified by this brief or brand?
- **Typography:** Are headings and body text legible, intentionally contrasted and comfortably wrapped? Are data labels too small? Have the typography, punctuation and ornament defaults been respected unless explicitly overridden?
- **Spacing and rhythm:** Do repeated groups share alignment? Do transitions and changes of scale give the page a coherent sequence? Is whitespace serving grouping or emphasis rather than hiding missing content?
- **Palette and surfaces:** Does the result fit the brand, preserve contrast and avoid excessive borders/shadows/gradients?
- **Responsiveness:** Are there clipped controls, overlong text, cramped metrics or full-page horizontal scrolling? Deliberate table scrolling should remain usable and labelled by context.
- **Interaction:** Do hover, focus, keyboard, touch and primary actions work? Have relevant loading, error, empty and success states been exercised? Are promised React Bits behaviors visible and reachable in the normal journey?
- **Expressiveness and coherence:** Can you point to the observable moment that meets the brief's ambition? Do the chosen components transform how visitors discover, understand or act on content? Are timing, amplitude and transitions coordinated, without competing for attention or reducing usability?
- **Settled quality:** After animation ends, is the composition still compelling, legible and complete? Do image crops, section endings and static/touch adaptations retain the same hierarchy and identity?
- **Accessibility and performance:** Are reading order, labels, focus and contrast usable, including over moving images? Have asset/dependency weight, layout shifts and responsiveness during loading and interaction been inspected? Follow the integration checklist; record measurements only when actually collected.

Record concrete observations and their consequence, then revise and inspect the affected states again. If the page still feels generic, reconsider composition, content and the defining behavior before adding another effect. A compile success, screenshot capture or absence of automated violations does not establish good design.
