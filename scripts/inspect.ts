import {
  args,
  cli,
  componentById,
  json,
  readCatalogue,
  required,
} from "./lib/core.js";
await cli(async () => {
  const a = args(["id"], ["json"]);
  const c = componentById(await readCatalogue(), required(a.id, "id"));
  console.log(
    a.json
      ? json(c)
      : `${c.id} — ${c.description}\n${c.documentation}\nRevision: ${c.revision}\nCategory: ${c.category}\nVerification: ${json(c.verification)}\nVariants:\n${c.variants.map((v) => `  ${v.name}: ${v.files.length} files; dependencies: ${v.dependencies.join(", ") || "React only"}; reduced motion: ${v.evidence.reducedMotion}`).join("\n")}\n\nDesign guidance (curated inference):\n${c.annotations ? json(c.annotations) : "Unreviewed. Inspect source and docs before choosing."}\nLicence: ${c.licence.url}`,
  );
});
