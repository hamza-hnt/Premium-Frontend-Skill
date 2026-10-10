import { resolve } from "node:path";
import { getProvider } from "../providers/index.js";
import { synchronize } from "./lib/sync.js";
import { args, cli, json, ROOT, readJson } from "./lib/core.js";
await cli(async () => {
  const a = args(["provider", "revision", "checked-date"], ["offline"]);
  const provider = getProvider(
    (a.provider as string | undefined) ?? "react-bits",
  );
  const date =
    (a["checked-date"] as string | undefined) ??
    new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))
    throw new Error("Invalid --checked-date (use YYYY-MM-DD)");
  console.log(
    json(
      await synchronize(
        provider,
        {
          revision: a.revision as string | undefined,
          checkedDate: date,
          offline: Boolean(a.offline),
        },
        resolve(ROOT, "registry/components.json"),
        await readJson(resolve(ROOT, "registry/overrides.json")),
        await readJson(resolve(ROOT, "registry/discovery.json")),
      ),
    ),
  );
});
