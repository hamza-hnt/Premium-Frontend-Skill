import { z } from "zod";

export const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
export const revision = z.string().regex(/^[a-f0-9]{40}$/);
export const safePath = z
  .string()
  .min(1)
  .refine(
    (p) =>
      !p.startsWith("/") &&
      !p.includes("\\") &&
      !p.includes(":") &&
      !p.includes("\0") &&
      p.split("/").every((s) => s !== ".." && s !== "." && s !== ""),
    "Unsafe relative path",
  );
export const variantName = z.enum(["JS-CSS", "JS-TW", "TS-CSS", "TS-TW"]);
export const discoveryRole = z.enum([
  "hero",
  "background",
  "typography",
  "gallery",
  "navigation",
  "storytelling",
  "feedback",
  "input",
  "decoration",
]);
export const discoveryDescriptorSchema = z
  .object({
    roles: z.array(discoveryRole).min(1),
    terms: z.array(z.string().trim().min(1)).min(1),
    summary: z.string().trim().min(1),
  })
  .strict()
  .superRefine((descriptor, ctx) => {
    for (const key of ["roles", "terms"] as const)
      if (new Set(descriptor[key]).size !== descriptor[key].length)
        ctx.addIssue({ code: "custom", message: `Duplicate discovery ${key}` });
  });
export const discoverySchema = z
  .object({
    schemaVersion: z.literal(1),
    provider: z.string().min(1),
    components: z.record(
      z.string().regex(/^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/),
      discoveryDescriptorSchema,
    ),
  })
  .strict();
export const annotationSchema = z
  .object({
    tags: z.array(z.string()),
    suitable: z.array(z.string()),
    unsuitable: z.array(z.string()),
    selection: z.string(),
    integration: z.array(z.string()),
    accessibility: z.array(z.string()),
    reducedMotion: z.string(),
    performance: z.object({
      risk: z.enum(["low", "medium", "high", "unknown"]),
      basis: z.literal("estimate"),
      reason: z.string(),
    }),
  })
  .strict();
export const overridesSchema = z.record(
  z.string().regex(/^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/),
  annotationSchema,
);
export const fileSchema = z
  .object({
    path: safePath,
    type: z.string(),
    sha256,
    bytes: z.number().int().nonnegative(),
    repositoryPath: z.union([safePath, z.literal("unknown")]),
  })
  .strict();
export const variantSchema = z
  .object({
    name: variantName,
    upstreamName: z.string(),
    payloadPath: safePath,
    payloadSha256: sha256,
    files: z.array(fileSchema).min(1),
    dependencies: z.array(z.string()),
    registryDependencies: z.array(z.string()),
    evidence: z
      .object({
        method: z.literal("static-source-scan"),
        clientDirective: z.boolean(),
        browserApis: z.array(z.string()),
        rendering: z.array(z.string()),
        reducedMotion: z.enum(["reference-detected", "unknown"]),
        localImports: z.array(z.string()),
        unresolvedImports: z.array(z.string()),
        assetReferences: z.array(z.string()),
        peerRequirements: z.literal("unknown"),
        ssr: z.literal("unknown"),
        accessibility: z.literal("unknown"),
      })
      .strict(),
  })
  .strict();
export const componentSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/),
    provider: z.string(),
    name: z.string(),
    category: z.string(),
    description: z.string(),
    documentation: z.url(),
    preview: z.union([z.url(), z.literal("unknown")]),
    revision,
    sourceFingerprint: sha256,
    checkedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    licence: z
      .object({ name: z.string(), url: z.url(), path: safePath, sha256 })
      .strict(),
    provenance: z
      .object({ repository: z.url(), manifest: safePath, metadata: safePath })
      .strict(),
    variants: z.array(variantSchema).min(1),
    annotations: annotationSchema.nullable(),
    verification: z
      .object({
        metadata: z.literal("validated"),
        enrichment: z.enum(["curated", "unreviewed"]),
        browser: z.enum(["unverified", "verified", "stale"]),
        evidence: z.array(z.string()),
        fingerprint: sha256.optional(),
      })
      .strict(),
  })
  .strict();
export const catalogueSchema = z
  .object({
    schemaVersion: z.literal(1),
    provider: z.string(),
    revision,
    checkedDate: z.string(),
    coverage: z
      .object({
        discoveredItems: z.number().int(),
        logicalComponents: z.number().int(),
        indexedVariants: z.number().int(),
        exclusions: z.array(z.string()),
      })
      .strict(),
    components: z.array(componentSchema).min(1),
  })
  .strict()
  .superRefine((c, ctx) => {
    if (new Set(c.components.map((x) => x.id)).size !== c.components.length)
      ctx.addIssue({ code: "custom", message: "Duplicate component IDs" });
    if (
      c.coverage.logicalComponents !== c.components.length ||
      c.coverage.indexedVariants !==
        c.components.reduce((n, x) => n + x.variants.length, 0)
    )
      ctx.addIssue({
        code: "custom",
        message: "Coverage counts do not match catalogue",
      });
    for (const x of c.components) {
      if (x.revision !== c.revision || x.provider !== c.provider)
        ctx.addIssue({
          code: "custom",
          message: "Component provenance does not match catalogue",
        });
      if (new Set(x.variants.map((v) => v.name)).size !== x.variants.length)
        ctx.addIssue({ code: "custom", message: "Duplicate variants" });
      if (
        x.verification.browser === "verified" &&
        (x.verification.fingerprint !== x.sourceFingerprint ||
          !x.verification.evidence.length)
      )
        ctx.addIssue({
          code: "custom",
          message: "Browser verification requires current evidence",
        });
    }
  });
export type Catalogue = z.infer<typeof catalogueSchema>;
export type Component = z.infer<typeof componentSchema>;
export type Variant = z.infer<typeof variantSchema>;
export type Annotation = z.infer<typeof annotationSchema>;
export type Discovery = z.infer<typeof discoverySchema>;
export type DiscoveryDescriptor = z.infer<typeof discoveryDescriptorSchema>;
export type DiscoveryRole = z.infer<typeof discoveryRole>;
