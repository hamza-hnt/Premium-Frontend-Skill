import { resolve } from "node:path";
import { args, cli, json, ROOT } from "./lib/core.js";
import { bundle } from "./lib/bundle.js";
await cli(async () => {
  const a = args(["output"]);
  console.log(
    json(
      await bundle(
        (a.output as string) ??
          resolve(ROOT, "artifacts/premium-frontend-skill.tar.gz"),
      ),
    ),
  );
});
