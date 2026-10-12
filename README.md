<div align="center">

# Premium frontend skill

**Turn a short brief into a distinctive React experience.**

Art direction, purposeful [React Bits](https://reactbits.dev) interactions, and visual review — in a reusable coding-agent skill.

[Install](#install) · [Use it](#use-it) · [Examples](examples/briefs.md) · [Documentation](docs/installation.md)

</div>

---

## What you get

- **A design workflow:** composition, typography, assets, responsive layouts and motion, adapted to your brief.
- **A complete React Bits index:** 215 components and 860 implementation variants, with searchable guidance for every component.
- **Real component integration:** pinned source, integrity checks and protection for existing project files.
- **A review process:** inspect the experience on desktop and mobile, in motion and with reduced motion enabled.

Use it for landing pages, portfolios, shops, dashboards or improving an existing React app. The skill guides your agent; your brief and brand rules determine the style.

## Install

You need **Node.js 22.12 or newer, below 27**, npm, and Git for the clone step.

```bash
git clone https://github.com/hamza-hnt/Premium-Frontend-Skill.git premium-frontend-skill
cd premium-frontend-skill
npm ci --include=dev
npm run skill:install
```

The installer copies the full skill to `~/.codex/skills/premium-frontend-skill`, installs its dependencies and validates it. If you set `CODEX_HOME`, it uses that directory's `skills/` folder instead. No separate build step is needed to use the skill.

To choose a different location, pass the **complete destination folder**:

```bash
npm run skill:install -- --dest "$HOME/.agents/skills/premium-frontend-skill"
```

Already installed? See [updates and backups](docs/installation.md#updates). The installer refuses to overwrite an existing installation unless you explicitly request an update.

<details>
<summary>Future one-command installation with npx</summary>

The npm package has **not been published yet**. After publication, the intended command is:

```bash
npx premium-frontend-skill@latest install
```

Until then, use the GitHub installation above. Maintainers can [build and test the npm package locally](docs/installation.md#package-and-test-the-installer).

</details>

## Use it

Open your React project in Codex and mention the skill:

> Use $premium-frontend-skill to build a distinctive website for an independent ceramics studio, with expressive React Bits interactions and a polished mobile experience.

For original visuals, add:

> Use ImageGen to create the backgrounds and visual assets before implementation, with crops and composition planned for the layout.

Image generation requires an image-generation tool available to your agent. If the skill does not appear, restart Codex or ask the agent to read the installed `SKILL.md`.

## How it works

1. **Find the direction.** Turn your brief into a composition, visual language and intended experience.
2. **Choose the interactions.** Search the catalogue, inspect candidates and compare official demos when browser access is available.
3. **Build the experience.** Prepare assets, retrieve selected component source and adapt it to the project.
4. **Review the result.** Check layout, motion, usability, accessibility and responsive behavior; refine what does not work.

There is no fixed visual style or component quota. A portfolio can be expressive; a frequently used dashboard should prioritize clear, stable interactions. Local search works offline after setup; uncached component downloads need an internet connection.

## Explore further

| Looking for…                                 | Start here                                                                                               |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Custom paths, updates and troubleshooting    | [Installation guide](docs/installation.md)                                                               |
| Example briefs and test applications         | [Examples](examples/briefs.md)                                                                           |
| Component selection and integration guidance | [Selection](references/component-selection.md) · [Integration](references/integration-and-validation.md) |
| Catalogue sources, licensing and limitations | [Sources](docs/sources.md)                                                                               |
| Checks performed and their scope             | [Verification](docs/verification.md)                                                                     |

The repository includes the skill instructions, references, catalogue and command-line tools. React Bits implementation code is retrieved on demand, with its pinned upstream licence notice preserved. See [sources and licensing](docs/sources.md) before redistributing component code.

Contributors can run `npm test`, `npm run validate` and `npm run test:installer`. Packaging and additional checks are described in the [installation guide](docs/installation.md#package-and-test-the-installer).
