import { cli, json } from "./lib/core.js";
import { buildInstaller, packInstaller } from "./lib/installer-package.js";

await cli(async () => {
  const built = await buildInstaller();
  const packed = await packInstaller(built.directory);
  console.log(json({ ...built, ...packed, published: false }));
});
