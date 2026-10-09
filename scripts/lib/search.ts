import type { Catalogue, Component } from "../../registry/schema.js";
export interface SearchOptions {
  query: string;
  limit?: number;
  category?: string;
  variant?: string;
  maxRisk?: string;
  noWebgl?: boolean;
  reducedMotion?: boolean;
  dependencyFree?: boolean;
  curated?: boolean;
}
const words = (text: string) =>
  text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .match(/[a-z0-9]+/g) ?? [];
export function search(catalogue: Catalogue, o: SearchOptions) {
  const limit = o.limit ?? 5;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50)
    throw new Error("Limit must be an integer from 1 to 50");
  const risk = ["low", "medium", "high"];
  if (o.maxRisk && !risk.includes(o.maxRisk))
    throw new Error("max-risk must be low, medium, or high");
  const terms = [...new Set(words(o.query))];
  return catalogue.components
    .flatMap((c) => {
      const a = c.annotations;
      if (
        (o.category && o.category.toLowerCase() !== c.category.toLowerCase()) ||
        (o.curated && !a)
      )
        return [];
      if (
        o.maxRisk &&
        (!a ||
          a.performance.risk === "unknown" ||
          risk.indexOf(a.performance.risk) > risk.indexOf(o.maxRisk))
      )
        return [];
      const variants = c.variants.filter(
        (v) =>
          (!o.variant || v.name === o.variant) &&
          (!o.noWebgl || !v.evidence.rendering.includes("webgl")) &&
          (!o.reducedMotion ||
            v.evidence.reducedMotion === "reference-detected") &&
          (!o.dependencyFree || v.dependencies.length === 0),
      );
      if (!variants.length) return [];
      const fields: [string, string, number][] = [
        ["name", c.name.replace(/([a-z])([A-Z])/g, "$1 $2") + " " + c.id, 8],
        ["category", c.category, 3],
        ["description", c.description, 2],
        ["tags", a?.tags.join(" ") ?? "", 6],
        ["suitable use", a?.suitable.join(" ") ?? "", 4],
      ];
      let score = 0;
      const reasons: string[] = [];
      for (const term of terms)
        for (const [name, text, weight] of fields)
          if (
            words(text).some(
              (w) => w === term || (term.length > 3 && w.startsWith(term)),
            )
          ) {
            score += weight;
            reasons.push(`${name}: ${term}`);
          }
      if (terms.length && !score) return [];
      if (a) score += 1;
      return [
        {
          id: c.id,
          name: c.name,
          category: c.category,
          description: c.description,
          score,
          reasons: [...new Set(reasons)].slice(0, 6),
          variants: variants.map((v) => v.name),
          caveats: caveats(c),
          documentation: c.documentation,
          verification: c.verification,
        },
      ];
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id, "en"))
    .slice(0, limit);
}
export function caveats(c: Component) {
  return [
    c.annotations
      ? `Performance risk: ${c.annotations.performance.risk} (estimate)`
      : "Design annotations: unreviewed",
    `Browser evidence: ${c.verification.browser}`,
    ...(!c.variants.every(
      (v) => v.evidence.reducedMotion === "reference-detected",
    )
      ? ["Reduced-motion behavior needs review or a static fallback"]
      : ["Reduced-motion references found; behavior still needs validation"]),
    ...(c.variants.some((v) => v.evidence.unresolvedImports.length)
      ? [
          "Some variants have unresolved local imports; inspect before installation",
        ]
      : []),
    "Peer compatibility, SSR and accessibility are not certified by static analysis",
  ];
}
