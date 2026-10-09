import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { overridesSchema } from "../registry/schema.js";
import { cli, json, readCatalogue, readJson, ROOT } from "./lib/core.js";
await cli(async () => {
  const c = await readCatalogue();
  const annotations = overridesSchema.parse(
    await readJson(resolve(ROOT, "registry/overrides.json")),
  );
  for (const id of Object.keys(annotations))
    if (!c.components.some((c) => c.id === id))
      throw new Error(`Orphan annotation: ${id}`);
  const skill = await readFile(resolve(ROOT, "SKILL.md"), "utf8");
  if (
    !skill.startsWith("---\nname: premium-frontend-skill\n") ||
    !/^description: .+/m.test(skill)
  )
    throw new Error("Invalid skill frontmatter");
  for (const match of skill.matchAll(/\]\((references\/[^)]+)\)/g))
    await readFile(resolve(ROOT, match[1]));
  console.log(
    json({
      valid: true,
      components: c.components.length,
      variants: c.coverage.indexedVariants,
      curated: Object.keys(annotations).length,
      revision: c.revision,
    }),
  );
});
