import { mkdtemp, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { ReactBitsProvider } from "../providers/react-bits.js";
import { cli, componentById, hash, json, readCatalogue } from "./lib/core.js";
await cli(async () => {
  const cache = await mkdtemp(resolve(tmpdir(), "premium-live-download-"));
  try {
    const c = componentById(await readCatalogue(), "react-bits:blur-text");
    const v = c.variants.find((v) => v.name === "TS-TW")!;
    const files = await new ReactBitsProvider(cache).retrieve(c, v);
    console.log(
      json({
        live: true,
        transport: "HTTPS immutable GitHub raw source, empty cache",
        id: c.id,
        revision: c.revision,
        files: files.map((f) => ({
          path: f.path,
          sha256: hash(f.content),
          bytes: f.content.length,
        })),
        passed: files.length === v.files.length + 1,
      }),
    );
  } finally {
    await rm(cache, { recursive: true, force: true });
  }
});
