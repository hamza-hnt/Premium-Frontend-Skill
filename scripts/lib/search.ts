import {
  discoveryRole,
  type Catalogue,
  type Component,
  type Discovery,
  type DiscoveryDescriptor,
} from "../../registry/schema.js";
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
  role?: string;
}
const words = (text: string) =>
  text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .match(/[a-z0-9]+/g) ?? [];
const identity = (text: string) => words(text).join("");
const broadUses = new Set([
  ...discoveryRole.options,
  "editorial",
  "immersive",
  "cinematic",
]);
export function search(
  catalogue: Catalogue,
  o: SearchOptions,
  discovery?: Discovery,
) {
  const limit = o.limit ?? 5;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50)
    throw new Error("Limit must be an integer from 1 to 50");
  const risk = ["low", "medium", "high"];
  if (o.maxRisk && !risk.includes(o.maxRisk))
    throw new Error("max-risk must be low, medium, or high");
  if (o.role) {
    discoveryRole.parse(o.role);
    if (!discovery)
      throw new Error("A discovery index is required for role filters");
  }
  const terms = [...new Set(words(o.query))];
  const matches = catalogue.components
    .flatMap((c) => {
      const a = c.annotations;
      const d = discovery?.components[c.id];
      if (
        (o.category && o.category.toLowerCase() !== c.category.toLowerCase()) ||
        (o.curated && !a) ||
        (o.role && !d?.roles.some((role) => role === o.role))
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
        ["discovery role", d?.roles.join(" ") ?? "", 4],
        ["discovery terms", d?.terms.join(" ") ?? "", 4],
        ["discovery summary", d?.summary ?? "", 3],
        ["curated tags", a?.tags.join(" ") ?? "", 2],
        ["curated suitable use", a?.suitable.join(" ") ?? "", 1],
      ];
      let score = 0;
      let matchedTermCount = 0;
      const reasons: string[] = [];
      for (const term of terms) {
        let best = 0;
        let reason = "";
        for (const [name, text, weight] of fields)
          if (
            words(text).some(
              (w) => w === term || (term.length > 3 && w.startsWith(term)),
            )
          ) {
            if (weight > best) {
              best = weight;
              reason = `${name}: ${term}`;
            }
          }
        score += best;
        if (reason) {
          matchedTermCount++;
          reasons.push(reason);
        }
      }
      const exact =
        Boolean(terms.length) &&
        [c.id, c.name, c.id.split(":")[1]].some(
          (name) => identity(name) === identity(o.query),
        );
      if (terms.length && !score && !exact) return [];
      if (exact) {
        score += 1000;
        reasons.unshift("exact name or ID");
      }
      return [
        {
          id: c.id,
          name: c.name,
          category: c.category,
          description: c.description,
          discovery: discoveryGuidance(d),
          exactMatch: exact,
          matchedTermCount,
          score,
          reasons: [...new Set(reasons)].slice(0, 6),
          variants: variants.map((v) => v.name),
          caveats: caveats(c),
          documentation: c.documentation,
          verification: c.verification,
        },
      ];
    })
    .sort(
      (a, b) =>
        Number(b.exactMatch) - Number(a.exactMatch) ||
        b.matchedTermCount - a.matchedTermCount ||
        b.score - a.score ||
        a.id.localeCompare(b.id, "en"),
    )
    .map(({ exactMatch, matchedTermCount, ...match }) => match);

  // Broad, single-use queries should show different kinds of composition.
  // Only reorder relevant neighbors; exact matches and specific queries stay lexical.
  if (
    terms.length === 1 &&
    broadUses.has(terms[0]) &&
    matches[0]?.score < 1000
  ) {
    const threshold = matches[0].score * 0.75;
    const comparable = matches.filter((match) => match.score >= threshold);
    const seen = new Set<string>();
    const representatives = comparable.filter((match) => {
      if (seen.has(match.category)) return false;
      seen.add(match.category);
      return true;
    });
    const selected = new Set(representatives.map((match) => match.id));
    return [
      ...representatives,
      ...matches.filter((match) => !selected.has(match.id)),
    ]
      .slice(0, limit)
      .map((match) => ({
        ...match,
        shortlistNote:
          "Broad-use shortlist: category variety among close lexical matches",
      }));
  }
  return matches.slice(0, limit);
}
export function discoveryGuidance(descriptor?: DiscoveryDescriptor) {
  return descriptor
    ? { basis: "editorial-inference" as const, ...descriptor }
    : null;
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
