# Roadmap

## V1 maintenance

Keep the React Bits adapter, local catalogue and direct source workflow small. Refresh pinned metadata deliberately, inspect licence changes, expand evidence-backed curation, and rerun affected integration checks after source changes. Improve static asset/import analysis when actual upstream cases justify it. Add more framework/version/browser coverage based on consumer needs. Do not turn successful sample tests into general compatibility promises.

## Next: Aceternity UI provider

Before implementation, verify official free sources, metadata, licence text, variants and installation mechanisms independently. Exclude premium material. Add an adapter implementing `Provider.discover` and `Provider.retrieve`, register it in `providers/index.ts`, and use its namespaced IDs. Keep source discovery, resolution and source-specific interpretation in the adapter. Reuse schema validation, deterministic ranking, annotations, installation planning and collision protection. If a new capability is genuinely required, extend the smallest shared data structure; do not add a speculative plugin framework.

Add provider-specific parser fixtures, integrity checks, appropriate curated notes and live integration evidence. Review cross-provider sync storage when the second provider actually exists; V1 snapshots contain one provider. This run implements no Aceternity adapter or content.

## Later: V2 visual catalogue

After both providers have reliable metadata and installation, evaluate a local visual browsing experience. Derive previews only with suitable rights, track their source hashes and invalidate them when source changes. Prefer local generation and explicit review. Avoid a hosted registry, backend, database, vector service or extra model API unless requirements later justify them.

V1 screenshots are local validation evidence. They do not constitute the V2 visual catalogue, and no V2 UI is implemented here.
