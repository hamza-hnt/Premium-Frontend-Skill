import { args, cli, json, readCatalogue, required } from "./lib/core.js";
import { search } from "./lib/search.js";
await cli(async () => {
  const a = args(
    ["query", "limit", "category", "variant", "max-risk"],
    ["json", "no-webgl", "reduced-motion", "dependency-free", "curated"],
  );
  const results = search(await readCatalogue(), {
    query: required(a.query, "query"),
    limit: a.limit ? Number(a.limit) : 5,
    category: a.category as string,
    variant: a.variant as string,
    maxRisk: a["max-risk"] as string,
    noWebgl: Boolean(a["no-webgl"]),
    reducedMotion: Boolean(a["reduced-motion"]),
    dependencyFree: Boolean(a["dependency-free"]),
    curated: Boolean(a.curated),
  });
  console.log(
    a.json
      ? json({ results })
      : results.length
        ? results
            .map(
              (c) =>
                `${c.id} — ${c.description}\n  Match: ${c.reasons.join("; ")}\n  ${c.caveats.join("; ")}\n  ${c.documentation}`,
            )
            .join("\n\n")
        : "No matches. Broaden the query or filters.",
  );
});
