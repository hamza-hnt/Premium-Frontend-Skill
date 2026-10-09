# Composition and visual review

## Establish direction before choosing effects

Write a short design statement: who the interface serves, what they need to understand or do first, and what visual character fits the brand. Name the type hierarchy, spacing rhythm, palette roles, surface treatment and motion budget. Preserve existing design tokens unless redesign is requested.

A marketing page can support one distinctive focal point. An operational dashboard should communicate data and state with stable alignment and restrained motion. A functional application should invest in labels, validation, navigation, focus and feedback. Do not turn these into three copies of the same aesthetic.

Build with the project's typography and primitives. Match line lengths to content, establish consistent gutters, give headings deliberate scale, and align repeated information. Use color for a small number of roles. Check contrast against the actual background, including the dimmest phase of gradients or effects. Use status text in addition to color.

## Motion budget

Choose an effect because it directs attention, explains state or conveys a relevant brand quality. Start with no continuous motion. A hero might justify one bounded background and one short entrance; a dashboard might need only a small state transition. These are examples, not quotas. Avoid multiple competing effects. Do not animate dense data, essential navigation, validation text or focused controls merely to add movement.

Reduced-motion support must change behavior. Static branches should not mount canvas/WebGL render loops. Setting speed to zero or adding a CSS media query does not necessarily stop JavaScript animation. Provide a visible pause control for continuous motion where appropriate. Keep the complete content and function available without an effect.

## Review after rendering

Inspect narrow, medium and wide viewports. Use real labels, content length and data density. Compare at least one static version if the benefit of an effect is uncertain. Treat this rubric as questions requiring observations, not a numerical visual score:

- **Hierarchy:** Can a new visitor identify the purpose and primary action? Does the first screen prioritize meaningful content?
- **Typography:** Are headings and body text legible, intentionally contrasted and comfortably wrapped? Are data labels too small?
- **Spacing and alignment:** Do repeated groups share alignment and a coherent rhythm? Is whitespace serving grouping rather than hiding missing content?
- **Palette and surfaces:** Does the result fit the brand, preserve contrast and avoid excessive borders/shadows/gradients?
- **Responsiveness:** Are there clipped controls, overlong text, cramped metrics or full-page horizontal scrolling? Deliberate table scrolling should remain usable and labelled by context.
- **Interaction:** Do hover, focus, keyboard, touch, validation and saved-state feedback work? Does animation obscure anything?
- **Restraint:** Can an effect be removed without losing intended meaning? Is one effect stealing attention from the main task?

Record observations, revise the rendered result, and inspect again. A compile success, screenshot capture or absence of automated violations does not establish good design.
