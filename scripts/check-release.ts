import { appendFile } from "node:fs/promises";
import { ROOT, args, cli, json, required } from "./lib/core.js";
import { checkRelease } from "./lib/release.js";

await cli(async () => {
  const result = await checkRelease(ROOT, required(args(["tag"]).tag, "tag"));
  if (process.env.GITHUB_OUTPUT)
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `version=${result.version}\narchive=${result.archive}\n`,
    );
  console.log(json(result));
});
