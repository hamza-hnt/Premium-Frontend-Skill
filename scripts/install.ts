import { getProvider } from "../providers/index.js";
import {
  args,
  cli,
  componentById,
  json,
  readCatalogue,
  required,
} from "./lib/core.js";
import {
  applyInstallation,
  planInstallation,
  publicPlan,
} from "./lib/install.js";
await cli(async () => {
  const a = args(
    ["id", "project", "variant", "dir"],
    ["dry-run", "apply", "json", "offline"],
  );
  if (Boolean(a.apply) === Boolean(a["dry-run"]))
    throw new Error("Choose exactly one explicit action: --dry-run or --apply");
  const component = componentById(await readCatalogue(), required(a.id, "id"));
  const options = {
    project: required(a.project, "project"),
    variant: a.variant as string | undefined,
    dir: a.dir as string | undefined,
  };
  const result = a.apply
    ? await applyInstallation(
        getProvider(component.provider),
        component,
        options,
        Boolean(a.offline),
      )
    : publicPlan(await planInstallation(component, options));
  console.log(json(result));
  if (result.conflicts.length) process.exitCode = 2;
});
