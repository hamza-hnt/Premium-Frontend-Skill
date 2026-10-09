# Validation briefs and component choices

These are original templates for local integration checks, not the product of the skill and not a component library. Running `examples:create` copies our templates, then retrieves the selected upstream source into ignored directories. Preserve each application's `.premium-frontend` manifest and licence files.

## Marketing: Fieldwork

Brief: make a credible landing page for an independent studio workspace. The audience values craft, calm and useful structure. Use warm ivory, forest green, a muted ochre accent, editorial serif headlines and simple sans-serif body copy. Avoid generic neon or glass cards. Communicate the offering, show a believable studio schedule, and provide working navigation into the sample workspace.

Selection: BlurText (one short headline phrase, Motion); ShapeGrid (a faint bounded Canvas 2D hero illustration, React only); FadeContent (one supporting paragraph, GSAP); SpotlightCard (one subtle feature surface, React only). Compose a static layout first. Keep source untouched and adapt with props/wrappers. Plain headline text and a CSS grid replace animated content for reduced motion. A visible pause control stops the illustration and removes its loop. The `/` route has a qualitative baseline at `/?baseline=1`, using plainer typography, unrotated artwork and no animation.

## Dashboard: studio overview

Brief: give the owner a legible summary of studio activity, project progress and upcoming work. Favor a neutral canvas, light sage navigation, consistent tabular figures, restrained status labels and aligned rows. Charts and dense data stay stationary. Small screens retain readable columns in a deliberate table scroll area.

Selection: CountUp for one milestone summary, with a stable accessible final value and direct final number under reduced motion. Native controls switch activity periods, filter projects and display a studio summary. No animated dashboard background or decorative effects around the table.

## Product: workspace settings

Brief: build usable studio settings with labelled fields, native input validation, clear grouping, two notification preferences and visible save feedback. Reuse the workspace brand. Test keyboard-only operation and state changes.

Selection: SquishSwitch provides controlled state and small tactile feedback. A native switch replaces it in reduced motion. A visible focus outline is applied because the source's base classes remove the browser outline. Saving updates session-local feedback; there is no backend or durable persistence.

## Next.js consumer

A distinct App Router application tests a server-rendered outer page and a client boundary containing BlurText, SpotlightCard and SquishSwitch. The first render is static on server and client; effects mount after checking motion preference. It tests hydration, a controlled switch, save feedback and reduced motion. It does not establish compatibility for every component or every Next.js mode.

## Reproduction

From the installed skill, run `npm run examples:create -- --kind vite` and `npm run examples:create -- --kind next`, then follow the emitted npm commands. Generation refuses existing destinations. `--project` accepts a new external directory. The generator copies the tested fixture lockfiles from `examples/locks/` for exact dependency reproduction with `npm ci`. Original templates import upstream components but contain no copied upstream implementation.
