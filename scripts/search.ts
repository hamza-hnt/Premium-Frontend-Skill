import { args, cli, json, readCatalogue, required } from "./lib/core.js";
import { search } from "./lib/search.js";
import { readDiscovery } from "./lib/discovery.js";
await cli(async () => {
  const a = args(
    ["query", "limit", "category", "role", "variant", "max-risk"],
    ["json", "no-webgl", "reduced-motion", "dependency-free", "curated"],
  );
  const catalogue = await readCatalogue();
  const results = search(
    catalogue,
    {
      query: required(a.query, "query"),
      limit: a.limit ? Number(a.limit) : 5,
      category: a.category as string,
      role: a.role as string,
      variant: a.variant as string,
      maxRisk: a["max-risk"] as string,
      noWebgl: Boolean(a["no-webgl"]),
      reducedMotion: Boolean(a["reduced-motion"]),
      dependencyFree: Boolean(a["dependency-free"]),
      curated: Boolean(a.curated),
    },
    await readDiscovery(catalogue),
  );
  console.log(
    a.json
      ? json({ results })
      : results.length
        ? results
            .map(
              (c) =>
                `${c.id} — ${c.description}\n  Match: ${c.reasons.join("; ")}\n  Discovery (editorial inference): ${c.discovery?.summary ?? "unavailable"}\n  Roles: ${c.discovery?.roles.join(", ") ?? "unavailable"}\n  ${"shortlistNote" in c ? `${c.shortlistNote}\n  ` : ""}${c.caveats.join("; ")}\n  ${c.documentation}`,
            )
            .join("\n\n")
        : "No matches. Broaden the query or filters.",
  );
});
