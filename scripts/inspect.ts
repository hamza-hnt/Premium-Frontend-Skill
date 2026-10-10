import {
  args,
  cli,
  componentById,
  json,
  readCatalogue,
  required,
} from "./lib/core.js";
import { readDiscovery } from "./lib/discovery.js";
import { discoveryGuidance } from "./lib/search.js";
await cli(async () => {
  const a = args(["id"], ["json"]);
  const catalogue = await readCatalogue();
  const c = componentById(catalogue, required(a.id, "id"));
  const discovery = discoveryGuidance(
    (await readDiscovery(catalogue)).components[c.id],
  );
  console.log(
    a.json
      ? json({ ...c, discovery })
      : `${c.id} — ${c.description}\n${c.documentation}\nRevision: ${c.revision}\nCategory: ${c.category}\nVerification: ${json(c.verification)}\nVariants:\n${c.variants.map((v) => `  ${v.name}: ${v.files.length} files; dependencies: ${v.dependencies.join(", ") || "React only"}; reduced motion: ${v.evidence.reducedMotion}`).join("\n")}\n\nDiscovery (editorial inference, not source verification):\n${json(discovery)}\nDesign guidance (curated inference):\n${c.annotations ? json(c.annotations) : "Unreviewed. Inspect source and docs before choosing."}\nLicence: ${c.licence.url}`,
  );
});
